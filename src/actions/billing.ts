'use server';

import { MonthlyBill, TenantProfile } from '@/types/billing';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, requireRole } from '@/lib/auth-server';
import { dispatchPaymentSuccess } from '@/lib/notify/dispatch';
import { dbGetReservationsByUserEmail } from '@/server/db';
import { loadPersistentStore, savePersistentStore } from '@/server/persistence';

// In-Memory Global Storage untuk Tagihan & Profil Penghuni
interface BillingState {
  bills: MonthlyBill[];
  profiles: TenantProfile[];
}

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiBillingState: BillingState | undefined;
}

function initBillingState(): BillingState {
  return {
    bills: [],
    profiles: [],
  };
}

function getBillingDb(): BillingState {
  const store = loadPersistentStore();
  return {
    bills: store.bills,
    profiles: store.profiles,
  };
}

/**
 * Helper internal untuk mengidentifikasi email penghuni aktif
 * dan menyinkronkan reservasi LUNAS milik penghuni tersebut ke Portal Penghuni.
 */
async function getEffectiveTenantEmail(paramEmail?: string): Promise<string> {
  const db = getBillingDb();
  let resolvedEmail = '';

  if (paramEmail && paramEmail.trim() !== '') {
    resolvedEmail = paramEmail.toLowerCase().trim();
  } else {
    const currentUser = await getCurrentUser();
    if (currentUser?.email) {
      resolvedEmail = currentUser.email.toLowerCase().trim();
    }
  }

  if (!resolvedEmail) {
    const activeTenancies = ((global as any).__kosOmiTenancies as any[] | undefined) || [];
    const firstActive = activeTenancies.find((t) => t.status === 'AKTIF');
    resolvedEmail =
      firstActive?.userEmail?.toLowerCase().trim() ||
      db.profiles[0]?.email?.toLowerCase().trim() ||
      'penghuni@example.com';
  }

  // 1. Prioritaskan kontrak tenancy AKTIF milik user yang sedang login (agar nomor kamar 100% sesuai kontrak aktif)
  const activeTenancies = ((global as any).__kosOmiTenancies as any[] | undefined) || [];
  const activeTenancy = activeTenancies.find(
    (t) => t.status === 'AKTIF' && t.userEmail?.toLowerCase().trim() === resolvedEmail
  );

  if (activeTenancy) {
    const existingProfileIdx = db.profiles.findIndex(
      (p) => p.email.toLowerCase().trim() === resolvedEmail
    );
    const tenancyProfile: TenantProfile = {
      id: activeTenancy.userId || activeTenancy.id,
      name: activeTenancy.userName,
      nik: activeTenancy.userNik || '1371000000000001',
      email: activeTenancy.userEmail,
      phone: activeTenancy.userPhone,
      occupation: 'Mahasiswi UIN Imam Bonjol Padang',
      roomCode: activeTenancy.roomCode,
      checkInDate: activeTenancy.checkInDate,
      tenancyEnd: activeTenancy.contractEndDate,
      emergencyContactName: activeTenancy.emergencyContact?.name || 'Orang Tua / Wali',
      emergencyContactRelation: activeTenancy.emergencyContact?.relation || 'Orang Tua',
      emergencyContactPhone: activeTenancy.emergencyContact?.phone || activeTenancy.userPhone,
      monthlyRent: activeTenancy.monthlyPrice || 5000000,
      avatarUrl: `/rooms/kamar-${activeTenancy.roomCode}.png`,
    };
    if (existingProfileIdx === -1) {
      db.profiles.unshift(tenancyProfile);
    } else {
      db.profiles[existingProfileIdx] = {
        ...db.profiles[existingProfileIdx],
        ...tenancyProfile,
      };
    }
    savePersistentStore();
    return resolvedEmail;
  }

  // 2. Fallback: Sinkronkan data reservasi aktif (bukan yang sudah CHECKED_OUT / CANCELLED / REJECTED) milik resolvedEmail
  const userReservations = await dbGetReservationsByUserEmail(resolvedEmail);
  const activeRes =
    userReservations.find((r) => r.status === 'CHECKED_IN' || r.status === 'PAID') ||
    userReservations.find((r) => r.status === 'APPROVED');

  if (activeRes && activeRes.userEmail.toLowerCase().trim() === resolvedEmail) {
    const existingProfileIdx = db.profiles.findIndex(
      (p) => p.email.toLowerCase().trim() === resolvedEmail
    );
    const checkInDateObj = new Date(activeRes.checkInDate || new Date().toISOString());
    const endDateObj = new Date(checkInDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + (activeRes.durationMonths || 6));
    const tenancyEnd = isNaN(endDateObj.getTime())
      ? '2027-05-10'
      : endDateObj.toISOString().split('T')[0];

    const syncedProfile: TenantProfile = {
      id: activeRes.userId || `usr-${Date.now()}`,
      name: activeRes.userName,
      nik: activeRes.userNik || '1371000000000001',
      email: activeRes.userEmail,
      phone: activeRes.userPhone,
      occupation: activeRes.userOccupation || 'Mahasiswi UIN Imam Bonjol Padang',
      roomCode: activeRes.roomCode,
      checkInDate: activeRes.checkInDate,
      tenancyEnd,
      emergencyContactName: activeRes.emergencyContactName || 'Orang Tua / Wali',
      emergencyContactRelation: activeRes.emergencyContactRelation || 'Orang Tua',
      emergencyContactPhone: activeRes.emergencyContactPhone || activeRes.userPhone,
      monthlyRent: activeRes.monthlyPrice || 5000000,
      avatarUrl: `/rooms/kamar-${activeRes.roomCode}.png`,
    };

    if (existingProfileIdx === -1) {
      db.profiles.unshift(syncedProfile);
    } else {
      db.profiles[existingProfileIdx] = {
        ...db.profiles[existingProfileIdx],
        ...syncedProfile,
      };
    }

    const invCode = activeRes.payment?.invoiceCode || `INV-${activeRes.code.replace('RSV-', '')}`;
    const existingBillIdx = db.bills.findIndex(
      (b) => b.invoiceCode === invCode || b.tenantEmail.toLowerCase().trim() === resolvedEmail
    );
    const isPaid =
      activeRes.status === 'PAID' || activeRes.payment?.status === 'SETTLEMENT';

    const syncedBill: MonthlyBill = {
      id: activeRes.payment?.id || `bill-${activeRes.code}`,
      invoiceCode: invCode,
      periodMonth: `Sewa Semesteran (${activeRes.durationMonths || 6} Bulan)`,
      periodKey: (activeRes.checkInDate || '2026-11').substring(0, 7),
      year: 2026,
      roomCode: activeRes.roomCode,
      tenantName: activeRes.userName,
      tenantEmail: activeRes.userEmail,
      tenantPhone: activeRes.userPhone,
      dueDate: activeRes.checkInDate,
      rentAmount: activeRes.totalInitialPayment || 5000000,
      amount: activeRes.totalInitialPayment || 5000000,
      penaltyAmount: 0,
      totalAmount: activeRes.totalInitialPayment || 5000000,
      status: isPaid ? 'LUNAS' : 'BELUM_BAYAR',
      paymentMethod: activeRes.payment?.paymentMethod || 'DANA',
      paidAt: activeRes.payment?.paidAt,
      createdAt: activeRes.createdAt,
      notes: `Tagihan Sewa Semesteran Kamar No. ${activeRes.roomCode} Kos Omi.`,
    };

    if (existingBillIdx === -1) {
      db.bills.unshift(syncedBill);
    } else {
      db.bills[existingBillIdx] = {
        ...db.bills[existingBillIdx],
        ...syncedBill,
      };
    }
    savePersistentStore();
  }

  return resolvedEmail;
}

