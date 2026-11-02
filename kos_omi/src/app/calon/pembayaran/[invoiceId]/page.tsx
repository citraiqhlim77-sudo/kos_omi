import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPaymentStatusFromServerAction } from '@/actions/payments';
import { fetchRoomByCodeAction } from '@/actions/rooms';
import { PaymentInvoiceClient } from '@/components/calon/PaymentInvoiceClient';

interface CalonPaymentPageProps {
  params: Promise<{ invoiceId: string }>;
}

export async function generateMetadata({ params }: CalonPaymentPageProps): Promise<Metadata> {
  const { invoiceId } = await params;
  return {
    title: `Pembayaran Tagihan ${invoiceId.toUpperCase()} - Kos Omi Sungai Bangek`,
    description: `Halaman rincian invoice dan pembayaran resmi Midtrans Snap untuk reservasi kamar ${invoiceId.toUpperCase()} Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).`,
  };
}

export default async function CalonPaymentInvoicePage({ params }: CalonPaymentPageProps) {
  const { invoiceId } = await params;
  const normalizedId = invoiceId.toUpperCase().trim();

  const serverResult = await fetchPaymentStatusFromServerAction(normalizedId);

  let payment = serverResult.payment;
  let reservation = serverResult.reservation;
  let room = serverResult.room;

  // Fallback data jika mengakses invoice dummy spesifik PRD yang belum tersimpan di state
  if (!payment) {
    if (normalizedId === 'INV-202506-00045') {
      payment = {
        id: 'inv-dummy-45',
        invoiceCode: 'INV-202506-00045',
        reservationId: 'rsv-dummy-45',
        reservationCode: 'RSV-202506-B204',
        roomCode: 'B-204',
        amount: 2200000,
        status: 'UNPAID',
        paymentMethod: 'QRIS',
        snapToken: 'snap-token-inv-202506-00045',
        snapRedirectUrl: '/pembayaran/selesai?order_id=INV-202506-00045',
        expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      };
      room = await fetchRoomByCodeAction('B-204');
    } else {
      notFound();
    }
  }

  if (!room && payment) {
    room = await fetchRoomByCodeAction(payment.roomCode);
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PaymentInvoiceClient
          invoice={payment}
          reservation={reservation}
          room={room}
        />
      </div>
    </div>
  );
}
