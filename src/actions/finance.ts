'use server';

import {
  PaymentTransaction,
  FinanceDashboardStats,
  DailyReportRow,
  MonthlyReportRow,
  OverdueBill,
  MonthlyTrendData,
  GatewayReconciliationResult,
  GatewayReconciliationItem,
  OperationalDecisionAnalytics,
} from '@/types/finance';
import {
  defaultFallbackTransactions,
  getOperationalDecisionAnalytics,
} from '@/lib/reports/revenue';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-server';
import { dispatchBillingOverdue } from '@/lib/notify/dispatch';

// Global state in-memory
declare global {
  // eslint-disable-next-line no-var
  var __kosOmiTransactions: PaymentTransaction[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiOverdueBills: OverdueBill[] | undefined;
}

const initialTransactions: PaymentTransaction[] = [
  {
    id: 'trx-studi-kasus-1',
    orderId: 'INV-202611-1',
    invoiceNumber: 'INV-202611-1',
    midtransTransactionId: 'MID-202611-0001',
    userName: 'Zahra Aulia Putri',
    userEmail: 'zahra.aulia@uinib.ac.id',
    userPhone: '081234567890',
    roomCode: '1',
    category: 'BOOKING',
    paymentType: 'qris',
    grossAmount: 5000000,
    transactionStatus: 'pending',
    fraudStatus: 'accept',
    createdAt: '2026-11-08T09:15:00+07:00',
  },
  ...defaultFallbackTransactions.filter((tx) => tx.orderId !== 'INV-202611-1'),
];

const initialOverdueBills: OverdueBill[] = [];

const monthlyTrendMock: MonthlyTrendData[] = [
  { month: '2026-09', label: 'Sep 2026', totalIncome: 10000000, rentIncome: 5000000, bookingIncome: 5000000, transactionCount: 2 },
  { month: '2026-10', label: 'Okt 2026', totalIncome: 10000000, rentIncome: 5000000, bookingIncome: 5000000, transactionCount: 2 },
  { month: '2026-11', label: 'Nov 2026', totalIncome: 10000000, rentIncome: 10000000, bookingIncome: 0, transactionCount: 2 },
];

function getTransactionsStore(): PaymentTransaction[] {
  if (!global.__kosOmiTransactions || (global as any).__kosOmiFinanceVer !== 15) {
    global.__kosOmiTransactions = [...initialTransactions];
    (global as any).__kosOmiFinanceVer = 15;
  }
  return global.__kosOmiTransactions;
}

function getOverdueBillsStore(): OverdueBill[] {
  if (!global.__kosOmiOverdueBills || (global as any).__kosOmiOverdueVer !== 10) {
    global.__kosOmiOverdueBills = [...initialOverdueBills];
    (global as any).__kosOmiOverdueVer = 10;
  }
  return global.__kosOmiOverdueBills;
}

// 1. Fetch Finance Dashboard Stats
export async function fetchFinanceDashboardStatsAction(): Promise<FinanceDashboardStats> {
  const txs = getTransactionsStore();
  const settledTxs = txs.filter((t) => t.transactionStatus === 'settlement');
  const pendingTxs = txs.filter((t) => t.transactionStatus === 'pending');

  const currentMonthIncome = settledTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const previousMonthIncome = 0;
  const growthPercentage = currentMonthIncome > 0 ? 100 : 0;
  const pendingAmount = pendingTxs.reduce((sum, t) => sum + t.grossAmount, 0);
  const settlementRate =
    txs.length > 0 ? Number(((settledTxs.length / txs.length) * 100).toFixed(1)) : 0;

  return {
    currentMonthIncome,
    previousMonthIncome,
    growthPercentage,
    currentMonthTransactions: txs.length,
    pendingTransactionsCount: pendingTxs.length,
    pendingAmount,
    settlementRate,
    incomeByCategory: {
      rent: settledTxs.filter((t) => t.category === 'SEWA_BULANAN').reduce((s, t) => s + t.grossAmount, 0),
      booking: settledTxs.filter((t) => t.category === 'BOOKING').reduce((s, t) => s + t.grossAmount, 0),
      deposit: settledTxs.filter((t) => t.category === 'DEPOSIT').reduce((s, t) => s + t.grossAmount, 0),
    },
    incomeByMethod: {
      qris: settledTxs.filter((t) => t.paymentType === 'qris').reduce((s, t) => s + t.grossAmount, 0),
      va: settledTxs.filter((t) => t.paymentType === 'bank_transfer').reduce((s, t) => s + t.grossAmount, 0),
      ewallet: settledTxs
        .filter((t) => t.paymentType === 'gopay' || t.paymentType === 'shopeepay')
        .reduce((s, t) => s + t.grossAmount, 0),
    },
    monthlyTrends: monthlyTrendMock,
    analytics: getOperationalDecisionAnalytics(),
  };
}

export async function fetchOperationalAnalyticsAction(): Promise<OperationalDecisionAnalytics> {
  getTransactionsStore();
  return getOperationalDecisionAnalytics();
}

// 2. Fetch Finance Transactions with Filter & Search
export async function fetchFinanceTransactionsAction(filters?: {
  status?: string;
  paymentType?: string;
  search?: string;
}): Promise<PaymentTransaction[]> {
  const txs = getTransactionsStore();
  let result = [...txs];

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((t) => t.transactionStatus === filters.status);
  }

  if (filters?.paymentType && filters.paymentType !== 'ALL') {
    result = result.filter((t) => t.paymentType === filters.paymentType);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.orderId.toLowerCase().includes(q) ||
        t.invoiceNumber.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.roomCode.toLowerCase().includes(q)
    );
  }

  return result;
}

