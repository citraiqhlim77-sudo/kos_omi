import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Mock next/cache, next/navigation & auth agar Server Actions & RBAC dapat diuji langsung di Node
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: any) => fn,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {},
  CredentialsSignin: class CredentialsSignin extends Error {
    code = '';
  },
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => ({
    user: {
      id: 'usr-admin-01',
      name: 'Ibu Yulastri (Admin)',
      email: 'admin@kosomi.id',
      role: 'ADMIN',
      isActive: true,
    },
  })),
  signIn: vi.fn(async () => ({})),
  signOut: vi.fn(async () => ({})),
}));

const testStorePath = path.join(os.tmpdir(), `kos-omi-e2e-test-${Date.now()}.json`);

describe('End-to-End Sinkronisasi Persisten 5 Role Kos Omi', () => {
  beforeAll(() => {
    process.env.KOS_OMI_STORE_PATH = testStorePath;
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
    (global as any).__kosOmiUnifiedStore = undefined;
    (global as any).__kosOmiStoreMtime = undefined;
  });

  afterAll(() => {
    if (fs.existsSync(testStorePath)) {
      try {
        fs.unlinkSync(testStorePath);
      } catch {
        // ignore
      }
    }
    delete process.env.KOS_OMI_STORE_PATH;
  });

  it('menyimpan akun baru secara persisten lintas worker di Admin & Pengelola dan menjalankan siklus penuh Reservasi -> Lunas -> Check-in -> Check-out -> Hapus', async () => {
    const { registerAction, changeUserPasswordAction } = await import('@/actions/auth');
    const { updateTenantProfileAction } = await import('@/actions/billing');
    const {
      fetchAdminUsersAction,
      fetchAuditLogsAction,
      adminUpdateUserPasswordAction,
      toggleUserStatusAction,
      deleteUserAction,
    } = await import('@/actions/admin');
    const {
      fetchRegisteredCalonAccountsAction,
      fetchCheckinCandidatesAction,
      fetchAllTenantsAction,
      processCheckinAction,
      processCheckoutAction,
    } = await import('@/actions/tenancy');
    const { verifyCredentials } = await import('@/lib/auth/credentials');
    const {
      dbCreateReservation,
      dbApproveReservation,
      dbSubmitPaymentConfirmation,
      dbSettlePayment,
      dbGetRoomByCode,
    } = await import('@/server/db');
    const { getSuccessfulTransactions } = await import('@/lib/reports/revenue');

    // 1. DAFTAR AKUN BARU (CALON PENGHUNI)
    const regRes = await registerAction({
      name: 'Nadia Safitri',
      email: 'nadia.safitri@uinib.ac.id',
      phone: '081277889900',
      password: 'Password123!',
    });
    expect(regRes.success).toBe(true);
    expect(regRes.user?.email).toBe('nadia.safitri@uinib.ac.id');

    // Simulasikan pergantian worker Next.js / restart proses (kosongkan RAM)
    (global as any).__kosOmiUnifiedStore = undefined;
    (global as any).__kosOmiStoreMtime = undefined;

    // Pastikan akun yang baru daftar TERSIMPAN di Admin, Pengelola, dan Auth Login!
    const adminUsersAfterReg = await fetchAdminUsersAction();
    const nadiaInAdmin = adminUsersAfterReg.find(
      (u) => u.email === 'nadia.safitri@uinib.ac.id'
    );
    expect(nadiaInAdmin).toBeDefined();
    expect(nadiaInAdmin?.role).toBe('CALON_PENGHUNI');
    expect((nadiaInAdmin as any)?.plainPassword).toBeUndefined();
    expect(nadiaInAdmin?.passwordHashPreview?.startsWith('$2')).toBe(true);

    // Uji Reset Kata Sandi oleh Admin (tanpa pernah membocorkan plainPassword)
    const resetRes = await adminUpdateUserPasswordAction(nadiaInAdmin!.id, 'SandiBaru99!');
    expect(resetRes.success).toBe(true);
    expect((resetRes.user as any)?.plainPassword).toBeUndefined();
    expect((await verifyCredentials('nadia.safitri@uinib.ac.id', 'Password123!')).ok).toBe(false);
    expect((await verifyCredentials('nadia.safitri@uinib.ac.id', 'SandiBaru99!')).ok).toBe(true);
    await adminUpdateUserPasswordAction(nadiaInAdmin!.id, 'Password123!');

    const pengelolaCalonAfterReg = await fetchRegisteredCalonAccountsAction();
    const nadiaInPengelola = pengelolaCalonAfterReg.accounts.find(
      (a) => a.email === 'nadia.safitri@uinib.ac.id'
    );
    expect(nadiaInPengelola).toBeDefined();
    expect(nadiaInPengelola?.reservationStatus).toBe('BELUM_RESERVASI');

    const loginCheck = await verifyCredentials('nadia.safitri@uinib.ac.id', 'Password123!');
    expect(loginCheck.ok).toBe(true);

    const auditAfterReg = await fetchAuditLogsAction();
    expect(auditAfterReg.some((l) => l.action === 'REGISTER_USER')).toBe(true);

    // 2. AJUKAN RESERVASI KAMAR NO. 17 (Salah satu dari 10 kamar kosong Kos Omi 2026)
    const rsv = await dbCreateReservation({
      roomCode: '17',
      checkInDate: '2026-11-28',
      durationMonths: 6,
      fullName: 'Nadia Safitri',
      nik: '2314010099',
      phone: '081277889900',
      email: 'nadia.safitri@uinib.ac.id',
      occupation: 'FEBI UIN [Sewa Sendiri 1 Kamar Penuh - Rp 5.000.000]',
      emergencyName: 'Bapak Hendra',
      emergencyPhone: '081355667788',
      emergencyRelation: 'Ayah',
      ktpUrl: '/rooms/kamar-17.png',
      agreedToRules: true,
    });
    expect(rsv.status).toBe('PENDING_REVIEW');
    expect(rsv.userId).toBe(regRes.user?.id);
    expect((await dbGetRoomByCode('17'))?.status).toBe('DIPESAN');

    // Cek Pengelola melihat perubahan tahap akun Calon Penghuni -> PENDING_REVIEW Kamar 17
    const calonStage2 = await fetchRegisteredCalonAccountsAction();
    const nadiaStage2 = calonStage2.accounts.find((a) => a.email === 'nadia.safitri@uinib.ac.id');
    expect(nadiaStage2?.reservationStatus).toBe('PENDING_REVIEW');
    expect(nadiaStage2?.roomCode).toBe('17');

    // 3. PENGELOLA SETUJUI -> CALON KONFIRMASI TRANSFER -> PENGELOLA VALIDASI LUNAS
    const approved = await dbApproveReservation(rsv.code, 'Berkas KTM lengkap');
    expect(approved?.status).toBe('APPROVED');
    const invCode = approved!.payment!.invoiceCode;

    const confirmPay = await dbSubmitPaymentConfirmation(invCode, 'dana');
    expect(confirmPay.payment?.status).toBe('PENDING');

    const settled = await dbSettlePayment(invCode, 'DANA');
    expect(settled.success).toBe(true);
    expect(settled.reservation?.status).toBe('PAID');

    // Simulasikan worker baru lagi — cek Keuangan & Antrean Check-in Pengelola
    (global as any).__kosOmiUnifiedStore = undefined;
    (global as any).__kosOmiStoreMtime = undefined;

    const financeTxs = getSuccessfulTransactions();
    expect(financeTxs.some((t) => t.invoiceNumber === invCode && t.grossAmount === 5000000)).toBe(
      true
    );

    const checkinQueue = await fetchCheckinCandidatesAction();
    const nadiaCand = checkinQueue.candidates.find((c) => c.reservationCode === rsv.code);
    expect(nadiaCand).toBeDefined();

    // Sebelum Check-in, Nadia belum masuk daftar Penghuni Aktif (88 penghuni tetap Kos Omi sudah ada)
    const beforeCheckinTenants = (await fetchAllTenantsAction()).tenants;
    expect(beforeCheckinTenants.length).toBe(88);
    expect(
      beforeCheckinTenants.some((t) => t.userEmail === 'nadia.safitri@uinib.ac.id')
    ).toBe(false);

    // 4. PROSES CHECK-IN OLEH PENGELOLA
    const checkinRes = await processCheckinAction(nadiaCand!.id);
    expect(checkinRes.success).toBe(true);
    expect((await dbGetRoomByCode('17'))?.status).toBe('TERISI');
    expect((await fetchCheckinCandidatesAction()).candidates.length).toBe(0);

    const activeTenants = (await fetchAllTenantsAction()).tenants;
    const nadiaTenancy = activeTenants.find((t) => t.userEmail === 'nadia.safitri@uinib.ac.id');
    expect(nadiaTenancy).toBeDefined();
    expect(nadiaTenancy?.roomCode).toBe('17');

    // Role Nadia di Admin otomatis berubah menjadi PENGHUNI di Kamar 17
    const adminAfterCheckin = await fetchAdminUsersAction();
    const nadiaAsPenghuni = adminAfterCheckin.find(
      (u) => u.email === 'nadia.safitri@uinib.ac.id'
    );
    expect(nadiaAsPenghuni?.role).toBe('PENGHUNI');
    expect(nadiaAsPenghuni?.roomCode).toBe('17');

    // 5. PROSES CHECK-OUT OLEH PENGELOLA
    const checkoutRes = await processCheckoutAction(nadiaTenancy!.id);
    expect(checkoutRes.success).toBe(true);
    expect((await dbGetRoomByCode('17'))?.status).toBe('TERSEDIA');
    expect(
      (await fetchAllTenantsAction()).tenants.some(
        (t) => t.userEmail === 'nadia.safitri@uinib.ac.id'
      )
    ).toBe(false);

    // 5b. Pastikan kamar berdua (contoh Kamar 4: Dela & Febri) tetap TERISI jika baru 1 anak check-out
    const room4Tenants = (await fetchAllTenantsAction()).tenants.filter((t) => t.roomCode === '4');
    expect(room4Tenants.length).toBe(2);
    const delaOut = await processCheckoutAction(room4Tenants[0].id);
    expect(delaOut.success).toBe(true);
    expect((await dbGetRoomByCode('4'))?.status).toBe('TERISI');
    const febriOut = await processCheckoutAction(room4Tenants[1].id);
    expect(febriOut.success).toBe(true);
    expect((await dbGetRoomByCode('4'))?.status).toBe('TERSEDIA');

    // 5c. OPSI 1: Penghuni tetap (contoh Kamar 02: Maulidia) mengganti email awal @kosomi.id ke Gmail pribadi + sandi baru
    const authMod = await import('@/auth');
    vi.mocked(authMod.auth as any).mockResolvedValueOnce({
      user: {
        id: 'usr-k02-1-maulidia',
        name: 'Maulidia',
        email: 'maulidia.k02@kosomi.id',
        role: 'PENGHUNI',
        isActive: true,
      },
    });
    const profRes = await updateTenantProfileAction({
      previousEmail: 'maulidia.k02@kosomi.id',
      name: 'Maulidia Putri',
      email: 'maulidia.putri@gmail.com',
      phone: '081233445566',
      emergencyContact: '081399887766 (Ibu)',
    });
    expect(profRes.success).toBe(true);
    expect(profRes.profile?.email).toBe('maulidia.putri@gmail.com');

    vi.mocked(authMod.auth as any).mockResolvedValueOnce({
      user: {
        id: 'usr-k02-1-maulidia',
        name: 'Maulidia Putri',
        email: 'maulidia.k02@kosomi.id',
        role: 'PENGHUNI',
        isActive: true,
      },
    });
    const pwChangeRes = await changeUserPasswordAction({
      email: 'maulidia.putri@gmail.com',
      newPassword: 'SandiMaulidia88!',
    });
    expect(pwChangeRes.success).toBe(true);

    // Pastikan Maulidia sekarang login pakai Gmail pribadi & sandi pribadinya, serta sinkron di Admin & Pengelola
    expect((await verifyCredentials('maulidia.putri@gmail.com', 'SandiMaulidia88!')).ok).toBe(true);
    expect((await verifyCredentials('maulidia.putri@gmail.com', 'Password123!')).ok).toBe(false);
    const maulidiaAdmin = (await fetchAdminUsersAction()).find((u) => u.id === 'usr-k02-1-maulidia');
    expect(maulidiaAdmin?.email).toBe('maulidia.putri@gmail.com');
    expect(maulidiaAdmin?.phone).toBe('081233445566');
    const maulidiaTenancy = (await fetchAllTenantsAction()).tenants.find(
      (t) => t.userId === 'usr-k02-1-maulidia'
    );
    expect(maulidiaTenancy?.userEmail).toBe('maulidia.putri@gmail.com');
    expect(maulidiaTenancy?.userPhone).toBe('081233445566');

    // 6. NONAKTIFKAN & HAPUS PERMANEN AKUN OLEH ADMIN
    await toggleUserStatusAction(nadiaAsPenghuni!.id);
    const delRes = await deleteUserAction(nadiaAsPenghuni!.id);
    expect(delRes.success).toBe(true);

    // Simulasikan restart server — akun yang dihapus TIDAK PERNAH muncul lagi
    (global as any).__kosOmiUnifiedStore = undefined;
    (global as any).__kosOmiStoreMtime = undefined;
    const adminAfterDelete = await fetchAdminUsersAction();
    expect(
      adminAfterDelete.some((u) => u.email === 'nadia.safitri@uinib.ac.id')
    ).toBe(false);
  }, 20000);

  it('menolak akses URL tanpa login ke /login dan menolak akses lintas-role ke /403', async () => {
    const authMod = await import('@/auth');
    const { requireStrictPortalRole } = await import('@/lib/auth-server');

    // 1. Belum login -> wajib diarahkan ke /login
    vi.mocked(authMod.auth as any).mockResolvedValueOnce(null);
    await expect(requireStrictPortalRole('ADMIN')).rejects.toThrow('NEXT_REDIRECT:/login');

    // 2. Login sebagai CALON_PENGHUNI mencoba buka /admin/dashboard atau /keuangan/laporan -> wajib ditolak ke /403
    vi.mocked(authMod.auth as any).mockResolvedValueOnce({
      user: {
        id: 'usr-calon-zahra',
        name: 'Zahra Aulia Putri',
        email: 'zahra.aulia@uinib.ac.id',
        role: 'CALON_PENGHUNI',
        isActive: true,
      },
    });
    await expect(requireStrictPortalRole('ADMIN')).rejects.toThrow('NEXT_REDIRECT:/403');

    vi.mocked(authMod.auth as any).mockResolvedValueOnce({
      user: {
        id: 'usr-calon-zahra',
        name: 'Zahra Aulia Putri',
        email: 'zahra.aulia@uinib.ac.id',
        role: 'CALON_PENGHUNI',
        isActive: true,
      },
    });
    await expect(requireStrictPortalRole('KEUANGAN')).rejects.toThrow('NEXT_REDIRECT:/403');
  });
});
