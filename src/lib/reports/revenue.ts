import { unstable_cache } from 'next/cache';
import {
  PaymentTransaction,
  OccupancyAnalytics,
  CollectionRateAnalytics,
  ReservationConversionAnalytics,
  OperationalDecisionAnalytics,
} from '@/types/finance';
import { ALL_ROOMS } from '@/data/rooms';
import { loadPersistentStore } from '@/server/persistence';

/**
 * Label tampilan UI untuk kategori transaksi tanpa mengubah enum database ('SEWA_BULANAN' | 'BOOKING' | 'DEPOSIT' | 'DENDA')
 */
export const PAYMENT_CATEGORY_LABELS: Record<PaymentTransaction['category'], string> = {
  SEWA_BULANAN: 'Sewa Semesteran (Rp 5.000.000/semester)',
  BOOKING: 'Booking Kamar Baru (1 Semester)',
  DEPOSIT: 'Uang Jaminan (Deposit)',
  DENDA: 'Denda Keterlambatan',
};

export function formatPaymentCategoryLabel(category: string): string {
  if (category === 'SEWA_BULANAN') {
    return PAYMENT_CATEGORY_LABELS.SEWA_BULANAN;
  }
  if (category === 'BOOKING') {
    return PAYMENT_CATEGORY_LABELS.BOOKING;
  }
  if (category === 'DEPOSIT') {
    return PAYMENT_CATEGORY_LABELS.DEPOSIT;
  }
  if (category === 'DENDA') {
    return PAYMENT_CATEGORY_LABELS.DENDA;
  }
  return category;
}

export interface RevenueAggregationRow {
  periodKey: string; // '2025-06-03' atau '2025-06'
  dateOrMonth: string; // '03/06/2025' atau 'Juni 2025'
  totalIncome: number;
  transactionCount: number;
  byCategory: {
    sewaBulanan: number;
    booking: number;
    deposit: number;
    denda: number;
  };
  byPaymentMethod: {
    qris: number;
    va: number;
    ewallet: number;
    other: number;
    [key: string]: number;
  };
}

export interface JakartaDateComponents {
  year: number;
  month: number; // 1 - 12
  day: number; // 1 - 31
  dateKey: string; // 'YYYY-MM-DD'
  monthKey: string; // 'YYYY-MM'
  formattedDate: string; // 'DD/MM/YYYY'
}

/**
 * Konversi ISO timestamp ke komponen tanggal berzona waktu Asia/Jakarta (WIB: UTC+7)
 * Menjamin transaksi malam hari (misal jam 22.00-23.59 WIB) tidak terhitung ke hari UTC sebelumnya.
 */
