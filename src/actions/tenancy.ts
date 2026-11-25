'use server';

import { TenancyRecord, CheckinCandidate } from '@/types/tenancy';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  dbUpdateRoomStatus,
  dbAddAuditLog,
  dbGetReservationByCode,
  dbGetReservations,
} from '@/server/db';
import { findUserById, findUserByEmail } from '@/lib/auth-store';
import { requireRole } from '@/lib/auth-server';
import { db as drizzleDb, schema } from '@/db';
import { eq } from '@/db/drizzle';
import {
  dispatchCheckinSuccess,
  dispatchCheckoutSuccess,
} from '@/lib/notify/dispatch';

// IN-MEMORY GLOBAL STATE
declare global {
  // eslint-disable-next-line no-var
  var __kosOmiTenancies: TenancyRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiCheckinCandidates: CheckinCandidate[] | undefined;
}

// Data hunian aktif & antrean check-in awal dikosongkan agar tidak pernah membuat ulang data yang sudah check-out
const initialTenancies: TenancyRecord[] = [];
const initialCheckinCandidates: CheckinCandidate[] = [];

function getTenanciesStore(): TenancyRecord[] {
  if (!global.__kosOmiTenancies || (global as any).__kosOmiTenanciesVer !== 20) {
    global.__kosOmiTenancies = [...initialTenancies];
    (global as any).__kosOmiTenanciesVer = 20;
  }
  return global.__kosOmiTenancies;
}

function getCheckinCandidatesStore(): CheckinCandidate[] {
  if (!global.__kosOmiCheckinCandidates || (global as any).__kosOmiCandidatesVer !== 20) {
    global.__kosOmiCheckinCandidates = [...initialCheckinCandidates];
    (global as any).__kosOmiCandidatesVer = 20;
  }
  return global.__kosOmiCheckinCandidates;
}

// 1. Fetch All Active Tenants (Hanya penghuni dengan status AKTIF agar penghuni yang sudah Check-Out hilang permanen)
export async function fetchAllTenantsAction(): Promise<{
  success: boolean;
  tenants: TenancyRecord[];
}> {
  const store = getTenanciesStore();
  const activeTenants = store.filter((t) => t.status === 'AKTIF');
  return { success: true, tenants: activeTenants };
}

// 2. Fetch Single Tenant by ID
export async function fetchTenantByIdAction(
  id: string
): Promise<{
  success: boolean;
  tenant: TenancyRecord | null;
}> {
  const store = getTenanciesStore();
  const found = store.find((t) => t.id === id || t.userId === id);
  return { success: true, tenant: found || null };
}