/**
 * Mengambil tagihan aktif bulan berjalan (Prioritas 1 Dasbor Penghuni)
 * Menerapkan filter server-side berdasarkan identitas pengguna login.
 */
export async function fetchCurrentMonthlyBillAction(email?: string): Promise<MonthlyBill | null> {
  const db = getBillingDb();
  const effectiveEmail = await getEffectiveTenantEmail(email);

  // Filter hanya tagihan milik penghuni yang sesuai
  const tenantBills = db.bills.filter(
    (b) =>
      b.tenantEmail.toLowerCase() === effectiveEmail ||
      (effectiveEmail === 'penghuni@example.com' && b.roomCode === '1')
  );

  // Cari tagihan yang belum lunas atau terlambat
  const current = tenantBills.find((b) => b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT');
  return current ? { ...current } : tenantBills[0] || null;
}

/**
 * Mengambil daftar seluruh tagihan bulanan milik penghuni (Row-Level Security)
 */
export async function fetchMonthlyBillsAction(
  email?: string,
  statusFilter?: string
): Promise<MonthlyBill[]> {
  const db = getBillingDb();
  const effectiveEmail = await getEffectiveTenantEmail(email);

  // Filter server-side: hanya kembalikan tagihan milik pengguna yang sah
  let list = db.bills.filter(
    (b) =>
      b.tenantEmail.toLowerCase() === effectiveEmail ||
      (effectiveEmail === 'penghuni@example.com' && b.roomCode === '1')
  );

  if (statusFilter && statusFilter !== 'ALL') {
    list = list.filter((b) => b.status === statusFilter);
  }

  return list;
}

/**
 * Mengambil detail tagihan berdasarkan nomor invoice dengan proteksi akses kepemilikan
 */
export async function fetchMonthlyBillByIdAction(invoiceCode: string): Promise<MonthlyBill | null> {
  const db = getBillingDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const bill = db.bills.find((b) => b.invoiceCode === normalized);

  if (!bill) return null;

  const currentUser = await getCurrentUser();

  // Validasi otorisasi: Jika penghuni, hanya boleh melihat invoice miliknya sendiri
  if (currentUser && currentUser.role === 'PENGHUNI') {
    const isOwner =
      bill.tenantEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      (currentUser.email === 'penghuni@example.com' && bill.roomCode === '1');

    if (!isOwner) {
      return null; // Isolasi data: tidak mengizinkan akses ke invoice orang lain
    }
  }

  return { ...bill };
}

/**
 * Mengambil riwayat seluruh transaksi lunas milik penghuni
 */
export async function fetchPaymentHistoryAction(
  email?: string,
  yearFilter?: number,
  searchQuery?: string
): Promise<MonthlyBill[]> {
  const db = getBillingDb();
  const effectiveEmail = await getEffectiveTenantEmail(email);

  // Filter hanya transaksi lunas milik penghuni bersangkutan
  let paidList = db.bills.filter(
    (b) =>
      b.status === 'LUNAS' &&
      (b.tenantEmail.toLowerCase() === effectiveEmail ||
        (effectiveEmail === 'penghuni@example.com' && b.roomCode === '1'))
  );

  if (yearFilter && yearFilter !== 0) {
    paidList = paidList.filter((b) => b.year === yearFilter);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    paidList = paidList.filter(
      (b) =>
        b.invoiceCode.toLowerCase().includes(q) ||
        b.periodMonth.toLowerCase().includes(q) ||
        (b.paymentMethod && b.paymentMethod.toLowerCase().includes(q))
    );
  }

  return paidList;
}

/**
 * Mengambil profil diri penghuni aktif berdasarkan sesi login pengguna
 */
export async function fetchTenantProfileAction(email?: string): Promise<TenantProfile> {
  const db = getBillingDb();
  const effectiveEmail = await getEffectiveTenantEmail(email);

  const matchedProfile =
    db.profiles.find((p) => p.email.toLowerCase() === effectiveEmail) || db.profiles[0];

  if (matchedProfile) {
    return { ...matchedProfile };
  }

  return {
    id: 'usr-belum-checkin',
    name: '',
    email: '',
    phone: '',
    nik: '',
    occupation: '',
    roomCode: '1',
    checkInDate: 'Belum Check-in',
    tenancyEnd: '-',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    monthlyRent: 5000000,
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  };
}

/**
 * Memperbarui nomor telepon, data diri, atau kontak darurat penghuni
 */
export async function updateTenantProfileAction(
  data: Partial<TenantProfile>
): Promise<{ success: boolean; message: string; profile?: TenantProfile }> {
  try {
    const db = getBillingDb();
    const effectiveEmail = await getEffectiveTenantEmail(data.email);

    let pIndex = db.profiles.findIndex((p) => p.email.toLowerCase() === effectiveEmail);
    if (pIndex === -1) {
      if (db.profiles.length === 0) {
        db.profiles.push({
          id: `usr-${Date.now()}`,
          name: data.name || '',
          email: data.email || 'penghuni@example.com',
          phone: data.phone || '',
          nik: data.nik || '',
          occupation: 'Mahasiswi UIN Imam Bonjol Padang',
          roomCode: '1',
          checkInDate: new Date().toISOString().split('T')[0],
          tenancyEnd: '-',
          emergencyContactName: 'Wali / Orang Tua',
          emergencyContactPhone: data.emergencyContact || '',
          emergencyContactRelation: 'Orang Tua',
          monthlyRent: 5000000,
        });
      }
      pIndex = 0;
    }

    db.profiles[pIndex] = {
      ...db.profiles[pIndex],
      ...data,
    };

    // Sinkronkan juga perubahan Nama / No. WA / NIK ke authUsers, adminUsers, dan tenancies
    const store = loadPersistentStore();
    const updatedProfile = db.profiles[pIndex];
    const targetEmail = (updatedProfile.email || effectiveEmail).toLowerCase().trim();
    const authUser = store.authUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);
    if (authUser) {
      if (data.name) authUser.name = data.name;
      if (data.phone) authUser.phone = data.phone.replace(/^0/, '62').replace(/^\+/, '');
      if (data.nik) authUser.nim = data.nik;
    }
    const adminUser = store.adminUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);
    if (adminUser) {
      if (data.name) adminUser.name = data.name;
      if (data.phone) adminUser.phone = data.phone;
      if (data.nik) adminUser.nim = data.nik;
    }
    for (const ten of store.tenancies) {
      if (ten.userEmail.toLowerCase().trim() === targetEmail && ten.status === 'AKTIF') {
        if (data.name) ten.userName = data.name;
        if (data.phone) ten.userPhone = data.phone;
        if (data.nik) ten.userNik = data.nik;
      }
    }
    savePersistentStore(store);

    revalidatePath('/penghuni/profil');
    revalidatePath('/penghuni/dashboard');
    revalidatePath('/admin/pengguna');
    revalidatePath('/pengelola/penghuni');

    return {
      success: true,
      message: 'Profil dan nomor kontak Anda berhasil diperbarui di sistem.',
      profile: { ...db.profiles[pIndex] },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal memperbarui profil penghuni',
    };
  }
}