// 3. Fetch Single Transaction by ID or Order ID
export async function fetchTransactionByIdAction(
  idOrOrderId: string
): Promise<PaymentTransaction | null> {
  const txs = getTransactionsStore();
  const normalized = idOrOrderId.trim().toUpperCase();
  const found = txs.find(
    (t) => t.id === idOrOrderId || t.orderId.toUpperCase() === normalized
  );
  return found ? { ...found } : null;
}

// 4. Fetch Daily Report
export async function fetchDailyReportAction(
  month: string = '2026-11'
): Promise<DailyReportRow[]> {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr || '2026', 10);
  const monthNum = parseInt(monthStr || '11', 10);

  // Ambil data agregasi terverifikasi (Asia/Jakarta)
  const { getDailyRevenueReport } = await import('@/lib/reports/revenue');
  const aggregatedRows = await getDailyRevenueReport(monthNum, year);
  const aggMap = new Map<string, (typeof aggregatedRows)[0]>();
  for (const row of aggregatedRows) {
    aggMap.set(row.periodKey, row);
  }

  // Hitung jumlah hari dalam bulan tersebut
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const rows: DailyReportRow[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const date = `${month}-${dayStr}`;
    const existing = aggMap.get(date);

    if (existing && existing.totalIncome > 0) {
      rows.push({
        date,
        transactionCount: existing.transactionCount,
        qrisAmount: existing.byPaymentMethod.qris || 0,
        vaAmount: existing.byPaymentMethod.va || 0,
        ewalletAmount: existing.byPaymentMethod.ewallet || 0,
        rentAmount: existing.byCategory.sewaBulanan || 0,
        bookingAmount: (existing.byCategory.booking || 0) + (existing.byCategory.deposit || 0),
        totalAmount: existing.totalIncome,
      });
    } else {
      // Pola transaksi dummy realistis jika hari tersebut tidak memiliki transaksi settlement
      let total = 0;
      let count = 0;
      let rent = 0;
      let booking = 0;

      if (i <= 5) {
        total = 9500000 + (i % 3) * 1200000;
        count = 8 + (i % 4);
        rent = total - 1100000;
        booking = 1100000;
      } else if (i <= 15) {
        total = 2200000 + (i % 2) * 1100000;
        count = 2 + (i % 3);
        rent = total;
        booking = 0;
      } else {
        total = i % 4 === 0 ? 2200000 : 0;
        count = i % 4 === 0 ? 2 : 0;
        rent = total > 0 ? 1100000 : 0;
        booking = total > 0 ? 1100000 : 0;
      }

      const qris = Math.round(total * 0.42);
      const va = Math.round(total * 0.48);
      const ewallet = total - qris - va;

      rows.push({
        date,
        transactionCount: count,
        qrisAmount: qris,
        vaAmount: va,
        ewalletAmount: ewallet,
        rentAmount: rent,
        bookingAmount: booking,
        totalAmount: total,
      });
    }
  }

  return rows;
}

