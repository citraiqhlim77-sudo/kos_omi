'use client';

import React from 'react';
import NextLink from 'next/link';
import { FinanceDashboardStats, PaymentTransaction } from '@/types/finance';
import { formatPaymentCategoryLabel } from '@/lib/reports/labels';
import { formatRupiah } from '@/data/rooms';
import { OperationalDecisionAnalyticsPanel } from '@/components/keuangan/OperationalDecisionAnalyticsPanel';
import dynamic from 'next/dynamic';

// Dynamic import untuk komponen grafik finansial (Recharts / SVG Visualization)
const FinancialTrendChart = dynamic(
  () => import('@/components/keuangan/FinancialTrendChart').then((mod) => mod.FinancialTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 space-y-6 animate-pulse">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
          <div className="space-y-2">
            <div className="h-5 w-64 bg-zinc-200 rounded"></div>
            <div className="h-3 w-40 bg-zinc-100 rounded"></div>
          </div>
          <div className="h-4 w-32 bg-zinc-100 rounded"></div>
        </div>
        <div className="h-[240px] w-full bg-zinc-50 rounded-lg flex items-center justify-center text-xs text-zinc-400">
          Memuat visualisasi tren finansial...
        </div>
      </div>
    ),
  }
);
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  QrCode,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface KeuanganDashboardClientProps {
  stats: FinanceDashboardStats;
  recentTransactions: PaymentTransaction[];
}

function formatPaymentMethodLabel(paymentType: string, bank?: string | null): string {
  const type = (paymentType || '').toLowerCase();
  const bankUpper = bank ? bank.toUpperCase() : '';
  if (type === 'qris') return 'QRIS';
  if (type === 'dana') return 'DANA';
  if (type === 'gopay') return 'GoPay';
  if (type === 'shopeepay') return 'ShopeePay';
  if (type === 'bank_transfer' || type.includes('va')) {
    return bankUpper ? `Transfer Bank ${bankUpper}` : 'Transfer Bank VA';
  }
  if (bankUpper) return `Transfer Bank ${bankUpper}`;
  return 'Transfer Bank / QRIS';
}

function formatTxStatusLabel(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'settlement' || s === 'capture' || s === 'paid' || s === 'lunas') {
    return 'Terverifikasi / Lunas';
  }
  if (s === 'pending' || s === 'unpaid') {
    return 'Menunggu Pembayaran';
  }
  return 'Kedaluwarsa';
}

