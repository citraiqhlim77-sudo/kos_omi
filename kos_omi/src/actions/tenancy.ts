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
import { eq } from 'drizzle-orm';
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

const initialTenancies: TenancyRecord[] = [
  {
    id: 'ten-001',
    userId: 'usr-rina',
    userName: 'Rina Wulandari',
    userEmail: 'rina.wulandari@gmail.com',
    userPhone: '081234567890',
    userNik: '3273220501980001',
    idCardUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    roomId: 'room-a101',
    roomCode: 'A-101',
    roomFloor: 1,
    roomType: 'STANDAR_AC',
    monthlyPrice: 1100000,
    depositAmount: 1100000,
    checkInDate: '2025-01-03',
    contractEndDate: '2026-01-03',
    checkOutDate: null,
    dueDay: 5,
    status: 'AKTIF',
    depositRefunded: false,
    unpaidBillsCount: 0,
    totalUnpaidAmount: 0,
    unpaidInvoices: [],
    pastInvoices: [
      {
        id: 'inv-past-01',
        invoiceNumber: 'INV-202506-00045',
        periodMonth: 'Juni 2025',
        amount: 1100000,
        paidAt: '2025-06-03T10:15:00Z',
        paymentMethod: 'QRIS Midtrans',
        status: 'LUNAS',
      },
      {
        id: 'inv-past-02',
        invoiceNumber: 'INV-202505-00045',
        periodMonth: 'Mei 2025',
        amount: 1100000,
        paidAt: '2025-05-04T14:30:00Z',
        paymentMethod: 'BCA Virtual Account',
        status: 'LUNAS',
      },
      {
        id: 'inv-past-03',
        invoiceNumber: 'INV-202504-00045',
        periodMonth: 'April 2025',
        amount: 1100000,
        paidAt: '2025-04-02T09:00:00Z',
        paymentMethod: 'Mandiri VA',
        status: 'LUNAS',
      },
    ],
    emergencyContact: {
      name: 'Ibu Ratna (Ibu Kandung)',
      relation: 'Orang Tua',
      phone: '081298887766',
    },
  },
  {
    id: 'ten-002',
    userId: 'usr-dimas',
    userName: 'Dimas Prasetyo',
    userEmail: 'dimas.prasetyo@gmail.com',
    userPhone: '081398765432',
    userNik: '3273221503950003',
    idCardUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    roomId: 'room-b205',
    roomCode: 'B-205',
    roomFloor: 2,
    roomType: 'STANDAR_NON_AC',
    monthlyPrice: 750000,
    depositAmount: 750000,
    checkInDate: '2025-02-15',
    contractEndDate: '2025-08-15',
    checkOutDate: null,
    dueDay: 5,
    status: 'AKTIF',
    depositRefunded: false,
    unpaidBillsCount: 1,
    totalUnpaidAmount: 750000,
    unpaidInvoices: [
      {
        id: 'inv-unpaid-01',
        invoiceNumber: 'INV-202506-00046',
        periodMonth: 'Juni 2025',
        amount: 750000,
        dueDate: '2025-06-05',
        status: 'BELUM_BAYAR',
        description: 'Sewa Kamar B-205 (Standar Non-AC) Periode Juni 2025',
      },
    ],
    pastInvoices: [
      {
        id: 'inv-past-04',
        invoiceNumber: 'INV-202505-00046',
        periodMonth: 'Mei 2025',
        amount: 750000,
        paidAt: '2025-05-05T11:20:00Z',
        paymentMethod: 'GoPay',
        status: 'LUNAS',
      },
      {
        id: 'inv-past-05',
        invoiceNumber: 'INV-202504-00046',
        periodMonth: 'April 2025',
        amount: 750000,
        paidAt: '2025-04-04T08:45:00Z',
        paymentMethod: 'BCA VA',
        status: 'LUNAS',
      },
    ],
    emergencyContact: {
      name: 'Bambang Prasetyo (Kakak)',
      relation: 'Saudara Kandung',
      phone: '081377665544',
    },
  },
  {
    id: 'ten-003',
    userId: 'usr-siti',
    userName: 'Siti Nurhaliza',
    userEmail: 'siti.nurhaliza@gmail.com',
    userPhone: '081987654321',
    userNik: '3273222807990005',
    idCardUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    roomId: 'room-c310',
    roomCode: 'C-310',
    roomFloor: 3,
    roomType: 'DELUXE_AC',
    monthlyPrice: 1450000,
    depositAmount: 1450000,
    checkInDate: '2025-03-01',
    contractEndDate: '2026-03-01',
    checkOutDate: null,
    dueDay: 5,
    status: 'AKTIF',
    depositRefunded: false,
    unpaidBillsCount: 0,
    totalUnpaidAmount: 0,
    unpaidInvoices: [],
    pastInvoices: [
      {
        id: 'inv-past-06',
        invoiceNumber: 'INV-202506-00047',
        periodMonth: 'Juni 2025',
        amount: 1450000,
        paidAt: '2025-06-02T16:00:00Z',
        paymentMethod: 'QRIS',
        status: 'LUNAS',
      },
      {
        id: 'inv-past-07',
        invoiceNumber: 'INV-202505-00047',
        periodMonth: 'Mei 2025',
        amount: 1450000,
        paidAt: '2025-05-03T10:30:00Z',
        paymentMethod: 'ShopeePay',
        status: 'LUNAS',
      },
    ],
    emergencyContact: {
      name: 'Hj. Aminah (Ibu)',
      relation: 'Orang Tua',
      phone: '081911223344',
    },
  },
];