// 3. Fetch Check-in Candidates (Hanya reservasi yang benar-benar berstatus PAID dan BELUM Check-In / Check-Out)
export async function fetchCheckinCandidatesAction(): Promise<{
  success: boolean;
  candidates: CheckinCandidate[];
}> {
  const store = getCheckinCandidatesStore();
  const tenancies = getTenanciesStore();

  try {
    const serverReservations = await dbGetReservations();

    // Hapus kandidat dari store apabila reservasinya sudah CHECKED_IN, CHECKED_OUT, CANCELLED, REJECTED, atau belum PAID
    for (let i = store.length - 1; i >= 0; i--) {
      const cand = store[i];
      const matchedRes = serverReservations.find(
        (r) => r.code === cand.reservationCode || r.id === cand.id
      );
      const hasCheckedInOrOutTenancy = tenancies.some(
        (t) =>
          (t.userId === cand.userId ||
            t.userEmail.toLowerCase() === cand.userEmail.toLowerCase()) &&
          t.roomCode === cand.roomCode &&
          (t.status === 'AKTIF' || t.status === 'SELESAI')
      );
      if (
        cand.status !== 'LUNAS' ||
        hasCheckedInOrOutTenancy ||
        (matchedRes && matchedRes.status !== 'PAID')
      ) {
        store.splice(i, 1);
      }
    }

    // Tambahkan reservasi yang baru saja berstatus PAID (dan belum pernah Check-In / Check-Out)
    for (const res of serverReservations) {
      if (res.status === 'PAID') {
        const hasTenancyRecord = tenancies.some(
          (t) =>
            (t.userId === res.userId ||
              t.userEmail.toLowerCase() === res.userEmail.toLowerCase()) &&
            t.roomCode === res.roomCode &&
            (t.status === 'AKTIF' || t.status === 'SELESAI')
        );
        if (hasTenancyRecord) continue;

        const alreadyInStore = store.some(
          (c) => c.reservationCode === res.code || c.id === res.id
        );
        if (!alreadyInStore) {
          const roomNum = parseInt(res.roomCode.replace(/[^0-9]/g, '') || '1', 10);
          const floorNum = roomNum <= 33 ? 1 : 2;
          store.push({
            id: res.id,
            reservationCode: res.code,
            userId: res.userId,
            userName: res.userName,
            userPhone: res.userPhone,
            userEmail: res.userEmail,
            userNik: res.userNik,
            roomId: res.roomId,
            roomCode: res.roomCode,
            roomFloor: floorNum,
            roomType: 'STANDAR_AC',
            startDate: res.checkInDate,
            durationMonths: res.durationMonths,
            bookingAmount: res.monthlyPrice,
            depositAmount: res.depositAmount,
            totalPaid: res.totalInitialPayment,
            invoiceCode: res.payment?.invoiceCode || `INV-${res.code.replace('RSV-', '')}`,
            paymentMethod: res.payment?.paymentMethod || 'QRIS / Transfer Bank',
            paidAt: res.payment?.paidAt || new Date().toISOString(),
            idCardUrl: res.ktpUrl || '/rooms/kamar-1.png',
            notes: res.adminNotes || 'Reservasi lunas diverifikasi',
            status: 'LUNAS',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Gagal menyinkronkan kandidat check-in dari database reservasi:', err);
  }

  return {
    success: true,
    candidates: store.filter((c) => c.status === 'LUNAS'),
  };
}

// 4. Process Check-in (PRD Bab 5.F & Bab 11 Task 2.9)
export async function checkInTenant(
  reservationId: string
): Promise<{
  success: boolean;
  message?: string;
  newTenancy?: TenancyRecord;
  error?: string;
}> {
  const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);
  const cleanId = reservationId.trim();

  // Pastikan data kandidat reservasi lunas dari database telah tersinkron
  await fetchCheckinCandidatesAction();

  const candidates = getCheckinCandidatesStore();
  let candidate = candidates.find(
    (c) => c.id === cleanId || c.reservationCode === cleanId || c.userId === cleanId
  );

  // Jika belum di-cache, cari langsung ke database reservasi server
  if (!candidate) {
    const resDb = await dbGetReservationByCode(cleanId);
    if (resDb && (resDb.status === 'PAID' || (resDb.status as string) === 'LUNAS')) {
      const floorNum = parseInt(resDb.roomCode.replace(/[^0-9]/g, '')[0] || '1', 10);
      candidate = {
        id: resDb.id,
        reservationCode: resDb.code,
        userId: resDb.userId,
        userName: resDb.userName,
        userPhone: resDb.userPhone,
        userEmail: resDb.userEmail,
        userNik: resDb.userNik,
        roomId: resDb.roomId,
        roomCode: resDb.roomCode,
        roomFloor: floorNum,
        roomType: 'STANDAR_AC',
        startDate: resDb.checkInDate,
        durationMonths: resDb.durationMonths,
        bookingAmount: resDb.monthlyPrice,
        depositAmount: resDb.depositAmount,
        totalPaid: resDb.totalInitialPayment,
        invoiceCode: `INV-${resDb.code.replace('RSV-', '')}`,
        paymentMethod: 'Midtrans Snap',
        paidAt: resDb.payment?.paidAt || new Date().toISOString(),
        idCardUrl:
          resDb.ktpUrl ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        status: 'LUNAS',
      };
      candidates.push(candidate);
    }
  }

  if (!candidate) {
    return {
      success: false,
      error: `Data reservasi ${reservationId} calon penghuni tidak ditemukan.`,
    };
  }

  // A. Periksa status pembayaran LUNAS (atau sudah CHECKIN untuk idempotensi)
  if (candidate.status !== 'LUNAS' && candidate.status !== 'CHECKIN') {
    return {
      success: false,
      error: `Check-in tidak dapat diproses karena status pembayaran belum LUNAS (Status saat ini: ${candidate.status}).`,
    };
  }

  // B. Tanggal hari ini untuk pencatatan check-in
  const today = new Date().toISOString().split('T')[0];

  // Hitung tanggal akhir kontrak (default 6 bulan / 1 semester)
  const checkInDateObj = new Date();
  const contractEndDateObj = new Date(checkInDateObj);
  contractEndDateObj.setMonth(contractEndDateObj.getMonth() + (candidate.durationMonths || 6));
  const contractEndDate = contractEndDateObj.toISOString().split('T')[0];

  const tenancies = getTenanciesStore();

  // C. Periksa ketersediaan kamar berdasarkan kapasitas kamar (capacity = 2 orang):
  // - Jangan blokir jika record AKTIF di tenancies adalah milik pengguna / reservasi yang sama.
  // - Hanya blokir jika jumlah penghuni aktif LAIN di kamar tersebut sudah mencapai kapasitas maksimal (>= 2 orang).
  const ROOM_MAX_CAPACITY = 2;
  const activeInRoom = tenancies.filter(
    (t) => t.roomCode === candidate.roomCode && t.status === 'AKTIF'
  );

  const isSameTenant = (t: TenancyRecord) =>
    t.userId === candidate.userId ||
    t.userEmail.toLowerCase().trim() === candidate.userEmail.toLowerCase().trim() ||
    t.userName.toLowerCase().trim() === candidate.userName.toLowerCase().trim();

  const existingSameUserTenancy = activeInRoom.find(isSameTenant);
  const otherActiveTenants = activeInRoom.filter((t) => !isSameTenant(t));

  if (!existingSameUserTenancy && otherActiveTenants.length >= ROOM_MAX_CAPACITY) {
    const occupantNames = otherActiveTenants.map((t) => t.userName).join(' & ');
    return {
      success: false,
      error: `Kamar ${candidate.roomCode} sudah mencapai kapasitas maksimal (${ROOM_MAX_CAPACITY} orang: ${occupantNames}). Pastikan penghuni sebelumnya telah menyelesaikan check-out terlebih dahulu.`,
    };
  }

  // D. 1) Ubah status kandidat menjadi CHECKIN & reservasi menjadi CHECKED_IN (agar hilang dari antrean /pengelola/checkin)
  candidate.status = 'CHECKIN';
  const candIdx = candidates.findIndex(
    (c) => c.id === candidate!.id || c.reservationCode === candidate!.reservationCode
  );
  if (candIdx !== -1) {
    candidates.splice(candIdx, 1);
  }

  if ((global as any).__kosOmiDbState && Array.isArray((global as any).__kosOmiDbState.reservations)) {
    const rsvIdx = (global as any).__kosOmiDbState.reservations.findIndex(
      (r: any) => r.code === candidate.reservationCode || r.id === candidate.id
    );
    if (rsvIdx !== -1) {
      (global as any).__kosOmiDbState.reservations[rsvIdx].status = 'CHECKED_IN';
      (global as any).__kosOmiDbState.reservations[rsvIdx].updatedAt = new Date().toISOString();
    }
  }

  // E. 2) Pastikan data tenancies untuk penghuni dan kamar tersebut berstatus AKTIF
  let newTenancy: TenancyRecord;
  if (existingSameUserTenancy) {
    existingSameUserTenancy.checkInDate = today;
    existingSameUserTenancy.contractEndDate = contractEndDate;
    existingSameUserTenancy.status = 'AKTIF';
    existingSameUserTenancy.checkOutDate = null;
    newTenancy = existingSameUserTenancy;
  } else {
    newTenancy = {
      id: `ten-${Date.now()}`,
      userId: candidate.userId,
      userName: candidate.userName,
      userEmail: candidate.userEmail,
      userPhone: candidate.userPhone,
      userNik: candidate.userNik,
      idCardUrl: candidate.idCardUrl,
      roomId: candidate.roomId,
      roomCode: candidate.roomCode,
      roomFloor: candidate.roomFloor,
      roomType: candidate.roomType,
      monthlyPrice: candidate.bookingAmount,
      depositAmount: candidate.depositAmount,
      checkInDate: today,
      contractEndDate,
      checkOutDate: null,
      dueDay: 5,
      status: 'AKTIF',
      depositRefunded: false,
      unpaidBillsCount: 0,
      totalUnpaidAmount: 0,
      unpaidInvoices: [],
      pastInvoices: [
        {
          id: `inv-past-${Date.now()}`,
          invoiceNumber: candidate.invoiceCode,
          periodMonth: 'Sewa Semester Pertama (6 Bulan)',
          amount: candidate.totalPaid,
          paidAt: candidate.paidAt,
          paymentMethod: candidate.paymentMethod,
          status: 'LUNAS',
        },
      ],
      emergencyContact: {
        name: 'Kontak Darurat Terdaftar',
        relation: 'Keluarga',
        phone: candidate.userPhone,
      },
    };
    tenancies.unshift(newTenancy);
  }

  // Sinkronkan ke Portal Penghuni (global.__kosOmiBillingState)
  if (!global.__kosOmiBillingState) {
    global.__kosOmiBillingState = { bills: [], profiles: [] };
  }
  global.__kosOmiBillingState.profiles.unshift({
    id: candidate.userId,
    name: candidate.userName,
    email: candidate.userEmail,
    phone: candidate.userPhone,
    nik: candidate.userNik,
    occupation: 'Mahasiswi UIN Imam Bonjol Padang',
    roomCode: candidate.roomCode,
    checkInDate: newTenancy.checkInDate,
    tenancyEnd: newTenancy.contractEndDate,
    emergencyContactName: 'Orang Tua / Wali',
    emergencyContactPhone: candidate.userPhone,
    emergencyContactRelation: 'Orang Tua',
    monthlyRent: candidate.bookingAmount,
    avatarUrl: candidate.idCardUrl,
  });
  global.__kosOmiBillingState.bills.unshift({
    id: `bill-init-${Date.now()}`,
    invoiceCode: candidate.invoiceCode,
    periodMonth: 'Sewa Semester Pertama (Booking Awal)',
    periodKey: today.substring(0, 7),
    year: new Date().getFullYear(),
    roomCode: candidate.roomCode,
    tenantName: candidate.userName,
    tenantEmail: candidate.userEmail,
    tenantPhone: candidate.userPhone,
    dueDate: newTenancy.checkInDate,
    rentAmount: candidate.totalPaid,
    totalAmount: candidate.totalPaid,
    status: 'LUNAS',
    paymentMethod: candidate.paymentMethod,
    paidAt: candidate.paidAt,
    createdAt: candidate.paidAt,
    notes: `Pembayaran sewa awal Kamar No. ${candidate.roomCode} telah lunas.`,
  });

  // Catat Notifikasi Check-in ke Admin Monitoring Notifikasi
  if (!(global as any).__kosOmiNotifLogs) {
    (global as any).__kosOmiNotifLogs = [];
  }
  const nowIso = new Date().toISOString();
  (global as any).__kosOmiNotifLogs.unshift({
    id: `ntf-checkin-${Date.now()}`,
    recipient: candidate.userPhone,
    recipientName: candidate.userName,
    channel: 'WHATSAPP',
    template: `selamat_datang_checkin_kamar_${candidate.roomCode}_aktif`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });

  // F. 3) Ubah status kamar menjadi TERISI (OCCUPIED)
  await dbUpdateRoomStatus(candidate.roomCode, 'TERISI');

  // G. 4) Ubah peran pengguna (CALON_PENGHUNI -> PENGHUNI) di seluruh store
  const user = findUserById(candidate.userId) || findUserByEmail(candidate.userEmail);
  if (user) {
    user.role = 'PENGHUNI';
    user.roomCode = candidate.roomCode;
  }
  if ((global as any).__kosOmiAdminUsers && Array.isArray((global as any).__kosOmiAdminUsers)) {
    const adminUser = (global as any).__kosOmiAdminUsers.find(
      (u: any) =>
        u.id === candidate.userId ||
        u.email?.toLowerCase().trim() === candidate.userEmail.toLowerCase().trim()
    );
    if (adminUser) {
      adminUser.role = 'PENGHUNI';
      adminUser.roomCode = candidate.roomCode;
    }
  }

  // H. Catat ke database Neon PostgreSQL Drizzle ORM secara berurutan (tanpa db.transaction) jika terhubung
  try {
    if (drizzleDb.isAvailable && drizzleDb.db) {
      await drizzleDb.db
        .insert(schema.tenancies)
        .values({
          userId: candidate.userId,
          roomId: candidate.roomId,
          checkInDate: today,
          contractEndDate,
          monthlyPrice: candidate.bookingAmount,
          dueDay: 5,
          status: 'AKTIF',
        })
        .onConflictDoNothing();

      await drizzleDb.db
        .update(schema.rooms)
        .set({ status: 'TERISI', updatedAt: new Date() })
        .where(eq(schema.rooms.code, candidate.roomCode));

      await drizzleDb.db
        .update(schema.users)
        .set({ role: 'PENGHUNI', updatedAt: new Date() })
        .where(eq(schema.users.id, candidate.userId));
    }
  } catch (dbErr) {
    console.warn('Peringatan saat update check-in ke Drizzle ORM:', dbErr);
  }

  // I. Catat audit log
  await dbAddAuditLog({
    userId: currentUser.id,
    action: 'CHECK_IN_TENANT',
    entityType: 'TENANCY',
    entityId: newTenancy.id,
    payloadAfter: {
      reservationCode: candidate.reservationCode,
      roomCode: candidate.roomCode,
      tenantName: candidate.userName,
      checkInDate: newTenancy.checkInDate,
      contractEndDate: newTenancy.contractEndDate,
      userRoleUpdated: 'PENGHUNI',
    },
  });

  // J. Revalidasi cache halaman dinamis
  try {
    revalidateTag('rooms');
  } catch {
    // Safe
  }
  revalidatePath('/pengelola/checkin');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/kamar');
  revalidatePath('/pengelola/dashboard');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/pengguna');
  revalidatePath('/kamar');
  revalidatePath('/');
  // K. Trigger Notifikasi Otomatis (Email Resend & WhatsApp Fonnte - Task 3.3)
  try {
    await dispatchCheckinSuccess({
      userName: candidate.userName,
      userEmail: candidate.userEmail,
      userPhone: candidate.userPhone,
      roomCode: candidate.roomCode,
      checkInDate: newTenancy.checkInDate,
      durationMonths: candidate.durationMonths,
      tenancyEndDate: newTenancy.contractEndDate,
      monthlyPrice: candidate.bookingAmount,
      depositAmount: candidate.depositAmount,
      portalUrl: 'https://kosomi.id/penghuni/dashboard',
      userId: candidate.userId,
    });
  } catch (notifErr) {
    console.warn('[Notification] Gagal mengirim notifikasi check-in:', notifErr);
  }

  return {
    success: true,
    message: `Check-in berhasil diproses untuk ${candidate.userName} di Kamar ${candidate.roomCode}. Status kamar kini resmi TERISI dan hak akses pengguna ditingkatkan menjadi PENGHUNI.`,
    newTenancy,
  };
}

export async function processCheckinAction(candidateId: string) {
  return checkInTenant(candidateId);
}

// 5. Process Check-out (PRD Bab 5.F & Bab 11 Task 2.9)
export async function checkOutTenant(
  tenancyId: string,
  confirmUnpaid: boolean = false
): Promise<{
  success: boolean;
  hasUnpaidBills?: boolean;
  unpaidAmount?: number;
  message?: string;
  error?: string;
}> {
  const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);
  const cleanId = tenancyId.trim();
  const tenancies = getTenanciesStore();
  const tenant = tenancies.find((t) => t.id === cleanId || t.roomCode === cleanId);

  if (!tenant) {
    return {
      success: false,
      error: `Data penghuni dengan ID ${tenancyId} tidak ditemukan.`,
    };
  }

  if (tenant.status === 'SELESAI') {
    return {
      success: false,
      error: `Penghuni ${tenant.userName} (Kamar ${tenant.roomCode}) telah menyelesaikan masa sewa (check-out) sebelumnya.`,
    };
  }

  // 1. Cek apakah masih ada tagihan belum lunas (PRD Bab 5.F line 281)
  let totalUnpaid = tenant.totalUnpaidAmount || 0;
  let unpaidCount = tenant.unpaidBillsCount || 0;

  // Cross-check dengan global billing state
  if (global.__kosOmiBillingState && global.__kosOmiBillingState.bills) {
    const activeUnpaidBills = global.__kosOmiBillingState.bills.filter(
      (b) =>
        b.roomCode === tenant.roomCode &&
        (b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT')
    );
    if (activeUnpaidBills.length > 0) {
      unpaidCount = Math.max(unpaidCount, activeUnpaidBills.length);
      const sumBills = activeUnpaidBills.reduce(
        (acc, b) => acc + (b.totalAmount || b.rentAmount),
        0
      );
      totalUnpaid = Math.max(totalUnpaid, sumBills);
    }
  }

  // Jika masih ada tunggakan dan pengelola belum mengonfirmasi secara khusus
  if (unpaidCount > 0 && !confirmUnpaid) {
    return {
      success: false,
      hasUnpaidBills: true,
      unpaidAmount: totalUnpaid,
      error: `Penghuni masih memiliki ${unpaidCount} tagihan tertunggak sebesar Rp ${totalUnpaid.toLocaleString('id-ID')}. Selesaikan pelunasan terlebih dahulu atau berikan konfirmasi persetujuan pengelola untuk melanjutkan check-out.`,
    };
  }

  // 2. Update status tenancy menjadi SELESAI & hapus permanen dari antrean check-in / reservasi aktif
  const today = new Date().toISOString().split('T')[0];
  tenant.status = 'SELESAI';
  tenant.checkOutDate = today;
  tenant.depositRefunded = false;

  // Tandai reservasi terkait menjadi CHECKED_OUT agar tidak pernah di-seed ulang ke antrean check-in
  if ((global as any).__kosOmiDbState && Array.isArray((global as any).__kosOmiDbState.reservations)) {
    for (const rsv of (global as any).__kosOmiDbState.reservations) {
      if (
        rsv.roomCode === tenant.roomCode &&
        (rsv.userId === tenant.userId ||
          rsv.userEmail?.toLowerCase() === tenant.userEmail.toLowerCase())
      ) {
        rsv.status = 'CHECKED_OUT';
        rsv.updatedAt = new Date().toISOString();
      }
    }
  }

  // Bersihkan juga dari store kandidat check-in jika masih ada
  const candidates = getCheckinCandidatesStore();
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (
      candidates[i].roomCode === tenant.roomCode &&
      (candidates[i].userId === tenant.userId ||
        candidates[i].userEmail.toLowerCase() === tenant.userEmail.toLowerCase())
    ) {
      candidates.splice(i, 1);
    }
  }

  // Bersihkan dari profil aktif Portal Penghuni jika ada
  if (global.__kosOmiBillingState && Array.isArray(global.__kosOmiBillingState.profiles)) {
    global.__kosOmiBillingState.profiles = global.__kosOmiBillingState.profiles.filter(
      (p) => p.email.toLowerCase() !== tenant.userEmail.toLowerCase()
    );
  }

  // 3. Ubah kamar kembali menjadi TERSEDIA apabila sudah tidak ada lagi penghuni AKTIF lain di kamar tersebut
  const remainingActiveInRoom = tenancies.filter(
    (t) => t.roomCode === tenant.roomCode && t.status === 'AKTIF' && t.id !== tenant.id
  );
  if (remainingActiveInRoom.length === 0) {
    await dbUpdateRoomStatus(tenant.roomCode, 'TERSEDIA');
  }

  // Jika Neon Postgres Drizzle DB aktif:
  try {
    if (drizzleDb.isAvailable && drizzleDb.db) {
      await drizzleDb.db
        .update(schema.tenancies)
        .set({ status: 'SELESAI', checkOutDate: today })
        .where(eq(schema.tenancies.id, tenant.id));
    }
  } catch (dbErr) {
    console.warn('Peringatan saat update tenancy di Drizzle ORM:', dbErr);
  }

  // 4. Catat audit log
  await dbAddAuditLog({
    userId: currentUser.id,
    action: 'CHECK_OUT_TENANT',
    entityType: 'TENANCY',
    entityId: tenant.id,
    payloadAfter: {
      roomCode: tenant.roomCode,
      tenantName: tenant.userName,
      checkOutDate: tenant.checkOutDate,
      confirmUnpaid,
      unpaidAmount: unpaidCount > 0 ? totalUnpaid : 0,
      depositAmount: tenant.depositAmount,
      depositRefundStatus: 'MENUNGGU_KEUANGAN',
    },
  });

  // 5. Revalidasi cache halaman dinamis
  try {
    revalidateTag('rooms');
  } catch {
    // Safe
  }
  revalidatePath('/pengelola/checkout');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/kamar');
  revalidatePath('/pengelola/dashboard');
  revalidatePath('/kamar');
  revalidatePath('/keuangan/laporan');

  // 6. Trigger Notifikasi Otomatis (Email Resend & WhatsApp Fonnte - Task 3.3)
  try {
    await dispatchCheckoutSuccess({
      userName: tenant.userName,
      userEmail: tenant.userEmail,
      userPhone: tenant.userPhone,
      roomCode: tenant.roomCode,
      checkOutDate: tenant.checkOutDate || today,
      depositStatus: unpaidCount > 0 ? 'Tertahan (Pemeriksaan Piutang)' : 'Sedang Diproses Pengembalian oleh Keuangan',
      depositRefundAmount: unpaidCount > 0 ? Math.max(0, tenant.depositAmount - totalUnpaid) : tenant.depositAmount,
      notes: unpaidCount > 0 ? `Terdapat penyesuaian sisa tagihan senilai Rp ${totalUnpaid.toLocaleString('id-ID')}` : 'Fasilitas kamar telah diperiksa dalam kondisi baik.',
      userId: tenant.userId,
    });
  } catch (notifErr) {
    console.warn('[Notification] Gagal mengirim notifikasi check-out:', notifErr);
  }

  return {
    success: true,
    message: `Check-out berhasil diproses untuk ${tenant.userName} (Kamar ${tenant.roomCode}). Kamar kini resmi kembali TERSEDIA. Pengembalian deposit sebesar Rp ${tenant.depositAmount.toLocaleString('id-ID')} ditandai untuk pemeriksaan bagian Keuangan.`,
  };
}

export async function processCheckoutAction(tenancyId: string, confirmUnpaid: boolean = false) {
  return checkOutTenant(tenancyId, confirmUnpaid);
}


