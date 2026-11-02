'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { MonthlyBill, TenantProfile } from '@/types/billing';
import { formatRupiah } from '@/data/rooms';
import { payMonthlyBillAction } from '@/actions/billing';
import { KosOmiPaymentSelector } from '@/components/payment/KosOmiPaymentMethods';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  X,
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
  const [selectedMethod, setSelectedMethod] = useState<string>('QRIS');
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
      {toastMessage && (
        <div className="print:hidden p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
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

      {/* Top Action Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <NextLink
          href="/penghuni/tagihan"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tagihan</span>
        </NextLink>

        <div className="flex items-center gap-2.5">
          {!isPaid && (
            <button
              type="button"
              onClick={() => setIsPayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Bayar Tagihan Sekarang</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-zinc-600" />
            <span>Cetak / Unduh Bukti (PDF)</span>
          </button>
        </div>
      </div>

      {/* INVOICE / RECEIPT DOCUMENT */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-10 max-w-3xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-zinc-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[hsl(186,72%,24%)] text-white font-bold flex items-center justify-center text-xs overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
              <span className="font-heading font-extrabold text-xl text-zinc-900 tracking-tight">
                KOS OMI SUNGAI BANGEK, PADANG
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol)
              <br />
              WhatsApp Ibu Kos: +62 813-7432-9562 • kontak@kosomi.id
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-bold text-zinc-400 block">
              {isPaid ? 'KUITANSI RESMI PEMBAYARAN' : 'INVOICE TAGIHAN SEWA'}
            </span>
            <p className="text-lg tabular-nums font-extrabold text-zinc-900">
              {bill.invoiceCode}
            </p>
            <span
              className={`inline-block text-xs font-bold px-3 py-0.5 rounded ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isPaid ? 'LUNAS TERVERIFIKASI' : 'MENUNGGU PEMBAYARAN'}
            </span>
          </div>
        </div>

        {/* Informasi Penghuni & Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-400 font-bold block">
              Ditagihkan Kepada:
            </span>
            <p className="font-bold text-zinc-900 text-sm">{profile.name}</p>
            <p className="text-zinc-600">Kamar: <strong>{bill.roomCode}</strong></p>
            <p className="text-zinc-600">{profile.phone} • {profile.email}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-zinc-400 font-bold block">
              Detail Tagihan:
            </span>
            <p className="text-zinc-600">
              Periode Sewa: <strong className="text-zinc-900">{bill.periodMonth}</strong>
            </p>
            <p className="text-zinc-600">
              Jatuh Tempo: <strong className="text-rose-600">{bill.dueDate}</strong>
            </p>
            {bill.paidAt && (
              <p className="text-emerald-700 font-semibold">
                Tanggal Pembayaran: {new Date(bill.paidAt).toLocaleDateString('id-ID')} via {bill.paymentMethod}
              </p>
            )}
          </div>
        </div>

        {/* Tabel Rincian Biaya */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-500">
            Rincian Biaya Sewa
          </h2>

          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                <tr>
                  <th className="p-3.5">Deskripsi</th>
                  <th className="p-3.5 text-center">Kapasitas</th>
                  <th className="p-3.5 text-right">Tarif</th>
                  <th className="p-3.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr>
                  <td className="p-3.5">
                    <strong className="text-zinc-900 block">Sewa Kamar {bill.roomCode} Kos Omi</strong>
                    <span className="text-zinc-500 text-[11px]">
                      Fasilitas: Kasur/Lemari, Kamar Mandi Dalam, Ruang Belajar, Dapur/Cuci, Wi-Fi, TV, Kulkas, Alat Olahraga, Parkir Dalam, CCTV 24 Jam
                    </span>
                  </td>
                  <td className="p-3.5 text-center">2 Orang/Kamar</td>
                  <td className="p-3.5 text-right tabular-nums">{formatRupiah(bill.rentAmount ?? bill.totalAmount ?? 0)}</td>
                  <td className="p-3.5 text-right font-semibold tabular-nums">{formatRupiah(bill.rentAmount ?? bill.totalAmount ?? 0)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-zinc-50/80 border-t border-zinc-200 text-zinc-900 font-bold">
                <tr className="border-t border-zinc-200 bg-zinc-100/60 text-sm">
                  <td colSpan={3} className="p-3.5 text-right font-extrabold">Total Tagihan:</td>
                  <td className="p-3.5 text-right font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(bill.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Info Rekening */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 text-xs text-zinc-500">
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-800">Saluran Pembayaran Resmi Kos Omi:</h3>
            <p className="leading-relaxed text-[11px]">
              • Bank BRI: 5412-01-028491-53-8 | BCA: 8410-5928-14 | BSI: 7198-4520-18
              <br />
              • Bank Nagari: 2100-0210-48291-5 | SeaBank: 9018-4729-1052
              <br />
              • DANA & ShopeePay: 0813-7432-9562 (a.n. Ibu Kos Omi) & QRIS
            </p>
          </div>
          <div className="sm:text-right space-y-1">
            <h3 className="font-bold text-zinc-800">Pengelola Kos Omi Sungai Bangek</h3>
            <p className="text-[11px]">Kontak Ibu Kos: +62 813-7432-9562</p>
          </div>
        </div>
      </div>

      {/* Modal Bayar */}
      {isPayModalOpen && (
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
                    {bill.invoiceCode} • Kamar {bill.roomCode}
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
                    {bill.periodMonth}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">Total Bayar</span>
                  <span className="text-lg font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(bill.totalAmount)}
                  </span>
                </div>
              </div>

              <KosOmiPaymentSelector
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
                amountFormatted={formatRupiah(bill.totalAmount)}
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
