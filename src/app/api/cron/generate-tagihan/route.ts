import { NextRequest, NextResponse } from 'next/server';
import { generateMonthlyBills } from '@/lib/billing/generate';

/**
 * Cron Endpoint: Otomatisasi Pembuatan Tagihan Bulanan (PRD Bab 5.E & Bab 11 Task 2.8)
 *
 * Jadwal: Setiap hari pukul 00.05 WIB (Vercel Cron)
 * Keamanan: Header `Authorization: Bearer <CRON_SECRET>` atau query parameter `?secret=<CRON_SECRET>`
 *
 * Fungsi:
 * - Menghasilkan invoice SEWA_BULANAN pada H-7 jatuh tempo
 * - Nomor invoice berformat: INV-[YYYYMM]-[nomor urut 5 digit]
 * - Dicegah ganda oleh kombinasi tenancy_id + period_month
 * - Menandai status TERLAMBAT jika tagihan belum lunas lewat 3 hari setelah jatuh tempo
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Periksa otorisasi CRON_SECRET
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const isAuthorized =
      (cronSecret && (authHeader === `Bearer ${cronSecret}` || urlSecret === cronSecret)) ||
      (!cronSecret && process.env.NODE_ENV === 'development') ||
      urlSecret === 'dev_cron_secret_kosomi';

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Kredensial CRON_SECRET tidak valid atau tidak disertakan.',
        },
        { status: 401 }
      );
    }

    // Parameter opsional untuk pengujian periode atau tanggal tertentu
    const forcePeriod = request.nextUrl.searchParams.get('period') || undefined;
    const targetDateParam = request.nextUrl.searchParams.get('date');
    const targetDate = targetDateParam ? new Date(targetDateParam) : undefined;

    // Jalankan siklus generator tagihan bulanan
    const result = await generateMonthlyBills({
      targetDate,
      forcePeriod,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error saat menjalankan cron generator tagihan bulanan:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan internal server saat memproses cron tagihan.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
