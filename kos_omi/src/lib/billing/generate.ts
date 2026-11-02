/**
 * Generator Tagihan Bulanan & Cron Job (PRD Bab 5.E & Bab 11 Task 2.8)
 *
 * Logika Bisnis:
 * 1. Otomatisasi pembuatan invoice SEWA_BULANAN untuk tenancy AKTIF pada H-7 jatuh tempo.
 * 2. Format nomor invoice resmi: INV-[YYYYMM]-[nomor urut 5 digit].
 * 3. Pencegahan duplikasi invoice dengan unique key: tenancy_id + period_month.
 * 4. Menandai tagihan BELUM_BAYAR menjadi TERLAMBAT setelah lewat 3 hari dari jatuh tempo.
 * 5. Sinkronisasi data ke penyimpanan billing penghuni, database server pembayaran, dan audit logs.
 */

import { MonthlyBill } from '@/types/billing';
import { dbAddAuditLog } from '@/server/db';
import { revalidatePath } from 'next/cache';
import { db as drizzleDb, schema } from '@/db';
import {
  dispatchBillingReminderH3,
  dispatchBillingReminderH0,
  dispatchBillingOverdue,
} from '@/lib/notify/dispatch';

export interface GenerateBillingOptions {
  targetDate?: Date;
  forcePeriod?: string; // YYYY-MM
  dueDay?: number;
}

export interface GeneratedInvoiceSummary {
  id: string;
  invoiceCode: string;
  tenancyId: string;
  roomCode: string;
  tenantName: string;
  tenantEmail: string;
  amount: number;
  dueDate: string;
  periodMonth: string;
  periodKey: string;
}

