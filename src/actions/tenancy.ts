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

const initialTenancies: TenancyRecord[] = [];

const initialCheckinCandidates: CheckinCandidate[] = [];

function getTenanciesStore(): TenancyRecord[] {
  if (!global.__kosOmiTenancies || (global as any).__kosOmiTenanciesVer !== 8) {
    global.__kosOmiTenancies = [...initialTenancies];
    (global as any).__kosOmiTenanciesVer = 8;
  }
  return global.__kosOmiTenancies;
}

function getCheckinCandidatesStore(): CheckinCandidate[] {
  if (!global.__kosOmiCheckinCandidates || (global as any).__kosOmiCandidatesVer !== 8) {
    global.__kosOmiCheckinCandidates = [...initialCheckinCandidates];
    (global as any).__kosOmiCandidatesVer = 8;
  }
  return global.__kosOmiCheckinCandidates;
}

// 1. Fetch All Active & Past Tenants
export async function fetchAllTenantsAction(): Promise<{
  success: boolean;
  tenants: TenancyRecord[];
}> {
  const store = getTenanciesStore();
  return { success: true, tenants: [...store] };
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

// 3. Fetch Check-in Candidates (Reservations Lunas)
export async function fetchCheckinCandidatesAction(): Promise<{
  success: boolean;
  candidates: CheckinCandidate[];
}> {
  const store = getCheckinCandidatesStore();

  // Sinkronkan reservasi berstatus PAID dari database server
  try {
    const serverReservations = await dbGetReservations();
    for (const res of serverReservations) {
      if (res.status === 'PAID') {
        const alreadyInStore = store.some(
          (c) => c.reservationCode === res.code || c.id === res.id
        );
        if (!alreadyInStore) {
          const floorNum = parseInt(res.roomCode.replace(/[^0-9]/g, '')[0] || '1', 10);
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
            invoiceCode: `INV-${res.code.replace('RSV-', '')}`,
            paymentMethod: 'Midtrans Snap',
            paidAt: res.payment?.paidAt || new Date().toISOString(),
            idCardUrl:
              res.ktpUrl ||
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
            notes: res.adminNotes || 'Reservasi lunas diverifikasi',
            status: 'LUNAS',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Gagal menyinkronkan kandidat check-in dari database reservasi:', err);
  }

  return { success: true, candidates: [...store] };
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

  // A. Periksa status pembayaran LUNAS (PRD Bab 5.F)
  if (candidate.status !== 'LUNAS') {
    return {
      success: false,
      error: `Check-in tidak dapat diproses karena status pembayaran belum LUNAS (Status saat ini: ${candidate.status}).`,
    };
  }

  // B. Tanggal hari ini untuk pencatatan check-in
  const today = new Date().toISOString().split('T')[0];

  const tenancies = getTenanciesStore();

  // C. Periksa ketersediaan kamar: Satu kamar hanya boleh memiliki satu tenancy AKTIF (PRD Bab 5.F)
  const existingActive = tenancies.find(
    (t) => t.roomCode === candidate.roomCode && t.status === 'AKTIF'
  );
  if (existingActive) {
    return {
      success: false,
      error: `Kamar ${candidate.roomCode} saat ini masih dihuni aktif oleh ${existingActive.userName}. Pastikan penghuni sebelumnya telah menyelesaikan check-out terlebih dahulu.`,
    };
  }

  // D. Tandai status reservasi kandidat menjadi CHECKIN
  candidate.status = 'CHECKIN';

  // Hitung tanggal akhir kontrak
  const checkInDateObj = new Date();
  const contractEndDateObj = new Date(checkInDateObj);
  contractEndDateObj.setMonth(contractEndDateObj.getMonth() + (candidate.durationMonths || 1));
  const contractEndDate = contractEndDateObj.toISOString().split('T')[0];

  // E. Buat data tenancy AKTIF baru
  const newTenancy: TenancyRecord = {
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
        periodMonth: 'Booking & Deposit Awal',
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

  // Sinkronkan ke Portal Penghuni (global.__kosOmiBillingState)
  if (!global.__kosOmiBillingState || (global as any).__kosOmiBillingVer !== 8) {
    global.__kosOmiBillingState = { bills: [], profiles: [] };
    (global as any).__kosOmiBillingVer = 8;
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
  if (!(global as any).__kosOmiNotifLogs || (global as any).__kosOmiNotifVer !== 8) {
    (global as any).__kosOmiNotifLogs = [];
    (global as any).__kosOmiNotifVer = 8;
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

  // F. Ubah status kamar menjadi TERISI
  await dbUpdateRoomStatus(candidate.roomCode, 'TERISI');

  // G. Ubah peran pengguna (CALON_PENGHUNI -> PENGHUNI)
  const user = findUserById(candidate.userId) || findUserByEmail(candidate.userEmail);
  if (user) {
    user.role = 'PENGHUNI';
  }

  // H. Catat ke database Neon PostgreSQL Drizzle ORM jika terhubung
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
        .update(schema.users)
        .set({ role: 'PENGHUNI', updatedAt: new Date() })
        .where(eq(schema.users.id, candidate.userId));
    }
  } catch (dbErr) {
    console.warn('Peringatan saat insert tenancy ke Drizzle ORM:', dbErr);
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
  revalidatePath('/kamar');
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

  // 2. Update status tenancy menjadi SELESAI
  const today = new Date().toISOString().split('T')[0];
  tenant.status = 'SELESAI';
  tenant.checkOutDate = today;
  tenant.depositRefunded = false; // Ditandai untuk pemeriksaan deposit oleh Keuangan (PRD Bab 5.F line 277)

  // 3. Ubah kamar kembali menjadi TERSEDIA
  await dbUpdateRoomStatus(tenant.roomCode, 'TERSEDIA');

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