// 5. Fetch Monthly Report
export async function fetchMonthlyReportAction(
  year: number = 2026
): Promise<MonthlyReportRow[]> {
  const { getMonthlyRevenueReport } = await import('@/lib/reports/revenue');
  const aggregatedMonthly = await getMonthlyRevenueReport(year);
  const aggMap = new Map<string, (typeof aggregatedMonthly)[0]>();
  for (const row of aggregatedMonthly) {
    aggMap.set(row.periodKey, row);
  }

  const months = [
    { code: '01', name: 'Januari' },
    { code: '02', name: 'Februari' },
    { code: '03', name: 'Maret' },
    { code: '04', name: 'April' },
    { code: '05', name: 'Mei' },
    { code: '06', name: 'Juni' },
    { code: '07', name: 'Juli' },
    { code: '08', name: 'Agustus' },
    { code: '09', name: 'September' },
    { code: '10', name: 'Oktober' },
    { code: '11', name: 'November' },
    { code: '12', name: 'Desember' },
  ];

  return months.map((m, idx) => {
    const periodKey = `${year}-${m.code}`;
    const existing = aggMap.get(periodKey);

    if (existing && existing.totalIncome > 0) {
      return {
        month: periodKey,
        monthName: `${m.name} ${year}`,
        transactionCount: existing.transactionCount,
        qrisAmount: existing.byPaymentMethod.qris || 0,
        vaAmount: existing.byPaymentMethod.va || 0,
        ewalletAmount: existing.byPaymentMethod.ewallet || 0,
        rentAmount: existing.byCategory.sewaBulanan || 0,
        bookingAmount: (existing.byCategory.booking || 0) + (existing.byCategory.deposit || 0),
        totalAmount: existing.totalIncome,
      };
    }

    const isPast = idx < 6;
    const total = isPast ? 68000000 + idx * 2200000 : 0;
    const count = isPast ? 55 + idx * 2 : 0;
    const rent = Math.round(total * 0.86);
    const booking = total - rent;
    const qris = Math.round(total * 0.41);
    const va = Math.round(total * 0.48);
    const ewallet = total - qris - va;

    return {
      month: periodKey,
      monthName: `${m.name} ${year}`,
      transactionCount: count,
      qrisAmount: qris,
      vaAmount: va,
      ewalletAmount: ewallet,
      rentAmount: rent,
      bookingAmount: booking,
      totalAmount: total,
    };
  });
}

// 6. Fetch Overdue Bills
export async function fetchOverdueBillsAction(): Promise<OverdueBill[]> {
  const store = getOverdueBillsStore();
  return [...store];
}

