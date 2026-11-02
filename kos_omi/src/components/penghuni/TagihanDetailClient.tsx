'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { MonthlyBill, TenantProfile } from '@/types/billing';
import { formatRupiah } from '@/data/rooms';
import { payMonthlyBillAction } from '@/actions/billing';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  CreditCard,
  Building2,
  QrCode,
  X,
  FileCheck,
} from 'lucide-react';

interface TagihanDetailClientProps {
  bill: MonthlyBill;
  profile: TenantProfile;
}

export const TagihanDetailClient: React.FC<TagihanDetailClientProps> = ({
  bill: initialBill,
  profile,
}) => {
  const [bill, setBill] = useState<MonthlyBill>(initialBill);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'GOPAY'>('QRIS');
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPaid = bill.status === 'LUNAS';

  const handlePrint = () => {
    window.print();
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    const res = await payMonthlyBillAction(bill.invoiceCode, selectedMethod);

    if (res.success && res.bill) {
      setBill(res.bill);
      setIsPayModalOpen(false);
      setToastMessage(`Tagihan sewa ${res.bill.periodMonth} berhasil dilunasi via ${selectedMethod}!`);
      setTimeout(() => setToastMessage(null), 5000);
    }
    setIsPaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="print:hidden p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
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

      {/* Top Action Bar (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <NextLink
          href="/penghuni/tagihan"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tagihan</span>
        </NextLink>

        <div className="flex items-center gap-2.5">
          {!isPaid && (
            <button
              type="button"
              onClick={() => setIsPayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar Tagihan Sekarang</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak / Unduh Bukti (PDF)</span>
          </button>
        </div>
      </div>

      {/* INVOICE / RECEIPT DOCUMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 max-w-3xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[hsl(217,91%,45%)] text-white font-bold flex items-center justify-center text-xs">
                KO
              </div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">
                KOS OMI SUNGAI BANGEK, PADANG
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)
              <br />
              WhatsApp Pengelola: 0812-3456-7890 · kontak@kosomi.id
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {isPaid ? 'KUITANSI RESMI PEMBAYARAN' : 'INVOICE TAGIHAN SEWA'}
            </span>
            <h1 className="text-xl font-heading font-extrabold text-slate-900 font-mono">
              {bill.invoiceCode}
            </h1>
            <div className="inline-block mt-1">
              <span
                className={`text-xs font-bold px-3 py-1 rounded ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : bill.status === 'TERLAMBAT'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {isPaid ? '✓ LUNAS' : bill.status === 'TERLAMBAT' ? '⚠️ TERLAMBAT' : '⏳ BELUM DIBAYAR'}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ditujukan Kepada Penghuni:
            </span>
            <p className="font-bold text-slate-900 text-sm">{profile.name}</p>
            <p className="text-slate-600">Email: {profile.email}</p>
            <p className="text-slate-600">No. WhatsApp: {profile.phone}</p>
            <p className="text-slate-600">
              Kamar: <strong className="text-slate-900">Kamar {bill.roomCode}</strong> (Lantai 1)
            </p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rincian Tanggal:
            </span>
            <p className="text-slate-600">
              Periode Sewa: <strong className="text-slate-900">{bill.periodMonth}</strong>
            </p>
            <p className="text-slate-600">
              Tanggal Tagihan: <strong>01 {bill.periodMonth}</strong>
            </p>
            <p className="text-slate-600">
              Jatuh Tempo: <strong className="text-rose-600">{bill.dueDate}</strong>
            </p>
            {bill.paidAt && (
              <p className="text-emerald-700 font-semibold">
                Tanggal Pembayaran: {new Date(bill.paidAt).toLocaleDateString('id-ID')} via {bill.paymentMethod}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rincian Biaya Sewa
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3.5">Deskripsi</th>
                  <th className="p-3.5 text-center">Durasi</th>
                  <th className="p-3.5 text-right">Tarif</th>
                  <th className="p-3.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block">Sewa Kamar {bill.roomCode} (Standar AC)</strong>
                    <span className="text-slate-500 text-[11px]">
                      Fasilitas: Kasur Springbed, AC, Kamar Mandi Dalam, Lemari, Meja Belajar
                    </span>
                  </td>
                  <td className="p-3.5 text-center">1 Bulan</td>
                  <td className="p-3.5 text-right tabular-nums">{formatRupiah(bill.rentAmount ?? bill.totalAmount ?? 0)}</td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">{formatRupiah(bill.rentAmount ?? bill.totalAmount ?? 0)}</td>
                </tr>
                <tr>
                  <td className="p-3.5">
                    <span className="text-slate-800 font-medium block">Pengelolaan Sampah & Kebersihan Area Bersama</span>
                    <span className="text-slate-500 text-[11px]">Gratis layanan rutin harian</span>
                  </td>
                  <td className="p-3.5 text-center">1 Bulan</td>
                  <td className="p-3.5 text-right tabular-nums">Rp 0</td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">Rp 0</td>
                </tr>
                <tr>
                  <td className="p-3.5">
                    <span className="text-slate-800 font-medium block">Akses Wi-Fi High Speed 100 Mbps</span>
                    <span className="text-slate-500 text-[11px]">Termasuk dalam paket sewa</span>
                  </td>
                  <td className="p-3.5 text-center">1 Bulan</td>
                  <td className="p-3.5 text-right tabular-nums">Rp 0</td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">Rp 0</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200 text-slate-900 font-bold">
                <tr>
                  <td colSpan={3} className="p-3.5 text-right">Subtotal:</td>
                  <td className="p-3.5 text-right tabular-nums">{formatRupiah(bill.rentAmount ?? bill.totalAmount ?? 0)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3.5 text-right">Biaya Layanan Gerbang Pembayaran:</td>
                  <td className="p-3.5 text-right text-emerald-600">Rp 0 (Gratis)</td>
                </tr>
                <tr className="border-t border-slate-200 bg-slate-100/60 text-sm">
                  <td colSpan={3} className="p-3.5 text-right font-extrabold">Total Tagihan:</td>
                  <td className="p-3.5 text-right font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(bill.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Confirmation Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Catatan Pembayaran:</h3>
            <p className="leading-relaxed text-[11px]">
              Kuitansi ini adalah bukti transaksi resmi yang sah yang diterbitkan oleh sistem manajemen Kos Omi. Simpan dokumen ini sebagai bukti pelunasan sewa bulanan Anda.
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 sm:pl-8">
            <h3 className="font-bold text-slate-800">Manajemen Kos Omi Padang</h3>
            <div className="py-2">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded text-[11px] font-mono text-slate-700">
                [Tanda Tangan Digital Terverifikasi]
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Bendahara & Pengelola Operasional Kos Omi
            </p>
          </div>
        </div>
      </div>

      {/* QUICK PAY MODAL */}
      {isPayModalOpen && (
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
                    Kos Omi Padang
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
                    {bill.invoiceCode}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {bill.periodMonth} · Kamar {bill.roomCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Pembayaran</span>
                  <span className="text-xl font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(bill.totalAmount)}
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
