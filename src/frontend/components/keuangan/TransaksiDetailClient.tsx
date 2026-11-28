'use client';

import React from 'react';
import NextLink from 'next/link';
import { PaymentTransaction } from '@/types/finance';
import { formatPaymentCategoryLabel } from '@/lib/reports/labels';
import { formatRupiah } from '@/data/rooms';
import {
ArrowLeft,
CheckCircle2,
Clock,
ShieldCheck,
AlertTriangle,
FileText,
User,
} from 'lucide-react';

interface TransaksiDetailClientProps {
  transaction: PaymentTransaction;
}

function formatPaymentMethodLabel(paymentType: string, bank?: string | null): string {
  const type = (paymentType || '').toLowerCase();
  const bankUpper = bank ? bank.toUpperCase() : '';
  if (type === 'qris') return 'QRIS';
  if (type === 'dana') return 'DANA';
  if (type === 'gopay') return 'GoPay';
  if (type === 'shopeepay') return 'ShopeePay';
  if (type === 'bank_transfer' || type.includes('va')) {
    return bankUpper ? `Transfer Bank ${bankUpper}` : 'Transfer Bank (Virtual Account)';
  }
  if (bankUpper) return `Transfer Bank ${bankUpper}`;
  return 'Transfer Bank / QRIS';
}

function formatVerificationStatusLabel(status: string): {
  label: string;
  badgeClass: string;
} {
  const s = (status || '').toLowerCase();
  if (s === 'settlement' || s === 'capture' || s === 'paid' || s === 'lunas') {
    return {
      label: 'Terverifikasi / Lunas',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    };
  }
  if (s === 'pending' || s === 'unpaid') {
    return {
      label: 'Menunggu Pembayaran',
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
    };
  }
  return {
    label: 'Kedaluwarsa',
    badgeClass: 'bg-rose-50 text-rose-800 border border-rose-200',
  };
}

function formatIndonesianDateTime(isoString?: string | null): string {
  if (!isoString) return 'Menunggu Pelunasan';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const datePart = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart}, pukul ${timePart} WIB`;
}

export const TransaksiDetailClient: React.FC<TransaksiDetailClientProps> = ({
  transaction: tx,
}) => {
  const isSuccess = tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture';
  const statusInfo = formatVerificationStatusLabel(tx.transactionStatus);
  const methodLabel = formatPaymentMethodLabel(tx.paymentType, tx.bank);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <NextLink
          href="/keuangan/transaksi"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Transaksi</span>
        </NextLink>

        <span className="text-xs text-zinc-400 tabular-nums">
          ID Pencatatan: #{tx.id}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white p-5 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 tabular-nums break-all">
              {tx.orderId}
            </h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-md ${statusInfo.badgeClass}`}>
              {statusInfo.label}
            </span>
          </div>

          <p className="text-xs text-zinc-500 break-words">
            Nomor Tagihan: <strong className="tabular-nums text-zinc-800">{tx.invoiceNumber}</strong> · Kategori:{' '}
            <strong className="text-zinc-800">{formatPaymentCategoryLabel(tx.category)}</strong>
          </p>
        </div>

        <div className="text-left sm:text-right p-4 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
          <span className="text-[11px] text-zinc-500 font-medium block">Total Nominal Transaksi</span>
          <span className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
            {formatRupiah(tx.grossAmount)}
          </span>
          <span className="text-[10px] text-zinc-400 block">Bebas biaya administrasi tambahan</span>
        </div>
      </div>

      {/* Grid Rincian Pembayaran & Pembayar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Gateway Metadata */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 space-y-4 text-xs">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Informasi Saluran Pembayaran</span>
          </h2>

          <div className="space-y-3 text-zinc-600">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">ID Referensi Pembayaran:</span>
              <span className="tabular-nums font-bold text-zinc-900 break-all sm:text-right">
                {tx.midtransTransactionId}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Metode Pembayaran:</span>
              <span className="font-bold text-zinc-900 sm:text-right">
                {methodLabel}
              </span>
            </div>

            {tx.vaNumber && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-zinc-500">Nomor Virtual Account:</span>
                <span className="tabular-nums font-bold text-zinc-900 break-all sm:text-right">{tx.vaNumber}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Keamanan Transaksi:</span>
              <span className="font-semibold text-emerald-700 sm:text-right">
                Aman & Terverifikasi Sistem
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Waktu Transaksi:</span>
              <span className="text-zinc-800 font-medium sm:text-right">
                {formatIndonesianDateTime(tx.createdAt)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Waktu Pelunasan:</span>
              <span className="text-zinc-800 font-medium sm:text-right">
                {tx.settlementTime ? formatIndonesianDateTime(tx.settlementTime) : 'Menunggu Pelunasan'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Room Info */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 space-y-4 text-xs">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Identitas Pembayar & Kamar</span>
          </h2>

          <div className="space-y-3 text-zinc-600">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Nama Pembayar:</span>
              <span className="font-bold text-zinc-900 break-words sm:text-right">{tx.userName}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Kamar Tujuan:</span>
              <span className="font-bold text-zinc-900 sm:text-right">Kamar No. {tx.roomCode}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">No. WhatsApp:</span>
              <span className="font-bold text-zinc-900 tabular-nums sm:text-right">{tx.userPhone}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Alamat Email:</span>
              <span className="text-zinc-800 break-all sm:text-right">{tx.userEmail}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-zinc-500">Nomor Invoice:</span>
              <span className="tabular-nums font-bold text-blue-600 break-all sm:text-right">{tx.invoiceNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RINCIAN STATUS PEMBAYARAN (RAMAH PENGGUNA & BERBAHASA INDONESIA) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[hsl(186,72%,24%)] shrink-0" />
            <h2 className="text-sm font-heading font-extrabold text-zinc-900">
              Rincian Status Pembayaran
            </h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md w-fit ${statusInfo.badgeClass}`}>
            {isSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : tx.transactionStatus === 'pending' ? (
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span>{statusInfo.label}</span>
          </span>
        </div>

        <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden text-xs">
          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">ID Pesanan / Order ID</span>
            <span className="font-bold text-zinc-900 tabular-nums break-all sm:text-right">{tx.orderId}</span>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">Metode Pembayaran</span>
            <span className="font-bold text-zinc-900 sm:text-right">{methodLabel}</span>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">Total Nominal</span>
            <span className="font-heading font-extrabold text-[hsl(186,72%,24%)] text-sm tabular-nums sm:text-right">
              {formatRupiah(tx.grossAmount)}
            </span>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">Waktu Transaksi</span>
            <span className="font-semibold text-zinc-800 sm:text-right">
              {formatIndonesianDateTime(tx.createdAt)}
            </span>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">Waktu Lunas</span>
            <span className="font-semibold text-zinc-800 sm:text-right">
              {tx.settlementTime ? formatIndonesianDateTime(tx.settlementTime) : 'Menunggu Pelunasan'}
            </span>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-zinc-50/60">
            <span className="text-zinc-500 font-medium">Status Verifikasi</span>
            <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded w-fit ${statusInfo.badgeClass}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