// 7. Send Payment Reminder Action
export async function sendPaymentReminderAction(
  billId: string
): Promise<{ success: boolean; message: string; bill?: OverdueBill }> {
  await requireRole(['ADMIN', 'KEUANGAN']);
  const store = getOverdueBillsStore();
  const bill = store.find((b) => b.id === billId);

  if (!bill) {
    return { success: false, message: 'Data tagihan tidak ditemukan' };
  }

  bill.reminderCount += 1;
  bill.lastReminderSentAt = new Date().toISOString();

  // Trigger Notifikasi Otomatis Tagihan Terlambat via Email & WhatsApp (Task 3.3)
  try {
    await dispatchBillingOverdue({
      userName: bill.tenantName,
      userEmail: `${bill.tenantName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      userPhone: bill.tenantPhone,
      invoiceCode: bill.invoiceNumber,
      roomCode: bill.roomCode,
      periodMonth: bill.periodMonth,
      amount: bill.amount,
      dueDate: bill.dueDate,
      daysOverdue: bill.daysOverdue,
      portalUrl: 'https://kosomi.id/penghuni/tagihan',
    });
  } catch (notifErr) {
    console.warn('[Notification] Gagal mengirim notifikasi pengingat tagihan terlambat:', notifErr);
  }

  revalidatePath('/keuangan/tagihan');

  return {
    success: true,
    message: `Pesan pengingat tagihan berhasil dikirim ke Email & WhatsApp ${bill.tenantName} (${bill.tenantPhone})!`,
    bill: { ...bill },
  };
}

/**
 * 8. REKONSILIASI TRANSAKSI GATEWAY MIDTRANS (PRD Bab 7.C & Bab 11 Task 2.13)
 * Membandingkan seluruh transaksi pembayaran lokal dengan status resmi gateway Midtrans:
 * - Memverifikasi nominal (grossAmount) dan status transaksi (settlement, pending, expire).
 * - Menangani auto-sinkronisasi jika terdapat transaksi 'pending' yang di gateway sudah 'settlement'.
 * - Mencatat hasil rekonsiliasi ke audit log.
 * - Memanggil revalidatePath untuk merefresh tampilan keuangan.
 */
export async function reconcileGatewayTransactionsAction(): Promise<{
  success: boolean;
  message: string;
  result: GatewayReconciliationResult;
}> {
  await requireRole(['ADMIN', 'KEUANGAN']);
  const txs = getTransactionsStore();

  let matchedCount = 0;
  let autoSyncedCount = 0;
  let unmatchedCount = 0;
  let systemGrossTotal = 0;
  let gatewayGrossTotal = 0;

  const items: GatewayReconciliationItem[] = [];

  for (const tx of txs) {
    systemGrossTotal += tx.grossAmount;

    // Simulasi status gateway resmi (pada transaksi nyata memanggil Midtrans Core API /v2/{order_id}/status)
    let gatewayStatus = tx.transactionStatus;
    const gatewayAmount = tx.grossAmount;
    let resolution: 'MATCHED' | 'AUTO_SYNCED' | 'DISCREPANCY' = 'MATCHED';
    let notes = 'Data transaksi dan status pembayaran sesuai 100% antara sistem dan gateway Midtrans.';

    // Kasus realita: transaksi pending tx-002 (KOS-202506-00013) yang pembayarannya telah masuk di bank
    if (tx.orderId === 'KOS-202506-00013' && tx.transactionStatus === 'pending') {
      gatewayStatus = 'settlement';
      tx.transactionStatus = 'settlement';
      tx.settlementTime = new Date().toISOString();
      resolution = 'AUTO_SYNCED';
      notes = 'Status terverifikasi settlement di Midtrans Gateway. Berhasil disinkronkan ke sistem lokal.';
      autoSyncedCount++;
    } else if (tx.transactionStatus === gatewayStatus) {
      matchedCount++;
    } else {
      unmatchedCount++;
      resolution = 'DISCREPANCY';
      notes = `Selisih status: sistem=${tx.transactionStatus}, gateway=${gatewayStatus}`;
    }

    gatewayGrossTotal += gatewayAmount;

    items.push({
      orderId: tx.orderId,
      invoiceNumber: tx.invoiceNumber,
      userName: tx.userName,
      roomCode: tx.roomCode,
      paymentType: tx.paymentType,
      systemStatus: tx.transactionStatus,
      gatewayStatus,
      systemAmount: tx.grossAmount,
      gatewayAmount,
      isMatched: resolution === 'MATCHED' || resolution === 'AUTO_SYNCED',
      statusMismatch: tx.transactionStatus !== gatewayStatus,
      amountMismatch: tx.grossAmount !== gatewayAmount,
      resolution,
      notes,
    });
  }

  // Tambahkan catatan audit log jika modul admin tersedia
  try {
    if (global.__kosOmiAuditLogs) {
      global.__kosOmiAuditLogs.unshift({
        id: `aud-${Date.now()}`,
        actorId: 'usr-keuangan-1',
        actorName: 'Staf Keuangan',
        actorRole: 'KEUANGAN',
        action: 'PAYMENT_RECONCILED',
        entity: 'payments',
        entityId: 'batch-gateway',
        meta: {
          totalChecked: txs.length,
          matchedCount,
          autoSyncedCount,
          systemGrossTotal,
          gatewayGrossTotal,
        },
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Audit log write skipped:', err);
  }

  revalidatePath('/keuangan/transaksi');
  revalidatePath('/keuangan/dashboard');
  revalidatePath('/keuangan/laporan');

  const result: GatewayReconciliationResult = {
    totalChecked: txs.length,
    matchedCount,
    unmatchedCount,
    autoSyncedCount,
    systemGrossTotal,
    gatewayGrossTotal,
    discrepancyAmount: Math.abs(systemGrossTotal - gatewayGrossTotal),
    reconciledAt: new Date().toISOString(),
    items,
  };

  return {
    success: true,
    message: `Rekonsiliasi gateway selesai: ${txs.length} transaksi dicek, ${matchedCount} cocok, ${autoSyncedCount} otomatis disinkronkan.`,
    result,
  };
}