export function getJakartaDateComponents(
  dateInput: string | Date | null | undefined
): JakartaDateComponents | null {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(d);
  let yearStr = '1970';
  let monthStr = '01';
  let dayStr = '01';

  for (const part of parts) {
    if (part.type === 'year') yearStr = part.value;
    else if (part.type === 'month') monthStr = part.value;
    else if (part.type === 'day') dayStr = part.value;
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  return {
    year,
    month,
    day,
    dateKey: `${yearStr}-${monthStr}-${dayStr}`,
    monthKey: `${yearStr}-${monthStr}`,
    formattedDate: `${dayStr}/${monthStr}/${yearStr}`,
  };
}

/**
 * Format string tanggal Indonesia (DD/MM/YYYY) dengan zona waktu Asia/Jakarta
 */
export function formatToJakartaDate(isoString: string): string {
  const comp = getJakartaDateComponents(isoString);
  return comp ? comp.formattedDate : '-';
}

/**
 * Mengambil komponen tanggal saat ini di zona waktu Asia/Jakarta
 */
export function getCurrentJakartaDate(): JakartaDateComponents {
  return getJakartaDateComponents(new Date())!;
}

// Data transaksi fallback dikosongkan agar Keuangan 100% membaca langsung dari invoice/pembayaran PAID nyata di sistem
export const defaultFallbackTransactions: PaymentTransaction[] = [];

/**
 * Mengambil seluruh transaksi gabungan (settled maupun pending) yang tersinkron langsung
 * dari invoice reservasi (global.__kosOmiDbState.payments) dan tagihan sewa (global.__kosOmiBillingState.bills).
 */
export function getSyncedTransactionsList(): PaymentTransaction[] {
  const store = loadPersistentStore();
  const globalTxs = store.transactions || [];
  const dbPayments = store.payments || [];
  const dbReservations = store.reservations || [];
  const billingBills = store.bills || [];

  const byOrder = new Map<string, PaymentTransaction>();

  for (const tx of globalTxs) {
    byOrder.set(tx.orderId, { ...tx });
  }

  for (const pay of dbPayments) {
    const resObj = dbReservations.find((r) => r.code === pay.reservationCode);
    const isSettled = pay.status === 'SETTLEMENT';
    const mappedStatus: PaymentTransaction['transactionStatus'] = isSettled
      ? 'settlement'
      : pay.status === 'EXPIRED' || pay.status === 'CANCELLED'
      ? 'expire'
      : 'pending';

    const existing = byOrder.get(pay.invoiceCode);
    const pMethod = (pay.paymentMethod || 'qris').toLowerCase();
    const paymentType: PaymentTransaction['paymentType'] = pMethod.includes('va') ||
      pMethod.includes('bank') ||
      pMethod.includes('bca') ||
      pMethod.includes('bri') ||
      pMethod.includes('bni') ||
      pMethod.includes('mandiri')
      ? 'bank_transfer'
      : pMethod.includes('gopay')
      ? 'gopay'
      : pMethod.includes('shopee')
      ? 'shopeepay'
      : 'qris';

    byOrder.set(pay.invoiceCode, {
      id: existing?.id || `tx-${pay.id}`,
      orderId: pay.invoiceCode,
      invoiceNumber: pay.invoiceCode,
      midtransTransactionId: existing?.midtransTransactionId || pay.midtransTransactionId || `MID-${pay.invoiceCode}`,
      userName: resObj?.userName || existing?.userName || 'Calon Penghuni',
      userPhone: resObj?.userPhone || existing?.userPhone || '-',
      userEmail: resObj?.userEmail || existing?.userEmail || '-',
      roomCode: pay.roomCode,
      category: 'BOOKING',
      paymentType,
      bank: pay.bank as any,
      grossAmount: Number(pay.amount) || 5000000,
      transactionStatus: mappedStatus,
      fraudStatus: 'accept',
      settlementTime: isSettled ? pay.paidAt || existing?.settlementTime || pay.createdAt : undefined,
      createdAt: pay.createdAt,
    });
  }

  for (const bill of billingBills) {
    if (bill.status === 'LUNAS' && !byOrder.has(bill.invoiceCode)) {
      byOrder.set(bill.invoiceCode, {
        id: `tx-${bill.id}`,
        orderId: bill.invoiceCode,
        invoiceNumber: bill.invoiceCode,
        midtransTransactionId: `MID-${bill.invoiceCode}`,
        userName: bill.tenantName,
        userPhone: bill.tenantPhone,
        userEmail: bill.tenantEmail,
        roomCode: bill.roomCode,
        category: 'SEWA_BULANAN',
        paymentType: 'qris',
        grossAmount: Number(bill.totalAmount || bill.rentAmount) || 5000000,
        transactionStatus: 'settlement',
        fraudStatus: 'accept',
        settlementTime: bill.paidAt || bill.createdAt,
        createdAt: bill.createdAt,
      });
    }
  }

  return Array.from(byOrder.values()).sort(
    (a, b) =>
      new Date(b.settlementTime || b.createdAt).getTime() -
      new Date(a.settlementTime || a.createdAt).getTime()
  );
}

/**
 * Mengambil transaksi sukses (PAID / SETTLEMENT) dari sumber terpadu:
 */
export function getSuccessfulTransactions(): PaymentTransaction[] {
  return getSyncedTransactionsList().filter((tx) => {
    if (tx.transactionStatus === 'settlement') return true;
    if (tx.transactionStatus === 'capture' && tx.fraudStatus === 'accept') return true;
    return false;
  });
}

/**
 * Query murni agregasi pemasukan harian dari database / store
 * Dikelompokkan per tanggal dalam zona waktu Asia/Jakarta, jenis invoice, dan metode pembayaran.
 */
export async function queryDailyRevenueFromStore(
  monthNumber: number,
  year: number
): Promise<RevenueAggregationRow[]> {
  const successful = getSuccessfulTransactions();
  const dailyMap = new Map<string, RevenueAggregationRow>();

  // Filter transaksi yang jatuh pada bulan dan tahun target menurut waktu Asia/Jakarta
  for (const tx of successful) {
    const timeToEvaluate = tx.settlementTime || tx.createdAt;
    const jktDate = getJakartaDateComponents(timeToEvaluate);

    if (!jktDate) continue;
    if (jktDate.year !== year || jktDate.month !== monthNumber) continue;

    const dateKey = jktDate.dateKey;

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        periodKey: dateKey,
        dateOrMonth: jktDate.formattedDate,
        totalIncome: 0,
        transactionCount: 0,
        byCategory: {
          sewaBulanan: 0,
          booking: 0,
          deposit: 0,
          denda: 0,
        },
        byPaymentMethod: {
          qris: 0,
          va: 0,
          ewallet: 0,
          other: 0,
        },
      });
    }

    const row = dailyMap.get(dateKey)!;
    const amount = Number(tx.grossAmount) || 0;

    row.totalIncome += amount;
    row.transactionCount += 1;

    // Klasifikasi per jenis invoice
    if (tx.category === 'SEWA_BULANAN') {
      row.byCategory.sewaBulanan += amount;
    } else if (tx.category === 'BOOKING') {
      row.byCategory.booking += amount;
    } else if (tx.category === 'DEPOSIT') {
      row.byCategory.deposit += amount;
    } else if (tx.category === 'DENDA') {
      row.byCategory.denda += amount;
    }

    // Klasifikasi per metode pembayaran
    const pType = (tx.paymentType || '').toLowerCase();
    const bank = (tx.bank || '').toLowerCase();

    if (pType === 'qris') {
      row.byPaymentMethod.qris += amount;
    } else if (pType === 'bank_transfer' || pType.includes('va') || bank) {
      row.byPaymentMethod.va += amount;
    } else if (pType === 'gopay' || pType === 'shopeepay' || pType === 'ewallet') {
      row.byPaymentMethod.ewallet += amount;
    } else {
      row.byPaymentMethod.other += amount;
    }

    // Catat juga sub-channel spesifik (misal QRIS, BCA_VA, GOPAY)
    const specificChannelKey = bank ? `${bank.toUpperCase()}_VA` : pType.toUpperCase();
    row.byPaymentMethod[specificChannelKey] = (row.byPaymentMethod[specificChannelKey] || 0) + amount;
  }

  // Jika tidak ada transaksi sama sekali di bulan tersebut, kembalikan array kosong terurut
  return Array.from(dailyMap.values()).sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

