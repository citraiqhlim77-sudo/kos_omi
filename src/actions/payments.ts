'use server';

import {
  dbGetPaymentByInvoice,
  dbGetPaymentByReservationCode,
  dbSettlePayment,
  dbGetReservationByCode,
  dbGetRoomByCode,
} from '@/server/db';
import { PaymentInvoice, Reservation } from '@/types/reservation';
import { Room } from '@/types/room';
import { revalidatePath } from 'next/cache';
import { paymentGateway } from '@/lib/payment/gateway';

export interface PaymentVerificationResult {
  isVerified: boolean;
  status: 'SETTLEMENT' | 'UNPAID' | 'EXPIRED' | 'CANCELLED' | 'NOT_FOUND';
  message: string;
  payment: PaymentInvoice | null;
  reservation: Reservation | null;
  room: Room | null;
}

/**
 * MENGAMBIL ULANG STATUS PEMBAYARAN DARI SERVER SECARA RESMI (DATABASE)
 * Sesuai instruksi Task 2.11: Status pembayaran di halaman selesai diambil ulang
 * dari server database terpercaya, BUKAN mempercayai parameter URL!
 */
export async function fetchPaymentStatusFromServerAction(
  orderIdOrInvoiceCode: string
): Promise<PaymentVerificationResult> {
  try {
    if (!orderIdOrInvoiceCode || orderIdOrInvoiceCode.trim() === '') {
      return {
        isVerified: false,
        status: 'NOT_FOUND',
        message: 'Parameter nomor order atau invoice tidak disertakan dalam permintaan.',
        payment: null,
        reservation: null,
        room: null,
      };
    }

    const cleanCode = orderIdOrInvoiceCode.trim().toUpperCase();

    // 1. Coba cari berdasarkan invoiceCode
    let payment = await dbGetPaymentByInvoice(cleanCode);

    // 2. Jika tidak ditemukan, coba cari berdasarkan reservationCode (RSV-...)
    if (!payment) {
      payment = await dbGetPaymentByReservationCode(cleanCode);
    }

    // 3. Jika masih belum ditemukan dan kode tidak ber-prefix INV, coba tambahkan INV-
    if (!payment && !cleanCode.startsWith('INV-')) {
      payment = await dbGetPaymentByInvoice(`INV-${cleanCode}`);
    }

    if (!payment) {
      return {
        isVerified: false,
        status: 'NOT_FOUND',
        message: `Transaksi pembayaran ${orderIdOrInvoiceCode} tidak terdaftar di server database Kos Omi.`,
        payment: null,
        reservation: null,
        room: null,
      };
    }

    // Ambil data reservasi terkait langsung dari server
    const reservation = await dbGetReservationByCode(payment.reservationCode);
    let room: Room | null = null;
    if (reservation) {
      room = await dbGetRoomByCode(reservation.roomCode);
    }

    // Proaktif: jika status masih UNPAID / PENDING, konfirmasi langsung ke Midtrans Core API
    if (payment.status === 'UNPAID' || payment.status === 'PENDING') {
      try {
        const orderIdToCheck = cleanCode.startsWith('KOS-')
          ? cleanCode
          : (cleanCode.startsWith('INV-') ? cleanCode : `INV-${cleanCode}`);
        const statusRes = await paymentGateway.getTransactionStatus(orderIdToCheck);
        if (
          statusRes &&
          (statusRes.transactionStatus === 'settlement' ||
            (statusRes.transactionStatus === 'capture' && statusRes.fraudStatus === 'accept'))
        ) {
          const settleRes = await dbSettlePayment(
            payment.invoiceCode,
            statusRes.paymentType?.toUpperCase() || 'MIDTRANS'
          );
          if (settleRes.success && settleRes.payment) {
            payment = settleRes.payment;
          }
        }
      } catch {
        // Abaikan jika mock atau offline
      }
    }

    // Cek batas waktu jika status masih UNPAID
    if (payment.status === 'UNPAID' && new Date(payment.expiresAt).getTime() < Date.now()) {
      payment.status = 'EXPIRED';
    }

    const isSettled = payment.status === 'SETTLEMENT';
    const normalizedStatus: PaymentVerificationResult['status'] =
      payment.status === 'PENDING' ? 'UNPAID' : payment.status;

    return {
      isVerified: isSettled,
      status: normalizedStatus,
      message: isSettled
        ? 'Pembayaran berhasil diverifikasi secara resmi dan lunas pada server database Kos Omi.'
        : normalizedStatus === 'UNPAID'
        ? 'Status invoice masih menunggu pembayaran. Silakan selesaikan transaksi melalui Midtrans.'
        : 'Status pembayaran telah kedaluwarsa atau dibatalkan.',
      payment,
      reservation,
      room,
    };
  } catch (error: any) {
    console.error('Error verifying payment on server:', error);
    return {
      isVerified: false,
      status: 'NOT_FOUND',
      message: error?.message || 'Gagal memverifikasi status pembayaran dari server.',
      payment: null,
      reservation: null,
      room: null,
    };
  }
}

/**
 * Server Action untuk menyelesaikan pembayaran (simulasi Midtrans Snap Webhook / Settle)
 * Memverifikasi dan memperbarui status invoice ke SETTLEMENT di server
 */
export async function settlePaymentAction(
  invoiceCode: string,
  paymentMethod: string = 'QRIS'
): Promise<{ success: boolean; message: string; payment?: PaymentInvoice }> {
  try {
    const result = await dbSettlePayment(invoiceCode, paymentMethod);

    if (result.success) {
      revalidatePath('/');
      revalidatePath('/kamar');
      revalidatePath('/calon');
      revalidatePath('/pembayaran/selesai');
      revalidatePath('/penghuni');
      revalidatePath('/penghuni/tagihan');
      revalidatePath('/pengelola/kamar');
      revalidatePath('/pengelola/checkin');
      revalidatePath('/keuangan');
      revalidatePath('/keuangan/dashboard');
      revalidatePath('/keuangan/transaksi');
      revalidatePath('/keuangan/laporan');
      revalidatePath('/keuangan/rekonsiliasi');
    }

    return {
      success: result.success,
      message: result.message,
      payment: result.payment,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal memproses konfirmasi pembayaran pada server',
    };
  }
}

/**
 * Membuat atau mengambil Snap Token Midtrans untuk invoice pembayaran (PRD Bab 7 & Bab 11 Task 2.6).
 * Mencegah duplikasi transaksi pada order_id yang sama.
 */
export async function getOrCreateSnapTokenAction(invoiceCode: string): Promise<{
  success: boolean;
  message: string;
  snapToken?: string;
  redirectUrl?: string;
}> {
  try {
    const cleanCode = invoiceCode.trim().toUpperCase();
    const result = await paymentGateway.createSnapForInvoice(cleanCode);

    return {
      success: true,
      message: result.alreadyExisted
        ? 'Menggunakan sesi transaksi aktif'
        : 'Sesi pembayaran Midtrans berhasil dibuat',
      snapToken: result.token,
      redirectUrl: result.redirectUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal membuat sesi pembayaran Midtrans',
    };
  }
}
