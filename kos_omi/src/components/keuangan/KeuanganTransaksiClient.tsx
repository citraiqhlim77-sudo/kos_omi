'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { PaymentTransaction, GatewayReconciliationResult } from '@/types/finance';
import { reconcileGatewayTransactionsAction } from '@/actions/finance';
import { formatRupiah } from '@/data/rooms';
import {
  Receipt,
  Search,
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
  FileCheck2,
} from 'lucide-react';

interface KeuanganTransaksiClientProps {
  initialTransactions: PaymentTransaction[];
}

export const KeuanganTransaksiClient: React.FC<KeuanganTransaksiClientProps> = ({
  initialTransactions,
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Reconciliation state
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<GatewayReconciliationResult | null>(null);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReconcile = async () => {
    setIsReconciling(true);
    const res = await reconcileGatewayTransactionsAction();
    if (res.success && res.result) {
      setReconcileResult(res.result);
      setIsReconcileModalOpen(true);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);

      // Sinkronkan state lokal
      setTransactions((prev) =>
        prev.map((t) => {
          const item = res.result.items.find((i) => i.orderId === t.orderId);
          if (item && item.gatewayStatus !== t.transactionStatus) {
            return {
              ...t,
              transactionStatus: item.gatewayStatus,
              settlementTime:
                item.gatewayStatus === 'settlement' ? new Date().toISOString() : t.settlementTime,
            };
          }
          return t;
        })
      );
    }
    setIsReconciling(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    // Status filter
    if (statusFilter !== 'ALL' && t.transactionStatus !== statusFilter) {
      return false;
    }

    // Method filter
    if (methodFilter !== 'ALL' && t.paymentType !== methodFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchOrder = t.orderId.toLowerCase().includes(q);
      const matchInv = t.invoiceNumber.toLowerCase().includes(q);
      const matchName = t.userName.toLowerCase().includes(q);
      const matchRoom = t.roomCode.toLowerCase().includes(q);
      if (!matchOrder && !matchInv && !matchName && !matchRoom) {
        return false;
      }
    }

    return true;
  });

  const settlementCount = transactions.filter((t) => t.transactionStatus === 'settlement').length;
  const pendingCount = transactions.filter((t) => t.transactionStatus === 'pending').length;
  const expireCount = transactions.filter((t) => t.transactionStatus === 'expire').length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Gateway Logs & Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Monitoring Transaksi Midtrans Snap
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar seluruh transaksi yang diteruskan ke Midtrans Snap API beserta status verifikasi webhook gateway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Settlement</span>
              <span className="font-bold text-emerald-700">{settlementCount} Transaksi</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Pending</span>
              <span className="font-bold text-amber-600">{pendingCount} Transaksi</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Expire</span>
              <span className="font-bold text-rose-600">{expireCount} Transaksi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReconcile}
            disabled={isReconciling}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>{isReconciling ? 'Mencocokkan...' : 'Rekonsiliasi Gateway'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor order (KOS-...), invoice, nama penghuni, atau kamar..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('settlement')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'settlement' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Settlement
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('expire')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'expire' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Expire
            </button>
          </div>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Semua Saluran</option>
            <option value="qris">QRIS Instan</option>
            <option value="bank_transfer">Virtual Account</option>
            <option value="gopay">GoPay</option>
            <option value="shopeepay">ShopeePay</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada transaksi yang cocok</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3.5">Order ID Gateway</th>
                    <th className="p-3.5">No. Invoice & Tanggal</th>
                    <th className="p-3.5">Pembayar</th>
                    <th className="p-3.5">Kamar</th>
                    <th className="p-3.5">Saluran Bayar</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5 text-center">Status Transaksi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">{tx.orderId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tx.midtransTransactionId.substring(0, 18)}...
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-800 font-semibold block">{tx.invoiceNumber}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{tx.userName}</span>
                        <span className="text-[11px] text-slate-500">{tx.userPhone}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900">Kamar {tx.roomCode}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-medium text-slate-800">
                        {tx.paymentType.toUpperCase()} {tx.bank ? `(${tx.bank.toUpperCase()})` : ''}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right font-heading font-bold text-slate-900 tabular-nums">
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
                          {tx.transactionStatus.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right">
                        <NextLink
                          href={`/keuangan/transaksi/${tx.orderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[36px]"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </NextLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 640px) */}
            <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {tx.orderId}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {tx.userName} · Kamar {tx.roomCode}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                        tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : tx.transactionStatus === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {tx.transactionStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice:</span>
                      <span className="font-mono font-semibold text-slate-800">{tx.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Saluran Bayar:</span>
                      <span className="font-medium text-slate-800">
                        {tx.paymentType.toUpperCase()} {tx.bank ? `(${tx.bank.toUpperCase()})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1 mt-1 font-bold">
                      <span className="text-slate-800">Nominal:</span>
                      <span className="text-[hsl(217,91%,45%)] font-heading font-extrabold text-sm tabular-nums">
                        {formatRupiah(tx.grossAmount)}
                      </span>
                    </div>
                  </div>

                  <NextLink
                    href={`/keuangan/transaksi/${tx.orderId}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>Lihat Rincian Transaksi</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </NextLink>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal Dialog Rekonsiliasi Gateway */}
      {isReconcileModalOpen && reconcileResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-extrabold text-slate-900">
                    Hasil Rekonsiliasi Midtrans Gateway
                  </h3>
                  <p className="text-xs text-slate-500">
                    Waktu rekonsiliasi: {new Date(reconcileResult.reconciledAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReconcileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block text-[11px]">Total Transaksi</span>
                <span className="font-heading font-extrabold text-lg text-slate-900">
                  {reconcileResult.totalChecked}
                </span>
                <span className="text-[10px] text-slate-400 block">Transaksi Diperiksa</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-emerald-700 block text-[11px] font-semibold">Cocok 100%</span>
                <span className="font-heading font-extrabold text-lg text-emerald-800">
                  {reconcileResult.matchedCount}
                </span>
                <span className="text-[10px] text-emerald-600 block">Status & Nominal Sesuai</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-blue-700 block text-[11px] font-semibold">Disinkronkan</span>
                <span className="font-heading font-extrabold text-lg text-blue-800">
                  {reconcileResult.autoSyncedCount}
                </span>
                <span className="text-[10px] text-blue-600 block">Auto-Sync ke Settlement</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 block text-[11px]">Selisih Nominal</span>
                <span className="font-heading font-extrabold text-lg text-slate-900 tabular-nums">
                  {formatRupiah(reconcileResult.discrepancyAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Nol Selisih (Akurat)</span>
              </div>
            </div>

            {/* Total Comparison Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-500">Gross Total di Sistem: </span>
                <strong className="text-slate-900 tabular-nums">{formatRupiah(reconcileResult.systemGrossTotal)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Gross Total di Gateway Midtrans: </span>
                <strong className="text-emerald-700 tabular-nums">{formatRupiah(reconcileResult.gatewayGrossTotal)}</strong>
              </div>
            </div>

            {/* Reconciliation Item Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Order ID & Invoice</th>
                    <th className="p-3">Penghuni / Kamar</th>
                    <th className="p-3">Status Sistem</th>
                    <th className="p-3">Status Gateway</th>
                    <th className="p-3 text-right">Nominal</th>
                    <th className="p-3 text-right">Hasil Rekonsiliasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reconcileResult.items.map((item) => (
                    <tr key={item.orderId} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 block">{item.orderId}</span>
                        <span className="text-[10px] text-slate-400">{item.invoiceNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{item.userName}</span>
                        <span className="text-[10px] text-slate-500">Kamar {item.roomCode}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {item.systemStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.gatewayStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums">
                        {formatRupiah(item.systemAmount)}
                      </td>
                      <td className="p-3 text-right">
                        {item.resolution === 'AUTO_SYNCED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Disinkronkan
                          </span>
                        ) : item.resolution === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cocok 100%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReconcileModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Ringkasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
