'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { MonthlyBill } from '@/types/billing';
import { formatRupiah } from '@/data/rooms';
import {
  History,
  Search,
  Calendar,
  Receipt,
  ArrowRight,
  CheckCircle2,
  Download,
  CreditCard,
  Building2,
  FileText,
} from 'lucide-react';

interface PenghuniRiwayatClientProps {
  initialHistory: MonthlyBill[];
}

export const PenghuniRiwayatClient: React.FC<PenghuniRiwayatClientProps> = ({
  initialHistory,
}) => {
  const [history] = useState<MonthlyBill[]>(initialHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Filter history
  const filteredHistory = history.filter((item) => {
    // Year filter
    if (selectedYear !== 'ALL') {
      const itemYear = item.paidAt ? new Date(item.paidAt).getFullYear().toString() : '';
      if (!item.periodMonth.includes(selectedYear) && itemYear !== selectedYear) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchInvoice = item.invoiceCode.toLowerCase().includes(q);
      const matchPeriod = item.periodMonth.toLowerCase().includes(q);
      const matchMethod = (item.paymentMethod || '').toLowerCase().includes(q);
      if (!matchInvoice && !matchPeriod && !matchMethod) {
        return false;
      }
    }

    return true;
  });

  // Total pengeluaran lunas
  const totalSpent = filteredHistory.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Arsip Pembayaran Resmi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Riwayat Pembayaran Sewa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar lengkap seluruh transaksi pembayaran lunas sewa Kamar A-101 Kos Omi Padang.
          </p>
        </div>

        <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-left sm:text-right">
          <span className="text-[11px] text-slate-500 font-medium block">
            Total Pengeluaran Terfilter
          </span>
          <span className="text-xl font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
            {formatRupiah(totalSpent)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {filteredHistory.length} Transaksi Tercatat
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. invoice, metode transfer (BCA/QRIS), atau periode bulan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        {/* Year Filter Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setSelectedYear('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedYear === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Semua Tahun
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear('2026')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedYear === '2026' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            2026
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear('2025')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedYear === '2025' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            2025
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <History className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau ganti filter tahun.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="p-4">Tanggal Pembayaran</th>
                    <th className="p-4">Periode Sewa</th>
                    <th className="p-4">No. Invoice Resmi</th>
                    <th className="p-4">Metode Bayar</th>
                    <th className="p-4 text-right">Nominal</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {item.paidAt
                            ? new Date(item.paidAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : item.dueDate}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.paidAt ? new Date(item.paidAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '10:00'} WIB
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{item.periodMonth}</span>
                        <span className="text-[11px] text-slate-500 block">Kamar {item.roomCode}</span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {item.invoiceCode}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {item.paymentMethod || 'Midtrans Snap'}
                        </div>
                        <div className="text-[11px] text-slate-400">Verifikasi Otomatis</div>
                      </td>

                      <td className="p-4 whitespace-nowrap text-right font-heading font-bold text-slate-900 tabular-nums">
                        {formatRupiah(item.totalAmount)}
                      </td>

                      <td className="p-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Lunas</span>
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap text-right">
                        <NextLink
                          href={`/penghuni/tagihan/${item.invoiceCode}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors min-h-[36px]"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Kuitansi</span>
                        </NextLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 640px) */}
            <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-extrabold text-slate-900 text-sm block">
                        {item.periodMonth}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.invoiceCode} · Kamar {item.roomCode}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Lunas</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Metode Pembayaran</span>
                      <span className="font-medium text-slate-700">{item.paymentMethod || 'Midtrans Snap'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total Nominal</span>
                      <span className="font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
                        {formatRupiah(item.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {item.paidAt
                        ? new Date(item.paidAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : item.dueDate}
                    </span>
                    <NextLink
                      href={`/penghuni/tagihan/${item.invoiceCode}`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold transition-colors min-h-[44px]"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Lihat Kuitansi</span>
                    </NextLink>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Semua kuitansi transaksi di atas diarsipkan secara permanen. Anda dapat membuka dan mengunduh format PDF setiap kuitansi kapan pun dibutuhkan untuk keperluan reimbursement atau bukti administrasi resmi.
        </p>
      </div>
    </div>
  );
};