export interface OverdueInvoiceSummary {
  invoiceCode: string;
  roomCode: string;
  tenantName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface GenerateBillingResult {
  success: boolean;
  message: string;
  periodMonth: string;
  generatedCount: number;
  markedOverdueCount: number;
  skippedCount: number;
  generatedInvoices: GeneratedInvoiceSummary[];
  overdueInvoices: OverdueInvoiceSummary[];
  timestamp: string;
}

// Interface tenancy untuk generator tagihan
export interface BillingTenancy {
  id: string;
  userId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  roomCode: string;
  monthlyPrice: number;
  dueDay: number;
  status: 'AKTIF' | 'SELESAI';
  startDate?: string;
  contractEndDate?: string;
}

// Data default tenancy aktif Kos Omi (sesuai Bab 9 Data Dummy PRD)
const DEFAULT_TENANCIES: BillingTenancy[] = [
  {
    id: 'ten-001',
    userId: 'usr-rina',
    tenantName: 'Rina Wulandari',
    tenantEmail: 'rina.wulandari@gmail.com',
    tenantPhone: '081234567890',
    roomCode: 'A-101',
    monthlyPrice: 1100000,
    dueDay: 5,
    status: 'AKTIF',
    startDate: '2025-01-03',
    contractEndDate: '2026-01-03',
  },
  {
    id: 'ten-002',
    userId: 'usr-dimas',
    tenantName: 'Dimas Prasetyo',
    tenantEmail: 'dimas.prasetyo@gmail.com',
    tenantPhone: '081398765432',
    roomCode: 'B-205',
    monthlyPrice: 750000,
    dueDay: 5,
    status: 'AKTIF',
    startDate: '2025-02-15',
    contractEndDate: '2025-08-15',
  },
  {
    id: 'ten-003',
    userId: 'usr-siti',
    tenantName: 'Siti Nurhaliza',
    tenantEmail: 'siti.nurhaliza@gmail.com',
    tenantPhone: '081987654321',
    roomCode: 'C-310',
    monthlyPrice: 1450000,
    dueDay: 5,
    status: 'AKTIF',
    startDate: '2025-03-01',
    contractEndDate: '2026-03-01',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiActiveTenancies: BillingTenancy[] | undefined;
}

export function getActiveTenanciesStore(): BillingTenancy[] {
  // 1. Cek global tenancies dari actions/tenancy jika ada
  if (global.__kosOmiTenancies && global.__kosOmiTenancies.length > 0) {
    return global.__kosOmiTenancies
      .filter((t: any) => t.status === 'AKTIF')
      .map((t: any) => ({
        id: t.id,
        userId: t.userId,
        tenantName: t.userName,
        tenantEmail: t.userEmail,
        tenantPhone: t.userPhone,
        roomCode: t.roomCode,
        monthlyPrice: t.monthlyPrice,
        dueDay: t.dueDay || 5,
        status: t.status,
        startDate: t.checkInDate,
        contractEndDate: t.contractEndDate,
      }));
  }

  // 2. Fallback global memory
  if (!global.__kosOmiActiveTenancies) {
    global.__kosOmiActiveTenancies = [...DEFAULT_TENANCIES];
  }
  return global.__kosOmiActiveTenancies.filter((t) => t.status === 'AKTIF');
}

/**
 * Generator Tagihan Bulanan (PRD Bab 5.E & Bab 11 Task 2.8)
 *
 * Membuat invoice SEWA_BULANAN pada H-7 sebelum tanggal jatuh tempo.
 * Format: INV-[YYYYMM]-[5 digit]
 * Mencegah duplikasi dengan unique index: tenancy_id + period_month
 * Menandai tagihan TERLAMBAT setelah lewat 3 hari dari tanggal jatuh tempo.
 */
export async function generateMonthlyBills(
  options?: GenerateBillingOptions
): Promise<GenerateBillingResult> {
  const now = options?.targetDate || new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Akses global storage tagihan bulanan
  const globalState = global.__kosOmiBillingState;
  const existingBills = globalState ? globalState.bills : [];

  // Akses database pembayaran server
  const serverDb = (global as any).__kosOmiServerDb;
  const serverPayments = serverDb ? serverDb.payments : [];

  const activeTenancies = getActiveTenanciesStore();

  let generatedCount = 0;
  let skippedCount = 0;
  const generatedInvoices: GeneratedInvoiceSummary[] = [];

  // Tentukan periode target (default: bulan berjalan atau bulan berikutnya jika hari ini H-7 ke atas)
  let targetPeriodKey = options?.forcePeriod;
  if (!targetPeriodKey) {
    // Jika tanggal sekarang sudah lewat dari tanggal 20, tagihkan bulan depan (H-7 sebelum tanggal 5)
    if (now.getDate() >= 25) {
      const nextMonthDate = new Date(year, month, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonth = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
      targetPeriodKey = `${nextYear}-${nextMonth}`;
    } else {
      targetPeriodKey = `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  const periodCompact = targetPeriodKey.replace('-', '');
  const [targetYearStr, targetMonthStr] = targetPeriodKey.split('-');
  const targetYear = parseInt(targetYearStr, 10);
  const targetMonth = parseInt(targetMonthStr, 10);

  // Hitung nomor urut sequence untuk periode ini
  let seq = existingBills.filter((b) => b.periodKey === targetPeriodKey).length + 1;

  for (const tenancy of activeTenancies) {
    const dueDay = tenancy.dueDay || 5;

    // Tanggal jatuh tempo untuk periode ini
    const dueDateObj = new Date(targetYear, targetMonth - 1, dueDay);

    // Tanggal H-7 jatuh tempo
    const hMinus7Date = new Date(targetYear, targetMonth - 1, dueDay - 7);

    // Periksa apakah hari ini sudah memasuki jendela H-7 jatuh tempo (kecuali forcePeriod diaktifkan)
    if (!options?.forcePeriod && now < hMinus7Date) {
      skippedCount += 1;
      continue;
    }

    // 1. CEK PENCEGAHAN TAGIHAN GANDA (Unique Index: tenancy_id + period_month)
    const existsInBills = existingBills.some(
      (b) =>
        (b.roomCode.toUpperCase() === tenancy.roomCode.toUpperCase() ||
          (b as any).tenancyId === tenancy.id) &&
        b.periodKey === targetPeriodKey
    );

    const existsInServerPayments = serverPayments.some(
      (p: any) =>
        p.roomCode.toUpperCase() === tenancy.roomCode.toUpperCase() &&
        p.invoiceCode.toUpperCase().includes(periodCompact)
    );

    if (existsInBills || existsInServerPayments) {
      skippedCount += 1;
      continue;
    }

    // 2. Format Nomor Invoice Resmi: INV-[YYYYMM]-[5 digit]
    const seqStr = String(seq).padStart(5, '0');
    const invoiceNumber = `INV-${periodCompact}-${seqStr}`;
    const midtransOrderId = `KOS-${periodCompact}-${seqStr}`;
    seq += 1;

    const dueDateFormatted = `${dueDay} ${getMonthName(targetMonth)} ${targetYear}`;
    const dueDateIso = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

    // Buat objek tagihan bulanan untuk UI penghuni & keuangan
    const newBill: MonthlyBill = {
      id: `bill-${periodCompact}-${tenancy.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      invoiceCode: invoiceNumber,
      periodMonth: `${getMonthName(targetMonth)} ${targetYear}`,
      periodKey: targetPeriodKey,
      year: targetYear,
      roomCode: tenancy.roomCode,
      tenantName: tenancy.tenantName,
      tenantEmail: tenancy.tenantEmail,
      tenantPhone: tenancy.tenantPhone,
      dueDate: dueDateFormatted,
      rentAmount: tenancy.monthlyPrice,
      amount: tenancy.monthlyPrice,
      totalAmount: tenancy.monthlyPrice,
      status: 'BELUM_BAYAR',
      createdAt: now.toISOString(),
      notes: `Tagihan sewa kamar ${tenancy.roomCode} periode ${getMonthName(targetMonth)} ${targetYear}. Jatuh tempo ${dueDateFormatted}.`,
    };

    // A. Simpan ke Global State Tagihan Penghuni
    if (globalState) {
      globalState.bills.unshift(newBill);
    }

    // B. Simpan ke Server Payments Database (agar dapat dibayar via Midtrans Snap)
    if (serverPayments) {
      serverPayments.unshift({
        id: `inv-monthly-${periodCompact}-${tenancy.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        invoiceCode: invoiceNumber,
        reservationId: tenancy.id,
        reservationCode: tenancy.id,
        roomCode: tenancy.roomCode,
        amount: tenancy.monthlyPrice,
        status: 'UNPAID',
        paymentMethod: 'QRIS',
        expiresAt: new Date(dueDateObj.getTime() + 24 * 3600 * 1000).toISOString(),
        createdAt: now.toISOString(),
        midtransOrderId,
      });
    }

    // C. Sinkronisasi ke Unpaid Invoices di data Tenancy
    if (global.__kosOmiTenancies) {
      const tenIdx = global.__kosOmiTenancies.findIndex((t: any) => t.roomCode === tenancy.roomCode);
      if (tenIdx !== -1) {
        const targetTenancy = global.__kosOmiTenancies[tenIdx];
        targetTenancy.unpaidBillsCount = (targetTenancy.unpaidBillsCount || 0) + 1;
        targetTenancy.totalUnpaidAmount = (targetTenancy.totalUnpaidAmount || 0) + tenancy.monthlyPrice;
        targetTenancy.unpaidInvoices = targetTenancy.unpaidInvoices || [];
        targetTenancy.unpaidInvoices.push({
          id: `unpaid-${invoiceNumber}`,
          invoiceNumber,
          periodMonth: `${getMonthName(targetMonth)} ${targetYear}`,
          amount: tenancy.monthlyPrice,
          dueDate: dueDateIso,
          status: 'BELUM_BAYAR',
          description: `Sewa Kamar ${tenancy.roomCode} Periode ${getMonthName(targetMonth)} ${targetYear}`,
        });
      }
    }

    // D. Simpan ke Neon PostgreSQL Drizzle DB jika terhubung
    try {
      if (drizzleDb.isAvailable && drizzleDb.db) {
        await drizzleDb.db
          .insert(schema.invoices)
          .values({
            invoiceNumber,
            userId: tenancy.userId,
            tenancyId: tenancy.id,
            type: 'SEWA_BULANAN',
            periodMonth: targetPeriodKey,
            amount: tenancy.monthlyPrice,
            dueDate: dueDateIso,
            status: 'BELUM_BAYAR',
            midtransOrderId,
          })
          .onConflictDoNothing();
      }
    } catch (dbErr) {
      console.warn('Peringatan saat insert invoice ke Neon PostgreSQL Drizzle ORM:', dbErr);
    }

    generatedInvoices.push({
      id: newBill.id,
      invoiceCode: invoiceNumber,
      tenancyId: tenancy.id,
      roomCode: tenancy.roomCode,
      tenantName: tenancy.tenantName,
      tenantEmail: tenancy.tenantEmail,
      amount: tenancy.monthlyPrice,
      dueDate: dueDateFormatted,
      periodMonth: `${getMonthName(targetMonth)} ${targetYear}`,
      periodKey: targetPeriodKey,
    });

    generatedCount += 1;
  }

  // 3. EVALUASI TAGIHAN TERLAMBAT (Lewat 3 hari dari jatuh tempo)
  const overdueInvoices: OverdueInvoiceSummary[] = [];
  let markedOverdueCount = 0;

  if (globalState && globalState.bills) {
    for (const bill of globalState.bills) {
      if (bill.status === 'BELUM_BAYAR') {
        const dueDate = parseDueDate(bill.dueDate);
        if (dueDate) {
          // Hitung selisih hari: currentDate - dueDate
          const diffMs = now.getTime() - dueDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));

          // A. Pengingat H-3 (3 Hari Menjelang Jatuh Tempo) - Email & WhatsApp (Task 3.3)
          if (diffDays === -3) {
            try {
              await dispatchBillingReminderH3({
                userName: bill.tenantName,
                userEmail: bill.tenantEmail,
                userPhone: bill.tenantPhone,
                invoiceCode: bill.invoiceCode,
                roomCode: bill.roomCode,
                periodMonth: bill.periodMonth,
                amount: bill.totalAmount || bill.rentAmount,
                dueDate: bill.dueDate,
                portalUrl: 'https://kosomi.id/penghuni/tagihan',
              });
            } catch (err) {
              console.warn('[Notification Cron] Gagal mengirim pengingat H-3:', err);
            }
          }

          // B. Pengingat H-0 (Jatuh Tempo Hari Ini) - Email & WhatsApp (Task 3.3)
          if (diffDays === 0) {
            try {
              await dispatchBillingReminderH0({
                userName: bill.tenantName,
                userEmail: bill.tenantEmail,
                userPhone: bill.tenantPhone,
                invoiceCode: bill.invoiceCode,
                roomCode: bill.roomCode,
                periodMonth: bill.periodMonth,
                amount: bill.totalAmount || bill.rentAmount,
                dueDate: bill.dueDate,
                portalUrl: 'https://kosomi.id/penghuni/tagihan',
              });
            } catch (err) {
              console.warn('[Notification Cron] Gagal mengirim pengingat H-0:', err);
            }
          }

          // C. Jika lewat 3 hari setelah jatuh tempo -> TERLAMBAT - Email & WhatsApp (Task 3.3)
          if (diffDays > 3) {
            bill.status = 'TERLAMBAT';
            markedOverdueCount += 1;

            overdueInvoices.push({
              invoiceCode: bill.invoiceCode,
              roomCode: bill.roomCode,
              tenantName: bill.tenantName,
              amount: bill.totalAmount || bill.rentAmount,
              dueDate: bill.dueDate,
              daysOverdue: diffDays,
            });

            try {
              await dispatchBillingOverdue({
                userName: bill.tenantName,
                userEmail: bill.tenantEmail,
                userPhone: bill.tenantPhone,
                invoiceCode: bill.invoiceCode,
                roomCode: bill.roomCode,
                periodMonth: bill.periodMonth,
                amount: bill.totalAmount || bill.rentAmount,
                dueDate: bill.dueDate,
                daysOverdue: diffDays,
                portalUrl: 'https://kosomi.id/penghuni/tagihan',
              });
            } catch (err) {
              console.warn('[Notification Cron] Gagal mengirim notifikasi tagihan terlambat:', err);
            }

            // Sinkronkan status di server payments
            if (serverPayments) {
              const p = serverPayments.find((x: any) => x.invoiceCode === bill.invoiceCode);
              if (p) {
                p.status = 'EXPIRED';
              }
            }

            // Sinkronkan ke Neon DB jika terhubung
            try {
              if (drizzleDb.isAvailable && drizzleDb.db) {
                await drizzleDb.db
                  .update(schema.invoices)
                  .set({ status: 'TERLAMBAT', updatedAt: new Date() })
                  .where(eq(schema.invoices.invoiceNumber, bill.invoiceCode));
              }
            } catch (err) {
              console.warn('Peringatan update invoice TERLAMBAT di Drizzle:', err);
            }
          }
        }
      }
    }
  }

  // 4. Catat ke Audit Log
  await dbAddAuditLog({
    userId: 'system-cron-billing',
    action: 'GENERATE_MONTHLY_INVOICES',
    entityType: 'INVOICE',
    entityId: targetPeriodKey,
    payloadAfter: {
      periodMonth: targetPeriodKey,
      generatedCount,
      markedOverdueCount,
      skippedCount,
      generatedInvoiceCodes: generatedInvoices.map((i) => i.invoiceCode),
    },
  });

  // 5. Invalidasi Cache Frontend
  try {
    revalidatePath('/penghuni/dashboard');
    revalidatePath('/penghuni/tagihan');
    revalidatePath('/penghuni/riwayat');
    revalidatePath('/keuangan/dashboard');
    revalidatePath('/keuangan/tagihan');
    revalidatePath('/pengelola/penghuni');
  } catch {
    // Safe fallback jika di luar context rendering
  }

  return {
    success: true,
    message: `Siklus tagihan bulanan periode ${targetPeriodKey} selesai diproses: ${generatedCount} invoice baru diterbitkan, ${markedOverdueCount} tagihan ditandai terlambat, ${skippedCount} dilewati (sudah terdaftar/belum H-7).`,
    periodMonth: targetPeriodKey,
    generatedCount,
    markedOverdueCount,
    skippedCount,
    generatedInvoices,
    overdueInvoices,
    timestamp: now.toISOString(),
  };
}

/**
 * Helper untuk parsing tanggal jatuh tempo string ke Date
 */
function parseDueDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Format "5 November 2026" atau "2026-11-05"
  if (dateStr.includes('-')) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const parts = dateStr.trim().split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1];
    const year = parseInt(parts[2], 10);

    const monthIndex = getMonthIndex(monthName);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }

  return null;
}

function getMonthName(m: number): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return months[m - 1] || 'Bulan';
}

function getMonthIndex(name: string): number {
  const months = [
    'januari',
    'februari',
    'maret',
    'april',
    'mei',
    'juni',
    'juli',
    'agustus',
    'september',
    'oktober',
    'november',
    'desember',
  ];
  return months.indexOf(name.toLowerCase());
}