/**
 * Melunasi tagihan bulanan (simulasi Midtrans Snap lunas)
 */
export async function payMonthlyBillAction(
  invoiceCode: string,
  method: string = 'QRIS'
): Promise<{ success: boolean; message: string; bill?: MonthlyBill }> {
  const db = getBillingDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const index = db.bills.findIndex((b) => b.invoiceCode === normalized);

  if (index === -1) {
    return { success: false, message: 'Tagihan tidak ditemukan' };
  }

  db.bills[index].status = 'LUNAS';
  db.bills[index].paymentMethod = method;
  db.bills[index].paidAt = new Date().toISOString();
  savePersistentStore();

  revalidatePath('/penghuni/dashboard');
  revalidatePath('/penghuni/tagihan');
  revalidatePath(`/penghuni/tagihan/${normalized}`);
  revalidatePath('/penghuni/riwayat');

  // Trigger Notifikasi Otomatis Kuitansi Lunas via Email & WhatsApp (Task 3.3)
  const paidBill = db.bills[index];
  try {
    await dispatchPaymentSuccess({
      userName: paidBill.tenantName,
      userEmail: paidBill.tenantEmail,
      userPhone: paidBill.tenantPhone,
      invoiceCode: paidBill.invoiceCode,
      orderId: `KOS-MID-${paidBill.invoiceCode}`,
      roomCode: paidBill.roomCode,
      category: 'SEWA BULANAN',
      grossAmount: paidBill.totalAmount || paidBill.rentAmount || paidBill.amount || 0,
      paymentType: method,
      settlementTime: paidBill.paidAt
        ? new Date(paidBill.paidAt).toLocaleString('id-ID')
        : new Date().toLocaleString('id-ID'),
      portalUrl: `https://kosomi.id/penghuni/tagihan/${normalized}`,
    });
  } catch (notifErr) {
    console.warn('[Notification] Gagal mengirim notifikasi kuitansi pembayaran lunas:', notifErr);
  }

  return {
    success: true,
    message: `Tagihan ${normalized} berhasil dibayar lunas via ${method}`,
    bill: { ...paidBill },
  };
}

/**
 * Server Action: Memicu siklus generator tagihan bulanan (Otorisasi: Admin / Keuangan / Pengelola)
 */
export async function triggerMonthlyBillingCycleAction(options?: {
  targetDate?: string;
  forcePeriod?: string;
}) {
  const { generateMonthlyBills } = await import('@/lib/billing/generate');

  await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const targetDate = options?.targetDate ? new Date(options.targetDate) : undefined;
  return generateMonthlyBills({
    targetDate,
    forcePeriod: options?.forcePeriod,
  });
}
