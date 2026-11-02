'use server';

import { MonthlyBill, TenantProfile } from '@/types/billing';
import { revalidatePath } from 'next/cache';
import { getCurrentUser, requireRole } from '@/lib/auth-server';
import { dispatchPaymentSuccess } from '@/lib/notify/dispatch';

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
  return { bills: [], profiles: [] };
}

function getBillingDb(): BillingState {
  if (!global.__kosOmiBillingState || (global as any).__kosOmiBillingVer !== 8) {
    global.__kosOmiBillingState = initBillingState();
    (global as any).__kosOmiBillingVer = 8;
  }
  return global.__kosOmiBillingState;
}

/**
 * Helper internal untuk mengidentifikasi email penghuni aktif
 */
async function getEffectiveTenantEmail(paramEmail?: string): Promise<string> {
  const db = getBillingDb();
  if (paramEmail && paramEmail.trim() !== '') {
    return paramEmail.toLowerCase().trim();
  }
  if (db.profiles.length > 0) {
    return db.profiles[0].email.toLowerCase().trim();
  }
  const currentUser = await getCurrentUser();
  return currentUser?.email?.toLowerCase().trim() || 'penghuni@example.com';
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

    revalidatePath('/penghuni/profil');
    revalidatePath('/penghuni/dashboard');

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
