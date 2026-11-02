import { NextRequest, NextResponse } from 'next/server';
import {
  getDailyRevenueReport,
  getMonthlyRevenueReport,
  generateRevenueCsv,
  getCurrentJakartaDate,
} from '@/lib/reports/revenue';
import { getCurrentUser } from '@/lib/auth-server';

/**
 * Endpoint Ekspor Laporan Keuangan ke format CSV UTF-8 dengan BOM (PRD Bab 8 & Bab 11 Task 2.10)
 * Parameter Query:
 * - type: 'daily' | 'monthly' (default: 'daily' jika month dispesifikasi, atau 'monthly')
 * - month: 1..12 (untuk laporan harian)
 * - year: YYYY (contoh: 2025 atau 2026)
 *
 * Header Keamanan:
 * - Otorisasi ketat peran ADMIN & KEUANGAN (Bab 5 PRD)
 * - Content-Type: text/csv; charset=utf-8
 * - UTF-8 BOM (\uFEFF) untuk kompatibilitas penuh Microsoft Excel Windows/Mac
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi Otorisasi Peran (Hanya ADMIN dan KEUANGAN sesuai PRD Bab 5)
    const user = await getCurrentUser();

    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEUANGAN')) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Akses ditolak (403 Forbidden). Hanya Staf Keuangan dan Admin yang memiliki izin mengunduh laporan keuangan resmi.',
        },
        { status: 403 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator.',
        },
        { status: 403 }
      );
    }

    // 2. Baca Parameter Query dengan Default Tanggal Asia/Jakarta
    const { searchParams } = request.nextUrl;
    const currentJkt = getCurrentJakartaDate();

    const paramType = searchParams.get('type');
    const paramYear = searchParams.get('year');
    const paramMonth = searchParams.get('month');

    const year = paramYear ? parseInt(paramYear, 10) : currentJkt.year;
    const month = paramMonth ? parseInt(paramMonth, 10) : currentJkt.month;
    const type = paramType || (paramMonth ? 'daily' : 'monthly');

    let filename = '';
    let csvData = '';

    const headers = [
      type === 'daily' ? 'Tanggal' : 'Bulan',
      'Total Pemasukan (IDR)',
      'Jumlah Transaksi',
      'Sewa Bulanan (IDR)',
      'Booking (IDR)',
      'Deposit (IDR)',
      'Denda (IDR)',
      'QRIS (IDR)',
      'Virtual Account (IDR)',
      'E-Wallet (IDR)',
    ];

    if (type === 'daily') {
      const data = await getDailyRevenueReport(month, year);
      const monthStr = String(month).padStart(2, '0');

      let grandTotalIncome = 0;
      let grandTotalTx = 0;
      let grandTotalSewa = 0;
      let grandTotalBooking = 0;
      let grandTotalDeposit = 0;
      let grandTotalDenda = 0;
      let grandTotalQris = 0;
      let grandTotalVa = 0;
      let grandTotalEwallet = 0;

      const rows = data.map((d) => {
        grandTotalIncome += d.totalIncome;
        grandTotalTx += d.transactionCount;
        grandTotalSewa += d.byCategory.sewaBulanan;
        grandTotalBooking += d.byCategory.booking;
        grandTotalDeposit += d.byCategory.deposit;
        grandTotalDenda += d.byCategory.denda;
        grandTotalQris += d.byPaymentMethod.qris || 0;
        grandTotalVa += d.byPaymentMethod.va || 0;
        grandTotalEwallet += d.byPaymentMethod.ewallet || 0;

        return [
          d.dateOrMonth,
          d.totalIncome,
          d.transactionCount,
          d.byCategory.sewaBulanan,
          d.byCategory.booking,
          d.byCategory.deposit,
          d.byCategory.denda,
          d.byPaymentMethod.qris || 0,
          d.byPaymentMethod.va || 0,
          d.byPaymentMethod.ewallet || 0,
        ];
      });

      const summaryRow = [
        'TOTAL KESELURUHAN',
        grandTotalIncome,
        grandTotalTx,
        grandTotalSewa,
        grandTotalBooking,
        grandTotalDeposit,
        grandTotalDenda,
        grandTotalQris,
        grandTotalVa,
        grandTotalEwallet,
      ];

      const title = `Laporan Keuangan Harian Kos Omi - Periode ${monthStr}/${year}`;
      csvData = generateRevenueCsv(title, headers, rows, summaryRow);
      filename = `laporan-harian-kosomi-${year}-${monthStr}.csv`;
    } else {
      const data = await getMonthlyRevenueReport(year);

      let grandTotalIncome = 0;
      let grandTotalTx = 0;
      let grandTotalSewa = 0;
      let grandTotalBooking = 0;
      let grandTotalDeposit = 0;
      let grandTotalDenda = 0;
      let grandTotalQris = 0;
      let grandTotalVa = 0;
      let grandTotalEwallet = 0;

      const rows = data.map((d) => {
        grandTotalIncome += d.totalIncome;
        grandTotalTx += d.transactionCount;
        grandTotalSewa += d.byCategory.sewaBulanan;
        grandTotalBooking += d.byCategory.booking;
        grandTotalDeposit += d.byCategory.deposit;
        grandTotalDenda += d.byCategory.denda;
        grandTotalQris += d.byPaymentMethod.qris || 0;
        grandTotalVa += d.byPaymentMethod.va || 0;
        grandTotalEwallet += d.byPaymentMethod.ewallet || 0;

        return [
          d.dateOrMonth,
          d.totalIncome,
          d.transactionCount,
          d.byCategory.sewaBulanan,
          d.byCategory.booking,
          d.byCategory.deposit,
          d.byCategory.denda,
          d.byPaymentMethod.qris || 0,
          d.byPaymentMethod.va || 0,
          d.byPaymentMethod.ewallet || 0,
        ];
      });

      const summaryRow = [
        'TOTAL KESELURUHAN',
        grandTotalIncome,
        grandTotalTx,
        grandTotalSewa,
        grandTotalBooking,
        grandTotalDeposit,
        grandTotalDenda,
        grandTotalQris,
        grandTotalVa,
        grandTotalEwallet,
      ];

      const title = `Laporan Keuangan Bulanan Kos Omi - Tahun Buku ${year}`;
      csvData = generateRevenueCsv(title, headers, rows, summaryRow);
      filename = `laporan-tahunan-kosomi-${year}.csv`;
    }

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error saat membuat ekspor CSV laporan keuangan:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan sistem saat mengekspor laporan keuangan CSV',
      },
      { status: 500 }
    );
  }
}
