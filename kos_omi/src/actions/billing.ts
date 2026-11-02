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
  const initialBills: MonthlyBill[] = [
    // 1. Tagihan Rina Kusuma / Rina Wulandari (A-101)
    {
      id: 'bill-202611-101',
      invoiceCode: 'INV-202611-00101',
      periodMonth: 'November 2026',
      periodKey: '2026-11',
      year: 2026,
      roomCode: 'A-101',
      tenantName: 'Rina Kusuma',
      tenantEmail: 'penghuni@example.com',
      tenantPhone: '081211112222',
      dueDate: '5 November 2026',
      rentAmount: 1450000,
      totalAmount: 1450000,
      status: 'BELUM_BAYAR',
      createdAt: '2026-10-25T00:05:00.000Z',
      notes: 'Tagihan sewa kamar bulan November 2026. Jatuh tempo tgl 5 November.',
    },
    {
      id: 'bill-202610-101',
      invoiceCode: 'INV-202610-00101',
      periodMonth: 'Oktober 2026',
      periodKey: '2026-10',
      year: 2026,
      roomCode: 'A-101',
      tenantName: 'Rina Kusuma',
      tenantEmail: 'penghuni@example.com',
      tenantPhone: '081211112222',
      dueDate: '5 Oktober 2026',
      rentAmount: 1450000,
      totalAmount: 1450000,
      status: 'LUNAS',
      paymentMethod: 'BCA_VA',
      paidAt: '2026-10-03T14:20:00.000Z',
      createdAt: '2026-09-25T00:05:00.000Z',
      notes: 'Tagihan sewa bulan Oktober 2026 lunas via BCA Virtual Account.',
    },
    {
      id: 'bill-202609-101',
      invoiceCode: 'INV-202609-00101',
      periodMonth: 'September 2026',
      periodKey: '2026-09',
      year: 2026,
      roomCode: 'A-101',
      tenantName: 'Rina Kusuma',
      tenantEmail: 'penghuni@example.com',
      tenantPhone: '081211112222',
      dueDate: '5 September 2026',
      rentAmount: 1450000,
      totalAmount: 1450000,
      status: 'LUNAS',
      paymentMethod: 'QRIS',
      paidAt: '2026-09-01T09:15:00.000Z',
      createdAt: '2026-08-25T00:05:00.000Z',
      notes: 'Tagihan sewa pertama bulan September 2026 lunas via QRIS.',
    },
    {
      id: 'bill-202608-101',
      invoiceCode: 'INV-202608-A101',
      periodMonth: 'Booking & Deposit Awal',
      periodKey: '2026-08',
      year: 2026,
      roomCode: 'A-101',
      tenantName: 'Rina Kusuma',
      tenantEmail: 'penghuni@example.com',
      tenantPhone: '081211112222',
      dueDate: '25 Agustus 2026',
      rentAmount: 1450000,
      totalAmount: 2900000,
      status: 'LUNAS',
      paymentMethod: 'BCA_VA',
      paidAt: '2026-08-24T11:00:00.000Z',
      createdAt: '2026-08-23T10:00:00.000Z',
      notes: 'Pembayaran deposit 1 bulan + sewa pertama kamar A-101.',
    },

    // 2. Tagihan Dimas Prasetyo (B-205)
    {
      id: 'bill-202611-205',
      invoiceCode: 'INV-202611-00205',
      periodMonth: 'November 2026',
      periodKey: '2026-11',
      year: 2026,
      roomCode: 'B-205',
      tenantName: 'Dimas Prasetyo',
      tenantEmail: 'dimas.prasetyo@gmail.com',
      tenantPhone: '081398765432',
      dueDate: '5 November 2026',
      rentAmount: 750000,
      totalAmount: 750000,
      status: 'TERLAMBAT',
      createdAt: '2026-10-25T00:05:00.000Z',
      notes: 'Tagihan sewa kamar B-205 terlambat melewati tanggal 5.',
    },
    {
      id: 'bill-202610-205',
      invoiceCode: 'INV-202610-00205',
      periodMonth: 'Oktober 2026',
      periodKey: '2026-10',
      year: 2026,
      roomCode: 'B-205',
      tenantName: 'Dimas Prasetyo',
      tenantEmail: 'dimas.prasetyo@gmail.com',
      tenantPhone: '081398765432',
      dueDate: '5 Oktober 2026',
      rentAmount: 750000,
      totalAmount: 750000,
      status: 'LUNAS',
      paymentMethod: 'GOPAY',
      paidAt: '2026-10-04T16:30:00.000Z',
      createdAt: '2026-09-25T00:05:00.000Z',
      notes: 'Tagihan sewa Oktober 2026 lunas via GoPay.',
    },

    // 3. Tagihan Siti Nurhaliza (C-310)
    {
      id: 'bill-202611-310',
      invoiceCode: 'INV-202611-00310',
      periodMonth: 'November 2026',
      periodKey: '2026-11',
      year: 2026,
      roomCode: 'C-310',
      tenantName: 'Siti Nurhaliza',
      tenantEmail: 'siti.nurhaliza@gmail.com',
      tenantPhone: '081987654321',
      dueDate: '5 November 2026',
      rentAmount: 1450000,
      totalAmount: 1450000,
      status: 'BELUM_BAYAR',
      createdAt: '2026-10-25T00:05:00.000Z',
      notes: 'Tagihan sewa kamar C-310 bulan November 2026.',
    },
  ];

  const initialProfiles: TenantProfile[] = [
    {
      id: 'usr-rina-kusuma',
      name: 'Rina Kusuma',
      email: 'penghuni@example.com',
      phone: '081211112222',
      nik: '1371031201990004',
      occupation: 'Tenaga Medis RSUP Padang',
      roomCode: 'A-101',
      checkInDate: '1 September 2026',
      tenancyEnd: '31 Agustus 2027',
      emergencyContactName: 'Hendra Kusuma',
      emergencyContactPhone: '081233334444',
      emergencyContactRelation: 'Orang Tua (Ayah)',
      monthlyRent: 1450000,
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'usr-dimas-prasetyo',
      name: 'Dimas Prasetyo',
      email: 'dimas.prasetyo@gmail.com',
      phone: '081398765432',
      nik: '3273221503950003',
      occupation: 'Desainer Grafis Freelance',
      roomCode: 'B-205',
      checkInDate: '15 Februari 2025',
      tenancyEnd: '15 Agustus 2026',
      emergencyContactName: 'Budi Prasetyo',
      emergencyContactPhone: '081288776655',
      emergencyContactRelation: 'Kakak Kandung',
      monthlyRent: 750000,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'usr-siti-nurhaliza',
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@gmail.com',
      phone: '081987654321',
      nik: '1371016508980002',
      occupation: 'Mahasiswi Magister UIN Imam Bonjol Padang',
      roomCode: 'C-310',
      checkInDate: '1 Maret 2025',
      tenancyEnd: '1 Maret 2026',
      emergencyContactName: 'Hj. Aminah',
      emergencyContactPhone: '081911223344',
      emergencyContactRelation: 'Orang Tua (Ibu)',
      monthlyRent: 1450000,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return { bills: initialBills, profiles: initialProfiles };
}

function getBillingDb(): BillingState {
  if (!global.__kosOmiBillingState) {
    global.__kosOmiBillingState = initBillingState();
  }
  return global.__kosOmiBillingState;
}

/**
 * Helper internal untuk mengidentifikasi email penghuni aktif dengan proteksi Row-Level Security
 */
async function getEffectiveTenantEmail(paramEmail?: string): Promise<string> {
  const currentUser = await getCurrentUser();

  // Jika user yang sedang login adalah PENGHUNI, query WAJIB dibatasi ke akunnya sendiri
  if (currentUser && currentUser.role === 'PENGHUNI') {
    return currentUser.email.toLowerCase().trim();
  }

  // Jika staf internal (ADMIN, KEUANGAN, PENGELOLA) mengakses, boleh melihat email parameter tertentu
  if (paramEmail && paramEmail.trim() !== '') {
    return paramEmail.toLowerCase().trim();
  }

  // Default fallback ke akun demo penghuni utama
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
      (effectiveEmail === 'penghuni@example.com' && b.roomCode === 'A-101')
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
      (effectiveEmail === 'penghuni@example.com' && b.roomCode === 'A-101')
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
      (currentUser.email === 'penghuni@example.com' && bill.roomCode === 'A-101');

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
        (effectiveEmail === 'penghuni@example.com' && b.roomCode === 'A-101'))
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

  const matchedProfile = db.profiles.find(
    (p) =>
      p.email.toLowerCase() === effectiveEmail ||
      (effectiveEmail === 'penghuni@example.com' && p.roomCode === 'A-101')
  );

  if (matchedProfile) {
    return { ...matchedProfile };
  }

  // Jika belum ada di list profil statis, kembalikan profil dinamis dari sesi
  const currentUser = await getCurrentUser();
  return {
    id: currentUser?.id || 'usr-default',
    name: currentUser?.name || 'Rina Kusuma',
    email: effectiveEmail,
    phone: currentUser?.phone || '081211112222',
    nik: '3273031201990004',
    occupation: 'Penghuni Aktif Kos Omi',
    roomCode: 'A-101',
    checkInDate: '1 September 2026',
    tenancyEnd: '31 Agustus 2027',
    emergencyContactName: 'Hendra Kusuma',
    emergencyContactPhone: '081233334444',
    emergencyContactRelation: 'Orang Tua',
    monthlyRent: 1450000,
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
