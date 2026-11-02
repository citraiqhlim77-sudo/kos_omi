import { unstable_cache } from 'next/cache';
import { PaymentTransaction } from '@/types/finance';

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

// Data transaksi awal sebagai fallback jika store belum terisi
const defaultFallbackTransactions: PaymentTransaction[] = [
  {
    id: 'tx-001',
    orderId: 'KOS-202506-00012',
    invoiceNumber: 'INV-202506-00045',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670001',
    userName: 'Rina Wulandari',
    userPhone: '081234567890',
    userEmail: 'rina.wulandari@gmail.com',
    roomCode: 'A-101',
    category: 'SEWA_BULANAN',
    paymentType: 'qris',
    grossAmount: 1100000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-06-03T10:15:22+07:00',
    createdAt: '2025-06-03T10:12:00+07:00',
  },
  {
    id: 'tx-004',
    orderId: 'KOS-202506-00015',
    invoiceNumber: 'INV-202506-00048',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670004',
    userName: 'Bagas Kurniawan',
    userPhone: '085712349988',
    userEmail: 'bagas.kurniawan@gmail.com',
    roomCode: 'D-404',
    category: 'BOOKING',
    paymentType: 'bank_transfer',
    bank: 'bca',
    grossAmount: 2200000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-05-30T14:20:15+07:00',
    createdAt: '2025-05-30T14:05:00+07:00',
    vaNumber: '8801234567890002',
  },
  {
    id: 'tx-005',
    orderId: 'KOS-202506-00016',
    invoiceNumber: 'INV-202506-00049',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670005',
    userName: 'Anisa Permata',
    userPhone: '082188776655',
    userEmail: 'anisa.permata@gmail.com',
    roomCode: 'A-112',
    category: 'BOOKING',
    paymentType: 'qris',
    grossAmount: 2200000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-05-31T09:10:45+07:00',
    createdAt: '2025-05-31T09:00:00+07:00',
  },
  {
    id: 'tx-006',
    orderId: 'KOS-202506-00017',
    invoiceNumber: 'INV-202506-00050',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670006',
    userName: 'Fajar Nugraha',
    userPhone: '081223344556',
    userEmail: 'fajar.nugraha@gmail.com',
    roomCode: 'B-201',
    category: 'SEWA_BULANAN',
    paymentType: 'bank_transfer',
    bank: 'mandiri',
    grossAmount: 1100000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-06-02T11:40:00+07:00',
    createdAt: '2025-06-02T11:30:00+07:00',
    vaNumber: '8901234567890003',
  },
  {
    id: 'tx-007',
    orderId: 'KOS-202506-00018',
    invoiceNumber: 'INV-202506-00051',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670007',
    userName: 'Dewi Lestari',
    userPhone: '087811223344',
    userEmail: 'dewi.lestari@gmail.com',
    roomCode: 'C-302',
    category: 'SEWA_BULANAN',
    paymentType: 'shopeepay',
    grossAmount: 1450000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-06-03T16:25:00+07:00',
    createdAt: '2025-06-03T16:20:00+07:00',
  },
];

/**
 * Mengambil transaksi sukses:
 * Sesuai PRD Bab 5.G.2 & Task 2.10: Hanya status 'settlement' dan 'capture'
 * (dengan fraud_status !== 'deny' dan fraud_status !== 'challenge').
 * Transaksi 'pending', 'cancel', 'expire', dan 'deny' TIDAK PERNAH dihitung sebagai pemasukan.
 */
export function getSuccessfulTransactions(): PaymentTransaction[] {
  const store = global.__kosOmiTransactions || defaultFallbackTransactions;
  return store.filter((tx) => {
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
  const currentJkt = getCurrentJakartaDate();

  // Evaluasi apakah periode yang diminta sudah tertutup (bulan sebelum bulan berjalan)
  const isPastMonth =
    year < currentJkt.year || (year === currentJkt.year && monthNumber < currentJkt.month);

  if (isPastMonth) {
    return getCachedPastMonthRevenue(year, monthNumber);
  }

  // Bulan berjalan: ambil data langsung dari database / store secara real-time
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
 * Generator CSV dengan UTF-8 Byte Order Mark (\uFEFF)
 * Memastikan kompatibilitas mutlak dengan Microsoft Excel di Windows & macOS
 * tanpa masalah encoding karakter atau pembagian kolom.
 */
export function generateRevenueCsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  summaryRow?: (string | number)[]
): string {
  // UTF-8 Byte Order Mark (BOM)
  const BOM = '\uFEFF';

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCsv).join(',');
  const rowLines = rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
  const summaryLine = summaryRow ? `\r\n${summaryRow.map(escapeCsv).join(',')}` : '';

  return `${BOM}# ${title}\r\n# Zona Waktu: Asia/Jakarta (WIB) | Status: Settlement & Capture (Accept)\r\n${headerLine}\r\n${rowLines}${summaryLine}\r\n`;
}
