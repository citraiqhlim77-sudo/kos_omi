import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Mock next/cache & auth-server agar Server Actions dapat diuji langsung di Node
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: any) => fn,
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
    const { registerAction } = await import('@/actions/auth');
    const {
      fetchAdminUsersAction,
      fetchAuditLogsAction,
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

    // 2. AJUKAN RESERVASI KAMAR NO. 5
    const rsv = await dbCreateReservation({
      roomCode: '5',
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
      ktpUrl: '/rooms/kamar-5.png',
      agreedToRules: true,
    });
    expect(rsv.status).toBe('PENDING_REVIEW');
    expect(rsv.userId).toBe(regRes.user?.id);
    expect((await dbGetRoomByCode('5'))?.status).toBe('DIPESAN');

    // Cek Pengelola melihat perubahan tahap akun Calon Penghuni -> PENDING_REVIEW Kamar 5
    const calonStage2 = await fetchRegisteredCalonAccountsAction();
    const nadiaStage2 = calonStage2.accounts.find((a) => a.email === 'nadia.safitri@uinib.ac.id');
    expect(nadiaStage2?.reservationStatus).toBe('PENDING_REVIEW');
    expect(nadiaStage2?.roomCode).toBe('5');

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

    // Sebelum Check-in, daftar Penghuni Aktif masih kosong & role Nadia masih CALON_PENGHUNI
    expect((await fetchAllTenantsAction()).tenants.length).toBe(0);

    // 4. PROSES CHECK-IN OLEH PENGELOLA
    const checkinRes = await processCheckinAction(nadiaCand!.id);
    expect(checkinRes.success).toBe(true);
    expect((await dbGetRoomByCode('5'))?.status).toBe('TERISI');
    expect((await fetchCheckinCandidatesAction()).candidates.length).toBe(0);

    const activeTenants = (await fetchAllTenantsAction()).tenants;
    expect(activeTenants.length).toBe(1);
    expect(activeTenants[0].roomCode).toBe('5');

    // Role Nadia di Admin otomatis berubah menjadi PENGHUNI di Kamar 5
    const adminAfterCheckin = await fetchAdminUsersAction();
    const nadiaAsPenghuni = adminAfterCheckin.find(
      (u) => u.email === 'nadia.safitri@uinib.ac.id'
    );
    expect(nadiaAsPenghuni?.role).toBe('PENGHUNI');
    expect(nadiaAsPenghuni?.roomCode).toBe('5');

    // 5. PROSES CHECK-OUT OLEH PENGELOLA
    const checkoutRes = await processCheckoutAction(activeTenants[0].id);
    expect(checkoutRes.success).toBe(true);
    expect((await dbGetRoomByCode('5'))?.status).toBe('TERSEDIA');
    expect((await fetchAllTenantsAction()).tenants.length).toBe(0);

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
  });
});
