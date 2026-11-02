'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { MonthlyBill } from '@/types/billing';
import { formatRupiah } from '@/data/rooms';
import { payMonthlyBillAction } from '@/actions/billing';
import { KosOmiPaymentSelector } from '@/components/payment/KosOmiPaymentMethods';
import {
  Receipt,
  Search,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  X,
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

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MonthlyBill | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('QRIS');
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredBills = bills.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) {
      return false;
    }
    if (yearFilter !== 'ALL' && !b.periodMonth.includes(yearFilter)) {
      return false;
    }
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

  const unpaidCount = bills.filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT').length;
  const paidCount = bills.filter((b) => b.status === 'LUNAS').length;

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Daftar Tagihan & Pembayaran Kos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Mendukung pembayaran via QRIS, Transfer Bank (BRI, BCA, BSI, Bank Nagari, SeaBank), serta E-Wallet (DANA & ShopeePay).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Status Tertunggak</span>
            <span className={`font-bold ${unpaidCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {unpaidCount > 0 ? `${unpaidCount} Tagihan Belum Lunas` : 'Semua Lunas'}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Total Lunas</span>
            <span className="font-bold text-zinc-800">{paidCount} Tagihan</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor invoice (INV-...) atau periode sewa..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-zinc-900 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('BELUM_BAYAR')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'BELUM_BAYAR' ? 'bg-white text-amber-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Belum Bayar
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('LUNAS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'LUNAS' ? 'bg-white text-emerald-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TERLAMBAT')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'TERLAMBAT' ? 'bg-white text-rose-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Terlambat
            </button>
          </div>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Semua Periode</option>
            <option value="2026">Tahun 2026</option>
            <option value="2025">Tahun 2025</option>
          </select>
        </div>
      </div>

      {/* Bill List Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-bold text-zinc-700">Tidak ada tagihan yang cocok</p>
            <p className="text-xs text-zinc-500">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredBills.map((bill) => {
              const isUnpaid = bill.status === 'BELUM_BAYAR' || bill.status === 'TERLAMBAT';

              return (
                <div
                  key={bill.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-extrabold text-zinc-900 text-base">
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
                          ? '⚠ TERLAMBAT'
                          : '• BELUM DIBAYAR'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="tabular-nums font-medium text-zinc-700">{bill.invoiceCode}</span>
                      <span>•</span>
                      <span>Kamar: <strong className="text-zinc-800">{bill.roomCode}</strong></span>
                      <span>•</span>
                      <span>Jatuh Tempo: <strong>{bill.dueDate}</strong></span>
                      {bill.paidAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700">
                            Lunas: {new Date(bill.paidAt).toLocaleDateString('id-ID')} ({bill.paymentMethod || 'QRIS'})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-zinc-500 font-medium block">Nominal Tagihan</span>
                      <span className="text-lg font-heading font-extrabold text-zinc-900 tabular-nums">
                        {formatRupiah(bill.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnpaid && (
                        <button
                          type="button"
                          onClick={() => openPayModal(bill)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}

                      <NextLink
                        href={`/penghuni/tagihan/${bill.invoiceCode}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold transition-colors"
                      >
                        <span>Rincian</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </NextLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Bayar Tagihan */}
      {isPayModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-xl w-full overflow-hidden my-auto">
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-heading font-bold text-sm">
                    Pembayaran Tagihan Kos Omi
                  </h3>
                  <span className="text-[11px] text-zinc-400 block">
                    {selectedBill.invoiceCode} • Kamar {selectedBill.roomCode}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 block">Periode Tagihan</span>
                  <span className="font-heading font-bold text-zinc-900 text-sm">
                    {selectedBill.periodMonth}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Total Bayar</span>
                  <span className="text-lg font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(selectedBill.totalAmount)}
                  </span>
                </div>
              </div>

              <KosOmiPaymentSelector
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
                amountFormatted={formatRupiah(selectedBill.totalAmount)}
              />

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pembayaran tercatat otomatis pada riwayat tagihan penghuni & keuangan Kos Omi.</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                  disabled={isPaying}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
                >
                  {isPaying ? 'Memproses Pelunasan...' : `Konfirmasi Pelunasan (${selectedMethod})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