export const KeuanganDashboardClient: React.FC<KeuanganDashboardClientProps> = ({
  stats,
  recentTransactions,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Rekapitulasi Finansial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Dasbor Keuangan & Rekonsiliasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Monitoring pemasukan real-time dari Midtrans Snap, status settlement, dan tren pendapatan kos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NextLink
            href="/keuangan/laporan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-500" />
            <span>Rekap Laporan</span>
          </NextLink>

          <NextLink
            href="/keuangan/tagihan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Monitoring Tunggakan</span>
          </NextLink>
        </div>
      </div>

      {/* KPI Cards Grid (Semua Bisa Diklik Langsung ke Halamannya) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <NextLink
          href="/keuangan/transaksi"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-emerald-400 transition-all space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-700">
              Total Pemasukan Terverifikasi
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {formatRupiah(stats.currentMonthIncome)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
            <span>Klik lihat daftar transaksi</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        {/* Transaksi Sukses */}
        <NextLink
          href="/keuangan/transaksi"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-blue-400 transition-all space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-blue-700">
              Transaksi Lunas (Settlement)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {stats.currentMonthTransactions}
            <span className="text-xs text-zinc-500 font-normal ml-1.5">transaksi</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold flex items-center justify-between">
            <span>Tingkat keberhasilan: {stats.settlementRate}%</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        {/* Menunggu Pembayaran (Pending) */}
        <NextLink
          href="/keuangan/tagihan"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-amber-400 transition-all space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-amber-700">
              Menunggu Pembayaran
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {formatRupiah(stats.pendingAmount)}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
            <span>{stats.pendingTransactionsCount} invoice belum dibayar</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        {/* Sumber Pendapatan Terbesar */}
        <NextLink
          href="/keuangan/laporan"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-sky-400 transition-all space-y-2 block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-sky-700">
              Pemasukan Sewa Kamar
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {formatRupiah(stats.incomeByCategory.rent)}
          </div>
          <div className="text-[11px] text-sky-700 font-semibold flex items-center justify-between">
            <span>Klik buka rekap laporan</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>
      </div>

      {/* ANALITIK PENDUKUNG KEPUTUSAN OPERASIONAL (OKUPANSI, COLLECTION RATE, KONVERSI RESERVASI) */}
      <OperationalDecisionAnalyticsPanel analytics={stats.analytics} />

      {/* GRAFIK TREN 12 BULAN (RECHARTS TREND VISUALIZATION) */}
      <FinancialTrendChart data={stats.monthlyTrends} />

      {/* Secondary Row: Revenue Breakdown & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown by Category */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Komposisi Pendapatan Bulan Berjalan</span>
          </h2>

          <div className="space-y-3 text-xs">
            {/* Sewa Kamar */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-700">Sewa Semesteran (Rp 5.000.000/semester)</span>
                <span className="tabular-nums text-zinc-900">{formatRupiah(stats.incomeByCategory.rent)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-[hsl(186,72%,24%)] rounded-full" style={{ width: '86%' }} />
              </div>
            </div>

            {/* Booking Awal */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-700">Booking Kamar Baru (1 Semester)</span>
                <span className="tabular-nums text-zinc-900">{formatRupiah(stats.incomeByCategory.booking)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown by Payment Channel */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>Saluran Pembayaran Gateway Midtrans</span>
          </h2>

          <div className="space-y-3 text-xs">
            {/* Virtual Account */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-700">Bank Virtual Account (BCA, Mandiri, BNI)</span>
                <span className="tabular-nums text-zinc-900">{formatRupiah(stats.incomeByMethod.va)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '48%' }} />
              </div>
            </div>

            {/* QRIS */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-700">QRIS Instan (GoPay, OVO, ShopeePay, Bank App)</span>
                <span className="tabular-nums text-zinc-900">{formatRupiah(stats.incomeByMethod.qris)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '41%' }} />
              </div>
            </div>

            {/* E-Wallet */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-700">Direct E-Wallet (GoPay & ShopeePay App)</span>
                <span className="tabular-nums text-zinc-900">{formatRupiah(stats.incomeByMethod.ewallet)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT GATEWAY TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Transaksi Gateway Midtrans Terbaru</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Status resmi transaksi settlement dari webhook Midtrans
            </p>
          </div>

          <NextLink
            href="/keuangan/transaksi"
            className="text-xs font-bold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-1"
          >
            <span>Buka Semua Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NextLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Pembayar & Kamar</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Metode Bayar</th>
                <th className="p-3.5 text-right">Nominal</th>
                <th className="p-3.5 text-center">Status Gateway</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {recentTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="p-3.5 whitespace-nowrap tabular-nums font-bold text-zinc-900">
                    {tx.orderId}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-zinc-900 block">{tx.userName}</span>
                    <span className="text-[11px] text-zinc-500">Kamar {tx.roomCode}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-zinc-600">
                    {formatPaymentCategoryLabel(tx.category)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-medium text-zinc-800">
                    {formatPaymentMethodLabel(tx.paymentType, tx.bank)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-right font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(tx.grossAmount)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : tx.transactionStatus === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {formatTxStatusLabel(tx.transactionStatus)}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-right">
                    <NextLink
                      href={`/keuangan/transaksi/${tx.orderId}`}
                      className="px-2.5 py-1 rounded border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px] font-semibold"
                    >
                      Detail
                    </NextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
