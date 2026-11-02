import { NextRequest, NextResponse } from 'next/server';
import { cancelExpiredReservations } from '@/actions/reservations';

/**
 * Cron Endpoint: Otomatisasi Pembatalan Reservasi Kedaluwarsa (PRD Bab 5.C & Bab 11 Task 2.5)
 * Membatalkan reservasi APPROVED yang invoice-nya tidak dibayar dalam 24 jam,
 * mengembalikan kamar ke status TERSEDIA, dan menandai invoice EXPIRED.
 * Dilindungi otorisasi CRON_SECRET (Vercel Cron / Job Scheduler).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev_cron_secret_kosomi';

    // Periksa otorisasi CRON_SECRET via Bearer token atau query secret
    const urlSecret = request.nextUrl.searchParams.get('secret');
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      urlSecret === cronSecret ||
      process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid CRON_SECRET' },
        { status: 401 }
      );
    }

    const result = await cancelExpiredReservations();

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error running cancel-expired-reservations cron:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error running cancellation cron' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