/**
 * Caching laporan bulan lalu via unstable_cache (PRD Bab 8 & Bab 11 Task 2.10)
 * Data bulan tertutup tidak akan berubah sehingga di-cache selama 24 jam dengan tag 'reports' dan 'finance'.
 */
export const getCachedPastMonthRevenue = unstable_cache(
  async (year: number, month: number) => {
    return queryDailyRevenueFromStore(month, year);
  },
  ['past-month-revenue-report-v2'],
  {
    revalidate: 86400, // 24 jam
    tags: ['reports', 'finance'],
  }
);

/**
 * Agregasi pemasukan harian untuk bulan dan tahun tertentu.
 * Otomatis menggunakan `unstable_cache` jika periode yang diminta adalah bulan lalu (bulan tertutup),
 * atau query langsung (real-time) jika bulan berjalan.
 */
export async function getDailyRevenueReport(
  monthNumber: number,
  year: number
): Promise<RevenueAggregationRow[]> {
  // Ambil data langsung dari database / store secara real-time agar selalu sinkron dengan transaksi terbaru
  return queryDailyRevenueFromStore(monthNumber, year);
}

/**
 * Agregasi pemasukan bulanan untuk 12 bulan dalam 1 tahun buku
 * Mengelompokkan transaksi sukses berdasarkan zona waktu Asia/Jakarta.
 */
