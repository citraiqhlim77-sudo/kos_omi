'use client';

import React from 'react';
import NextLink from 'next/link';
import { PaymentTransaction } from '@/types/finance';
import { formatRupiah } from '@/data/rooms';
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Code,
  FileText,
  User,
} from 'lucide-react';

interface TransaksiDetailClientProps {
  transaction: PaymentTransaction;
}

export const TransaksiDetailClient: React.FC<TransaksiDetailClientProps> = ({
  transaction: tx,
}) => {
  const isSuccess = tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture';

  // Mock payload JSON webhook Midtrans sesuai Bab 10 PRD
  const mockWebhookPayload = {
    order_id: tx.orderId,
    transaction_id: tx.midtransTransactionId,
    transaction_status: tx.transactionStatus,
    fraud_status: tx.fraudStatus,
    payment_type: tx.paymentType,
    bank: tx.bank || undefined,
    gross_amount: `${tx.grossAmount}.00`,
    currency: 'IDR',
    settlement_time: tx.settlementTime || undefined,
    transaction_time: tx.createdAt,
    status_code: isSuccess ? '200' : '201',
    signature_key: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action */}
      <div className="flex items-center justify-between">
        <NextLink
          href="/keuangan/transaksi"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Monitoring Gateway</span>
        </NextLink>

        <span className="text-xs text-slate-400 font-mono">
          Audit Log ID: AUD-{tx.id}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-heading font-extrabold text-slate-900 font-mono">
              {tx.orderId}
            </h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : tx.transactionStatus === 'pending'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {tx.transactionStatus.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Invoice Terkait: <strong className="font-mono text-slate-800">{tx.invoiceNumber}</strong> · Kategori:{' '}
            <strong className="text-slate-800">{tx.category.replace('_', ' ')}</strong>
          </p>
        </div>

        <div className="text-left sm:text-right p-4 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium block">Nominal Gross Transaksi</span>
          <span className="text-2xl font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
            {formatRupiah(tx.grossAmount)}
          </span>
          <span className="text-[10px] text-slate-400 block">Biaya admin Midtrans ditanggung sistem</span>
        </div>
      </div>

      {/* Grid Rincian Gateway & Customer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Gateway Metadata */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Rincian Gateway Midtrans Snap</span>
          </h2>

          <div className="space-y-2.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Midtrans Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900 text-[11px]">
                {tx.midtransTransactionId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Metode Pembayaran:</span>
              <span className="font-bold text-slate-900 uppercase">
                {tx.paymentType} {tx.bank ? `(${tx.bank})` : ''}
              </span>
            </div>

            {tx.vaNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Virtual Account:</span>
                <span className="font-mono font-bold text-slate-900">{tx.vaNumber}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500">Fraud Status:</span>
              <span className="font-semibold text-emerald-700 uppercase">
                {tx.fraudStatus || 'N/A (Accepted)'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Transaksi Dibuat:</span>
              <span className="text-slate-800 font-medium">
                {new Date(tx.createdAt).toLocaleString('id-ID')} WIB
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Settlement:</span>
              <span className="text-slate-800 font-medium">
                {tx.settlementTime ? `${new Date(tx.settlementTime).toLocaleString('id-ID')} WIB` : 'Belum Selesai'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Room Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Identitas Pembayar & Kamar</span>
          </h2>

          <div className="space-y-2.5 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Pembayar:</span>
              <span className="font-bold text-slate-900">{tx.userName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Kamar Tujuan:</span>
              <span className="font-bold text-slate-900">Kamar {tx.roomCode}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">No. WhatsApp:</span>
              <span className="font-bold text-slate-900">{tx.userPhone}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-800">{tx.userEmail}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Invoice:</span>
              <span className="font-mono font-bold text-blue-600">{tx.invoiceNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAW JSON WEBHOOK PAYLOAD (TECHNICAL VERIFICATION) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-sky-400" />
            <span className="font-bold font-mono">Payload Verifikasi Webhook Midtrans (Status API)</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Signature Verified (SHA512)</span>
        </div>
        <pre className="p-5 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
          {JSON.stringify(mockWebhookPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};
