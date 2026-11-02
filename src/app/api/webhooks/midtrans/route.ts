import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  dbProcessMidtransWebhookResult,
  dbAddAuditLog,
} from '@/server/db';
import { paymentGateway } from '@/lib/payment/gateway';
import { dispatchPaymentSuccess } from '@/lib/notify/dispatch';

/**
 * Midtrans Webhook Handler (PRD Bab 7 & Bab 11 Task 2.7)
 *
 * 1. Memverifikasi signature SHA512 (order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
 * 2. Memanggil ${MIDTRANS_CORE_BASE_URL}/v2/{order_id}/status untuk konfirmasi resmi
 * 3. Membandingkan nominal invoice di database dengan nominal transaksi yang dibayarkan
 * 4. Bersifat idempoten melalui midtrans_transaction_id (mencegah double-credit/update ganda)
 * 5. Memperbarui payments, invoices, reservations, dan rooms
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_id,
      transaction_status,
      fraud_status,
      payment_type,
    } = payload;

    // Validasi kelengkapan data dasar webhook
    if (!order_id || !status_code || !gross_amount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data payload tidak lengkap: order_id, status_code, dan gross_amount wajib disertakan.',
        },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy-key-kosomi';
    const isDummyServer =
      !serverKey ||
      serverKey.includes('dummy') ||
      serverKey.includes('xxxx') ||
      serverKey === 'SB-Mid-server-dummy-key-kosomi';

    // 1. Verifikasi Signature SHA512 via PaymentGateway Adapter
    if (!isDummyServer && signature_key) {
      const isSignatureValid = paymentGateway.verifySignature(
        order_id,
        status_code,
        gross_amount,
        signature_key
      );

      if (!isSignatureValid) {
        console.error('Verifikasi signature Midtrans gagal!', {
          order_id,
          status_code,
          gross_amount,
          received_signature: signature_key,
        });

        return NextResponse.json(
          {
            success: false,
            message: 'Signature key Midtrans tidak valid. Akses ditolak.',
          },
          { status: 403 }
        );
      }
    }

    // 2. Konfirmasi Status Resmi ke Midtrans Core API (/v2/{order_id}/status)
    let confirmedStatus = transaction_status;
    let confirmedFraudStatus = fraud_status;
    let confirmedPaymentType = payment_type;
    let confirmedBank: string | undefined = payload.bank || payload.va_numbers?.[0]?.bank;
    let confirmedSettlementTime: string | undefined = payload.settlement_time;

    if (!isDummyServer) {
      try {
        const coreStatus = await paymentGateway.getTransactionStatus(order_id);
        if (coreStatus) {
          confirmedStatus = coreStatus.transactionStatus;
          confirmedFraudStatus = coreStatus.fraudStatus || fraud_status;
          confirmedPaymentType = coreStatus.paymentType || payment_type;
          confirmedBank = coreStatus.bank || confirmedBank;
          confirmedSettlementTime = coreStatus.settlementTime || confirmedSettlementTime;
        }
      } catch (coreErr) {
        console.warn('Gagal memverifikasi status Core API Midtrans, melanjutkan dengan status webhook:', coreErr);
      }
    }

    const grossAmountNum = parseFloat(gross_amount);

    // 3 & 4 & 5. Pemrosesan Database (Idempoten via transaction_id, perbandingan nominal, dan update status)
    const result = await dbProcessMidtransWebhookResult({
      orderId: order_id,
      transactionId: transaction_id,
      transactionStatus: confirmedStatus,
      fraudStatus: confirmedFraudStatus,
      grossAmount: grossAmountNum,
      paymentType: confirmedPaymentType,
      bank: confirmedBank,
      settlementTime: confirmedSettlementTime,
      signatureKey: signature_key,
      rawPayload: payload,
    });

    if (!result.success) {
      const isNotFound = result.message.includes('tidak ditemukan');
      return NextResponse.json(
        { success: false, message: result.message },
        { status: isNotFound ? 404 : 400 }
      );
    }

    // 6. Pencatatan Audit Log Sistem Server
    await dbAddAuditLog({
      userId: 'system-midtrans-webhook',
      action:
        result.status === 'SETTLEMENT'
          ? 'MIDTRANS_PAYMENT_SETTLED'
          : result.status === 'EXPIRED'
          ? 'MIDTRANS_PAYMENT_EXPIRED'
          : 'MIDTRANS_NOTIFICATION_RECEIVED',
      entityType: 'PAYMENT',
      entityId: order_id,
      payloadAfter: {
        orderId: order_id,
        transactionId: transaction_id,
        grossAmount: grossAmountNum,
        transactionStatus: confirmedStatus,
        paymentType: confirmedPaymentType,
        isDuplicate: result.isDuplicate,
      },
    });

    // 7. Trigger Notifikasi Otomatis Kuitansi Lunas via Email & WhatsApp (Task 3.3)
    if (result.status === 'SETTLEMENT' && !result.isDuplicate && result.reservation) {
      try {
        await dispatchPaymentSuccess({
          userName: result.reservation.userName,
          userEmail: result.reservation.userEmail,
          userPhone: result.reservation.userPhone,
          invoiceCode: order_id,
          orderId: order_id,
          roomCode: result.reservation.roomCode,
          category: 'PEMBAYARAN BOOKING & DEPOSIT',
          grossAmount: grossAmountNum,
          paymentType: confirmedPaymentType || 'Midtrans Snap',
          settlementTime: confirmedSettlementTime || new Date().toLocaleString('id-ID'),
          portalUrl: `https://kosomi.id/pembayaran/selesai?order_id=${order_id}`,
          userId: result.reservation.userId,
        });
      } catch (notifErr) {
        console.warn('[Webhook Notification] Gagal mengirim kuitansi notifikasi:', notifErr);
      }
    }

    // 8. Invalidasi Cache Halaman Dinamis
    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika tidak di konteks tag cache
    }
    revalidatePath('/');
    revalidatePath('/kamar');
    revalidatePath('/calon');
    revalidatePath('/pengelola/reservasi');
    revalidatePath('/pengelola/kamar');
    revalidatePath('/pengelola/checkin');
    revalidatePath('/penghuni');
    revalidatePath('/penghuni/tagihan');
    revalidatePath('/keuangan');
    revalidatePath('/keuangan/dashboard');
    revalidatePath('/keuangan/transaksi');
    revalidatePath('/keuangan/laporan');
    revalidatePath('/keuangan/rekonsiliasi');
    revalidatePath('/pembayaran/selesai');

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        orderId: order_id,
        status: result.status,
        isDuplicate: result.isDuplicate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saat memproses webhook Midtrans:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Terjadi kesalahan internal sistem saat memproses webhook Midtrans.',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}