export async function getMonthlyRevenueReport(year: number): Promise<RevenueAggregationRow[]> {
  const successful = getSuccessfulTransactions();
  const monthlyMap = new Map<string, RevenueAggregationRow>();

  const monthNames = [
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

  // Inisialisasi struktur 12 bulan penuh
  for (let m = 1; m <= 12; m++) {
    const mStr = String(m).padStart(2, '0');
    const periodKey = `${year}-${mStr}`;
    monthlyMap.set(periodKey, {
      periodKey,
      dateOrMonth: `${monthNames[m - 1]} ${year}`,
      totalIncome: 0,
      transactionCount: 0,
      byCategory: {
        sewaBulanan: 0,
        booking: 0,
        deposit: 0,
        denda: 0,
      },
      byPaymentMethod: {
        qris: 0,
        va: 0,
        ewallet: 0,
        other: 0,
      },
    });
  }

  // Agregasikan seluruh transaksi tahun target menurut zona waktu Asia/Jakarta
  for (const tx of successful) {
    const timeToEvaluate = tx.settlementTime || tx.createdAt;
    const jktDate = getJakartaDateComponents(timeToEvaluate);

    if (!jktDate) continue;
    if (jktDate.year !== year) continue;

    const row = monthlyMap.get(jktDate.monthKey);
    if (!row) continue;

    const amount = Number(tx.grossAmount) || 0;
    row.totalIncome += amount;
    row.transactionCount += 1;

    // Kategori
    if (tx.category === 'SEWA_BULANAN') {
      row.byCategory.sewaBulanan += amount;
    } else if (tx.category === 'BOOKING') {
      row.byCategory.booking += amount;
    } else if (tx.category === 'DEPOSIT') {
      row.byCategory.deposit += amount;
    } else if (tx.category === 'DENDA') {
      row.byCategory.denda += amount;
    }

    // Metode Pembayaran
    const pType = (tx.paymentType || '').toLowerCase();
    const bank = (tx.bank || '').toLowerCase();

    if (pType === 'qris') {
      row.byPaymentMethod.qris += amount;
    } else if (pType === 'bank_transfer' || pType.includes('va') || bank) {
      row.byPaymentMethod.va += amount;
    } else if (pType === 'gopay' || pType === 'shopeepay' || pType === 'ewallet') {
      row.byPaymentMethod.ewallet += amount;
    } else {
      row.byPaymentMethod.other += amount;
    }

    const specificChannelKey = bank ? `${bank.toUpperCase()}_VA` : pType.toUpperCase();
    row.byPaymentMethod[specificChannelKey] = (row.byPaymentMethod[specificChannelKey] || 0) + amount;
  }

  return Array.from(monthlyMap.values());
}

/**
 * Generator CSV dengan UTF-8 Byte Order Mark (\uFEFF) dan pemisah titik-koma (;)
 * Memastikan saat dibuka di Microsoft Excel (regional Indonesia / Windows),
 * setiap kolom langsung terpisah otomatis ke Kolom A, B, C, dst. dengan rapi.
 */
export function generateRevenueCsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  summaryRow?: (string | number)[]
): string {
  // UTF-8 Byte Order Mark (BOM)
  const BOM = '\uFEFF';
  const SEP = ';';

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(SEP) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const colCount = headers.length;
  const padRow = (cells: (string | number)[]) => {
    const padded = [...cells];
    while (padded.length < colCount) padded.push('');
    return padded.map(escapeCsv).join(SEP);
  };

  const metaLines = [
    padRow(['LAPORAN KEUANGAN RESMI KOS OMI SUNGAI BANGEK, PADANG']),
    padRow([title]),
    padRow(['Alamat', 'Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang']),
    padRow(['Zona Waktu', 'Asia/Jakarta (WIB) - Status Transaksi: LUNAS (Settlement & Tervalidasi Pengelola)']),
    padRow([]),
  ].join('\r\n');

  const headerLine = headers.map(escapeCsv).join(SEP);
  const rowLines = rows.map((r) => r.map(escapeCsv).join(SEP)).join('\r\n');
  const summaryLine = summaryRow
    ? `\r\n${padRow([])}\r\n${summaryRow.map(escapeCsv).join(SEP)}`
    : '';

  return `${BOM}${metaLines}\r\n${headerLine}\r\n${rowLines}${summaryLine}\r\n`;
}