const initialCheckinCandidates: CheckinCandidate[] = [
  {
    id: 'cand-001',
    reservationCode: 'RSV-250601-0007',
    userId: 'usr-bagas',
    userName: 'Bagas Kurniawan',
    userPhone: '085712349988',
    userEmail: 'bagas.kurniawan@gmail.com',
    userNik: '1371111208970004',
    roomId: 'room-d404',
    roomCode: 'D-404',
    roomFloor: 4,
    roomType: 'STANDAR_AC',
    startDate: '2025-06-01',
    durationMonths: 6,
    bookingAmount: 1100000,
    depositAmount: 1100000,
    totalPaid: 2200000,
    invoiceCode: 'INV-202506-00048',
    paymentMethod: 'BCA Virtual Account',
    paidAt: '2025-05-30T14:20:00Z',
    idCardUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    notes: 'Karyawan instansi di Padang, bawa 1 unit sepeda motor Vario.',
    status: 'LUNAS',
  },
  {
    id: 'cand-002',
    reservationCode: 'RSV-250602-0008',
    userId: 'usr-anisa',
    userName: 'Anisa Permata',
    userPhone: '082188776655',
    userEmail: 'anisa.permata@gmail.com',
    userNik: '1371112404990008',
    roomId: 'room-a112',
    roomCode: 'A-112',
    roomFloor: 1,
    roomType: 'STANDAR_AC',
    startDate: '2025-06-02',
    durationMonths: 12,
    bookingAmount: 1100000,
    depositAmount: 1100000,
    totalPaid: 2200000,
    invoiceCode: 'INV-202506-00049',
    paymentMethod: 'QRIS Midtrans',
    paidAt: '2025-05-31T09:10:00Z',
    idCardUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    notes: 'Mahasiswi UIN Imam Bonjol Padang, permohonan kamar lantai dasar.',
    status: 'LUNAS',
  },
];

function getTenanciesStore(): TenancyRecord[] {
  if (!global.__kosOmiTenancies) {
    global.__kosOmiTenancies = [...initialTenancies];
  }
  return global.__kosOmiTenancies;
}

function getCheckinCandidatesStore(): CheckinCandidate[] {
  if (!global.__kosOmiCheckinCandidates) {
    global.__kosOmiCheckinCandidates = [...initialCheckinCandidates];
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

  // B. Periksa tanggal masuk (PRD Bab 5.F: hanya jika tanggal hari ini sudah sama atau melewati tanggal masuk)
  const today = new Date().toISOString().split('T')[0];
  if (candidate.startDate && candidate.startDate > today) {
    return {
      success: false,
      error: `Check-in belum dapat diproses. Tanggal rencana masuk kamar ${candidate.roomCode} adalah ${candidate.startDate}, sedangkan hari ini masih tanggal ${today}. Check-in hanya dapat dilakukan pada atau setelah tanggal masuk.`,
    };
  }

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

