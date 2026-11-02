'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { MonthlyBill } from '@/types/billing';
import { formatRupiah } from '@/data/rooms';
import { payMonthlyBillAction } from '@/actions/billing';
import {
  Receipt,
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  QrCode,
  X,
  AlertTriangle,
} from 'lucide-react';

interface PenghuniTagihanClientProps {
  initialBills: MonthlyBill[];
}

export const PenghuniTagihanClient: React.FC<PenghuniTagihanClientProps> = ({
  initialBills,
}) => {
  const [bills, setBills] = useState<MonthlyBill[]>(initialBills);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MonthlyBill | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'GOPAY'>('QRIS');
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter bills
  const filteredBills = bills.filter((b) => {
    // Status filter
    if (statusFilter !== 'ALL' && b.status !== statusFilter) {
      return false;
    }
    // Year filter
    if (yearFilter !== 'ALL' && !b.periodMonth.includes(yearFilter)) {
      return false;
    }
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchInvoice = b.invoiceCode.toLowerCase().includes(q);
      const matchPeriod = b.periodMonth.toLowerCase().includes(q);
      if (!matchInvoice && !matchPeriod) return false;
    }
    return true;
  });

  const openPayModal = (bill: MonthlyBill) => {
    setSelectedBill(bill);
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    setIsPaying(true);
    const res = await payMonthlyBillAction(selectedBill.invoiceCode, selectedMethod);

    if (res.success && res.bill) {
      setBills((prev) =>
        prev.map((item) => (item.id === res.bill!.id ? res.bill! : item))
      );
      setIsPayModalOpen(false);
      setToastMessage(`Tagihan sewa ${res.bill.periodMonth} (${res.bill.invoiceCode}) berhasil dilunasi via ${selectedMethod}!`);
      setTimeout(() => setToastMessage(null), 5000);
    }
    setIsPaying(false);
  };

  // Hitung total ringkasan
  const unpaidCount = bills.filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT').length;
  const paidCount = bills.filter((b) => b.status === 'LUNAS').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Daftar Tagihan Sewa Bulanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Jatuh tempo setiap tanggal 5. Seluruh pembayaran terhubung dengan konfirmasi otomatis via Midtrans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block">Status Tertunggak</span>
            <span className={`font-bold ${unpaidCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {unpaidCount > 0 ? `${unpaidCount} Tagihan Belum Lunas` : 'Semua Lunas'}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block">Total Lunas</span>
            <span className="font-bold text-slate-800">{paidCount} Tagihan</span>
          </div>
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
            placeholder="Cari nomor invoice (INV-...) atau bulan sewa..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        {/* Filters */}
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
              onClick={() => setStatusFilter('BELUM_BAYAR')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'BELUM_BAYAR' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Belum Bayar
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('LUNAS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'LUNAS' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TERLAMBAT')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'TERLAMBAT' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Terlambat
            </button>
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Semua Periode</option>
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
        </div>
      </div>

      {/* Bill List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada tagihan yang cocok</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBills.map((bill) => {
              const isUnpaid = bill.status === 'BELUM_BAYAR' || bill.status === 'TERLAMBAT';

              return (
                <div
                  key={bill.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-extrabold text-slate-900 text-base">
                        {bill.periodMonth}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          bill.status === 'LUNAS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : bill.status === 'TERLAMBAT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {bill.status === 'LUNAS'
                          ? '✓ LUNAS'
                          : bill.status === 'TERLAMBAT'
                          ? '⚠️ TERLAMBAT'
                          : '⏳ BELUM DIBAYAR'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-mono font-medium text-slate-700">{bill.invoiceCode}</span>
                      <span>•</span>
                      <span>Kamar: <strong className="text-slate-800">{bill.roomCode}</strong></span>
                      <span>•</span>
                      <span>Jatuh Tempo: <strong>{bill.dueDate}</strong></span>
                      {bill.paidAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700">
                            Lunas: {new Date(bill.paidAt).toLocaleDateString('id-ID')} ({bill.paymentMethod || 'Midtrans'})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-500 font-medium block">Nominal Tagihan</span>
                      <span className="text-lg font-heading font-extrabold text-slate-900 tabular-nums">
                        {formatRupiah(bill.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnpaid && (
                        <button
                          type="button"
                          onClick={() => openPayModal(bill)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-2xs transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}

                      <NextLink
                        href={`/penghuni/tagihan/${bill.invoiceCode}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                      >
                        <span>Rincian</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </NextLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK PAY MODAL */}
      {isPayModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(217,91%,45%)] flex items-center justify-center font-bold text-sm">
                  KO
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Pembayaran Tagihan Sewa</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Kos Omi Sungai Bangek, Padang
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Nomor Tagihan</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedBill.invoiceCode}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {selectedBill.periodMonth} · Kamar {selectedBill.roomCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Pembayaran</span>
                  <span className="text-xl font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(selectedBill.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Pilih Saluran Pembayaran:
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('QRIS')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'QRIS'
                        ? 'border-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] ring-2 ring-[hsl(217,91%,45%)]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">QRIS Instan</div>
                      <div className="text-[10px] text-slate-500">GoPay, OVO, BCA, Livin</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('BCA_VA')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'BCA_VA'
                        ? 'border-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] ring-2 ring-[hsl(217,91%,45%)]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">BCA Virtual Account</div>
                      <div className="text-[10px] text-slate-500">Verifikasi Otomatis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('MANDIRI_VA')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'MANDIRI_VA'
                        ? 'border-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] ring-2 ring-[hsl(217,91%,45%)]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mandiri VA</div>
                      <div className="text-[10px] text-slate-500">Livin' by Mandiri</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('GOPAY')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'GOPAY'
                        ? 'border-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] ring-2 ring-[hsl(217,91%,45%)]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">GoPay / E-Wallet</div>
                      <div className="text-[10px] text-slate-500">Aplikasi Gojek</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulasi pelunasan instan dan pencatatan riwayat transaksi sewa</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  disabled={isPaying}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-colors cursor-pointer"
                >
                  {isPaying ? 'Memproses Pelunasan...' : 'Konfirmasi Pelunasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