// ============================================================================
// FUNGSI ANALITIK PENDUKUNG KEPUTUSAN OPERASIONAL PENGELOLA KOS OMI
// ============================================================================

/**
 * a) getOccupancyAnalytics()
 * Menghitung persentase okupansi kamar secara total serta perbandingan
 * Lantai 1 (kamar 1–33) vs Lantai 2 (kamar 34–67).
 */
export function getOccupancyAnalytics(): OccupancyAnalytics {
  const store = loadPersistentStore();
  const rooms = Array.isArray(store.rooms) && store.rooms.length > 0 ? store.rooms : ALL_ROOMS;

  // Gunakan satu sumber status kamar (db.rooms) yang sama persis dengan kartu ringkasan atas dan tabel bawah di /pengelola/dashboard
  const computeFloor = (floorNum: number, label: string) => {
    const floorRooms = rooms.filter((r) => {
      const codeNum = parseInt(r.code, 10);
      if (floorNum === 1) return r.floor === 1 || (codeNum >= 1 && codeNum <= 33);
      return r.floor === 2 || (codeNum >= 34 && codeNum <= 67);
    });

    const totalRooms = floorRooms.length;
    let occupiedRooms = 0;
    let bookedRooms = 0;
    let maintenanceRooms = 0;

    for (const r of floorRooms) {
      if (r.status === 'NONAKTIF') {
        maintenanceRooms++;
      } else if (r.status === 'TERISI') {
        occupiedRooms++;
      } else if (r.status === 'DIPESAN') {
        bookedRooms++;
      }
    }

    const availableRooms = Math.max(0, totalRooms - occupiedRooms - bookedRooms - maintenanceRooms);
    const activeCount = occupiedRooms + bookedRooms;
    const occupancyRate =
      totalRooms > 0 ? Number(((activeCount / totalRooms) * 100).toFixed(1)) : 0;

    return {
      floor: floorNum,
      label,
      totalRooms,
      occupiedRooms,
      bookedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate,
    };
  };

  const floor1 = computeFloor(1, 'Lantai 1 (Kamar 1–33)');
  const floor2 = computeFloor(2, 'Lantai 2 (Kamar 34–67)');

  const totalRooms = floor1.totalRooms + floor2.totalRooms;
  const occupiedRooms = floor1.occupiedRooms + floor2.occupiedRooms;
  const bookedRooms = floor1.bookedRooms + floor2.bookedRooms;
  const availableRooms = floor1.availableRooms + floor2.availableRooms;
  const maintenanceRooms = floor1.maintenanceRooms + floor2.maintenanceRooms;
  const totalOccupancyRate =
    totalRooms > 0
      ? Number((((occupiedRooms + bookedRooms) / totalRooms) * 100).toFixed(1))
      : 0;

  let recommendation = '';
  if (floor1.occupancyRate > floor2.occupancyRate) {
    recommendation = `Minat hunian Lantai 1 (${floor1.occupancyRate}%) lebih tinggi dibanding Lantai 2 (${floor2.occupancyRate}%). Prioritaskan promosi paket patungan 2 orang (Rp 2,5 Jt/slot) untuk ${floor2.availableRooms} kamar kosong di Lantai 2 menjelang semester baru UIN Imam Bonjol.`;
  } else if (floor2.occupancyRate > floor1.occupancyRate) {
    recommendation = `Okupansi Lantai 2 (${floor2.occupancyRate}%) mengungguli Lantai 1 (${floor1.occupancyRate}%). Arahkan calon penghuni baru ke ${floor1.availableRooms} kamar tersedia di Lantai 1 yang dekat area parkir & dapur umum.`;
  } else {
    recommendation = `Distribusi hunian Lantai 1 & Lantai 2 seimbang (${totalOccupancyRate}%). Optimalkan promosi katalog online untuk mengisi ${availableRooms} kamar yang masih tersedia.`;
  }

  return {
    totalRooms,
    occupiedRooms,
    bookedRooms,
    availableRooms,
    maintenanceRooms,
    totalOccupancyRate,
    floor1,
    floor2,
    recommendation,
  };
}

/**
 * b) getCollectionRateAnalytics()
 * Menghitung rasio tagihan LUNAS vs TERLAMBAT/BELUM_BAYAR (Collection Rate %).
 */
export function getCollectionRateAnalytics(): CollectionRateAnalytics {
  const billingBills = ((global as any).__kosOmiBillingState?.bills as any[] | undefined) || [];
  const overdueStore = ((global as any).__kosOmiOverdueBills as any[] | undefined) || [];
  const settledTxs = getSuccessfulTransactions();
  const allTxs = global.__kosOmiTransactions || defaultFallbackTransactions;
  const pendingTxs = allTxs.filter((tx) => tx.transactionStatus === 'pending');

  // Hitung tagihan LUNAS dari gabungan billing state dan transaksi settlement unik
  const paidInvoices = new Map<string, number>();
  for (const tx of settledTxs) {
    paidInvoices.set(tx.invoiceNumber || tx.orderId, Number(tx.grossAmount) || 5000000);
  }
  for (const b of billingBills) {
    if (b.status === 'LUNAS') {
      paidInvoices.set(b.invoiceCode || b.id, Number(b.totalAmount || b.rentAmount) || 5000000);
    }
  }

  // Hitung tagihan BELUM_BAYAR & TERLAMBAT
  const unpaidInvoices = new Map<string, { amount: number; isOverdue: boolean }>();
  for (const tx of pendingTxs) {
    const code = tx.invoiceNumber || tx.orderId;
    if (!paidInvoices.has(code)) {
      unpaidInvoices.set(code, {
        amount: Number(tx.grossAmount) || 5000000,
        isOverdue: false,
      });
    }
  }
  for (const b of billingBills) {
    const code = b.invoiceCode || b.id;
    if ((b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT') && !paidInvoices.has(code)) {
      unpaidInvoices.set(code, {
        amount: Number(b.totalAmount || b.rentAmount) || 5000000,
        isOverdue: b.status === 'TERLAMBAT',
      });
    }
  }
  for (const ob of overdueStore) {
    const code = ob.invoiceNumber || ob.id;
    if (!paidInvoices.has(code)) {
      unpaidInvoices.set(code, {
        amount: Number(ob.amount) || 5000000,
        isOverdue: ob.status === 'TERLAMBAT',
      });
    }
  }

  const paidBillsCount = paidInvoices.size;
  let unpaidBillsCount = 0;
  let overdueBillsCount = 0;
  let unpaidAmount = 0;

  for (const item of unpaidInvoices.values()) {
    if (item.isOverdue) overdueBillsCount++;
    else unpaidBillsCount++;
    unpaidAmount += item.amount;
  }

  const paidAmount = Array.from(paidInvoices.values()).reduce((sum, v) => sum + v, 0);
  const totalBillsCount = paidBillsCount + unpaidBillsCount + overdueBillsCount;
  const totalBilledAmount = paidAmount + unpaidAmount;

  const collectionRate =
    totalBillsCount > 0 ? Number(((paidBillsCount / totalBillsCount) * 100).toFixed(1)) : 100;
  const delinquencyRate =
    totalBillsCount > 0 ? Number((100 - collectionRate).toFixed(1)) : 0;

  let recommendation = '';
  if (collectionRate >= 90) {
    recommendation = `Kolektibilitas kas sangat sehat (${collectionRate}% tagihan semester lunas). Pertahankan pengingat WhatsApp otomatis H-3 sebelum jatuh tempo.`;
  } else if (collectionRate >= 75) {
    recommendation = `Kolektibilitas cukup baik (${collectionRate}%), namun terdapat ${unpaidBillsCount + overdueBillsCount} invoice belum lunas. Kirim pengingat WhatsApp dari menu Tagihan kepada penghuni terkait.`;
  } else {
    recommendation = `Perhatian: Rasio tunggakan mencapai ${delinquencyRate}% (${unpaidBillsCount + overdueBillsCount} tagihan). Segera lakukan tindak lanjut penagihan WhatsApp dan evaluasi batas waktu bayar 24 jam.`;
  }

  return {
    totalBillsCount,
    paidBillsCount,
    unpaidBillsCount,
    overdueBillsCount,
    totalBilledAmount,
    paidAmount,
    unpaidAmount,
    collectionRate,
    delinquencyRate,
    recommendation,
  };
}

/**
 * c) getReservationConversionAnalytics()
 * Menghitung rasio reservasi yang berhasil LUNAS/CHECKIN dibanding
 * DITOLAK/KEDALUWARSA/DIBATALKAN.
 */
export function getReservationConversionAnalytics(): ReservationConversionAnalytics {
  const dbReservations = ((global as any).__kosOmiDbState?.reservations as any[] | undefined) || [];
  const candidates = ((global as any).__kosOmiCheckinCandidates as any[] | undefined) || [];
  const settledTxs = getSuccessfulTransactions();

  // Hitung reservasi unik yang berhasil LUNAS / CHECKIN
  const convertedCodes = new Set<string>();
  const pendingOrApprovedCodes = new Set<string>();
  let rejectedCount = 0;
  let expiredOrCancelledCount = 0;

  for (const tx of settledTxs) {
    convertedCodes.add(tx.orderId);
  }
  for (const c of candidates) {
    if (c.status === 'LUNAS' || c.status === 'CHECKIN') {
      convertedCodes.add(c.reservationCode || c.invoiceCode || c.id);
    }
  }
  for (const rsv of dbReservations) {
    const code = rsv.code || rsv.id;
    if (rsv.status === 'PAID' || rsv.status === 'CHECKIN') {
      convertedCodes.add(code);
    } else if (rsv.status === 'APPROVED' || rsv.status === 'PENDING_REVIEW') {
      if (!convertedCodes.has(code) && !convertedCodes.has(`INV-${String(code).replace('RSV-', '')}`)) {
        pendingOrApprovedCodes.add(code);
      }
    } else if (rsv.status === 'REJECTED') {
      rejectedCount++;
    } else if (rsv.status === 'EXPIRED' || rsv.status === 'CANCELLED') {
      expiredOrCancelledCount++;
    }
  }

  const paidOrCheckinCount = convertedCodes.size;
  const pendingOrApprovedCount = pendingOrApprovedCodes.size;
  const dropOffTotal = rejectedCount + expiredOrCancelledCount;
  const totalReservations = paidOrCheckinCount + pendingOrApprovedCount + dropOffTotal;

  // Rasio konversi dihitung terhadap total reservasi (dan dibandingkan terhadap yang batal/ditolak)
  const conversionRate =
    totalReservations > 0
      ? Number(((paidOrCheckinCount / totalReservations) * 100).toFixed(1))
      : 100;
  const dropOffRate =
    totalReservations > 0
      ? Number(((dropOffTotal / totalReservations) * 100).toFixed(1))
      : 0;

  let recommendation = '';
  if (dropOffTotal === 0 && pendingOrApprovedCount > 0) {
    recommendation = `Konversi reservasi mencapai ${conversionRate}% (${paidOrCheckinCount} Lunas/Check-in, 0 Batal/Ditolak). Terdapat ${pendingOrApprovedCount} reservasi aktif yang sedang menunggu pembayaran/verifikasi.`;
  } else if (conversionRate >= 80) {
    recommendation = `Tingkat konversi reservasi sangat tinggi (${conversionRate}% berhasil Lunas/Check-in vs ${dropOffRate}% batal/ditolak). Proses verifikasi KTM/KRS berjalan efektif.`;
  } else {
    recommendation = `Terdapat ${dropOffTotal} reservasi gagal/kedaluwarsa (${dropOffRate}%). Percepat verifikasi KTM/KRS (< 6 jam) agar calon penghuni segera membayar sebelum masa berlaku 24 jam habis.`;
  }

  return {
    totalReservations,
    paidOrCheckinCount,
    pendingOrApprovedCount,
    rejectedCount,
    expiredOrCancelledCount,
    conversionRate,
    dropOffRate,
    recommendation,
  };
}

/**
 * Mengambil ketiga indikator analitik operasional sekaligus
 */
export function getOperationalDecisionAnalytics(): OperationalDecisionAnalytics {
  return {
    occupancy: getOccupancyAnalytics(),
    collectionRate: getCollectionRateAnalytics(),
    reservationConversion: getReservationConversionAnalytics(),
  };
}
