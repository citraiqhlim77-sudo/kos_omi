'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PaymentInvoice, Reservation } from '@/types/reservation';
import { Room, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import dynamic from 'next/dynamic';

// Dynamic import untuk modal pembayaran Midtrans Snap (Task 3.6 Performa & Optimasi)
const PaymentModal = dynamic(
  () => import('@/components/calon/PaymentModal').then((mod) => mod.PaymentModal),
  { ssr: false }
);
import {
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BedDouble,
  Building,
  User,
  Calendar,
  Lock,
  ExternalLink,
  Receipt,
  RotateCcw,
} from 'lucide-react';

interface PaymentInvoiceClientProps {
  invoice: PaymentInvoice;
  reservation: Reservation | null;
  room: Room | null;
}

export const PaymentInvoiceClient: React.FC<PaymentInvoiceClientProps> = ({
  invoice: initialInvoice,
  reservation,
  room,
}) => {
  const router = useRouter();
  const [invoice, setInvoice] = useState<PaymentInvoice>(initialInvoice);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const status = invoice.status;
  const isUnpaid = status === 'UNPAID' || status === 'PENDING';
  const isPaid = status === 'SETTLEMENT';
  const isExpired = status === 'EXPIRED' || status === 'CANCELLED';

  const monthlyPrice = room?.monthlyPrice || reservation?.monthlyPrice || Math.round(invoice.amount / 2);
  const depositAmount = room?.depositAmount || reservation?.depositAmount || Math.round(invoice.amount / 2);

  // Time remaining calculation
  const expiresAtDate = new Date(invoice.expiresAt);
  const now = new Date();
  const diffHours = Math.max(0, Math.round((expiresAtDate.getTime() - now.getTime()) / (1000 * 3600)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <NextLink
            href="/calon/dashboard"
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-xs font-bold text-zinc-500">
                {invoice.invoiceCode}
              </span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isExpired
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isPaid ? 'Lunas Terverifikasi' : isExpired ? 'Kedaluwarsa' : 'Menunggu Pembayaran'}
              </span>
            </div>
            <h1 className="text-xl font-heading font-extrabold text-zinc-900 mt-1">
              Invoice Pembayaran Reservasi Kamar
            </h1>
          </div>
        </div>

        {/* Action Button on Header if Unpaid */}
        {isUnpaid && (
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left Details & Right Checkout Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoice Document */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
            {/* Invoice Top Branding */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[hsl(186,72%,24%)] text-white font-extrabold text-base flex items-center justify-center overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
                <div>
                  <h2 className="font-heading font-extrabold text-zinc-900 text-base">
                    Kos Omi Sungai Bangek, Padang
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Jl. Sungai Bangek, Koto Tangah, Kota Padang (Dekat UIN Imam Bonjol)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] text-zinc-400 block">Nomor Invoice</span>
                <span className="tabular-nums font-bold text-zinc-900 text-sm">
                  {invoice.invoiceCode}
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  Diterbitkan: {new Date(invoice.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* Status Notification Banner */}
            {isUnpaid && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-amber-950">
                    Menunggu Pembayaran (Sisa Waktu: Â±{diffHours} Jam)
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Sesuai SOP Kos Omi, kamar berstatus <strong>DIPESAN</strong> selama 24 jam. Mohon selesaikan pembayaran sebelum batas waktu berakhir agar reservasi tidak dibatalkan otomatis oleh sistem.
                  </p>
                </div>
              </div>
            )}

            {isPaid && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-emerald-950">
                    Pembayaran Berhasil Diverifikasi di Server!
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Status transaksi telah resmi tercatat sebagai <strong>SETTLEMENT</strong>. Kamar telah terkunci dan Anda siap untuk melakukan proses check-in.
                  </p>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-rose-950">
                    Invoice Telah Kedaluwarsa
                  </p>
                  <p className="text-rose-800 leading-relaxed">
                    Batas waktu pembayaran 24 jam telah lewat. Kamar telah dikembalikan ke katalog publik berstatus TERSEDIA untuk calon penghuni lainnya.
                  </p>
                </div>
              </div>
            )}

            {/* Room & Tenant Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                <span className="text-zinc-500 font-bold text-[10px] block">
                  Data Calon Penghuni
                </span>
                <div className="font-bold text-zinc-900 text-sm">
                  {reservation?.userName || 'Calon Penghuni Kos Omi'}
                </div>
                <div className="text-zinc-600">
                  {reservation?.userPhone || '0812-xxxx-xxxx'} â€¢ {reservation?.userEmail || 'email@domain.com'}
                </div>
                <div className="text-zinc-500 text-[11px]">
                  Rencana Masuk: <strong>{reservation?.checkInDate || '2026-11-01'}</strong> ({reservation?.durationMonths || 6} Bulan)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1.5">
                <span className="text-zinc-500 font-bold text-[10px] block">
                  Informasi Kamar
                </span>
                <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-blue-600" />
                  <span>Kamar {invoice.roomCode}</span>
                </div>
                <div className="text-zinc-600">
                  {room ? ROOM_TYPE_LABELS[room.type] : 'Tipe Standar AC Kos Omi'}
                </div>
                <div className="text-zinc-500 text-[11px]">
                  Posisi: Lantai {room?.floor || 1} â€¢ Luas: {room?.areaSqm || 12} mÂ²
                </div>
              </div>
            </div>

            {/* Detailed Table of Charges */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-zinc-700">
                Rincian Biaya Reservasi Awal
              </h3>

              <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                      <th className="py-2.5 px-4">Deskripsi Item</th>
                      <th className="py-2.5 px-4 text-right">Durasi / Satuan</th>
                      <th className="py-2.5 px-4 text-right">Nominal (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 block">
                          Biaya Sewa Bulan Pertama
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Sewa Kamar {invoice.roomCode} periode bulan masuk
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-600">1 Bulan</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(monthlyPrice)}
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-bold text-zinc-900 block">
                          Deposit Sewa Jaminan (100%)
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Jaminan inventaris kamar (dapat dikembalikan saat check-out)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-600">1x Biaya</td>
                      <td className="py-3 px-4 text-right font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(depositAmount)}
                      </td>
                    </tr>

                    <tr className="bg-zinc-50/50">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-zinc-700 block">
                          Biaya Transaksi Gateway Midtrans
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Gratis (Ditanggung Pengelola Kos Omi)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-zinc-500">-</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-emerald-700">
                        Rp 0
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50 border-t-2 border-zinc-200 font-bold text-sm">
                      <td colSpan={2} className="py-3.5 px-4 text-zinc-900">
                        Total Tagihan Pembayaran Awal
                      </td>
                      <td className="py-3.5 px-4 text-right text-[hsl(186,72%,24%)] text-base tabular-nums">
                        {formatRupiah(invoice.amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Checkout Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Action Box */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
            <h3 className="text-xs font-bold text-zinc-700 border-b border-zinc-100 pb-2.5">
              Penyelesaian Tagihan
            </h3>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1 text-xs">
              <span className="text-zinc-500">Total yang Harus Dibayar:</span>
              <div className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                {formatRupiah(invoice.amount)}
              </div>
            </div>

            {/* Conditional Button based on Status */}
            {isUnpaid && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-all active:scale-[0.99] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Sekarang</span>
                </button>

                {/* Badge Pembayaran Aman via Midtrans */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">
                    Pembayaran Aman via Midtrans
                  </span>
                </div>
              </div>
            )}

            {isPaid && (
              <div className="space-y-3">
                <NextLink
                  href={`/pembayaran/selesai?order_id=${invoice.invoiceCode}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Buka Kuitansi Resmi</span>
                </NextLink>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transaksi Berstatus SETTLEMENT</span>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="space-y-3">
                <NextLink
                  href="/kamar"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Cari Kamar Tersedia Lainnya</span>
                </NextLink>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Masa berlaku invoice telah habis</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Gateway Information Box */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2.5 text-xs text-zinc-600 leading-relaxed">
            <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
              <span>Metode Pembayaran Resmi</span>
            </h4>
            <p className="text-[11px]">
              Kos Omi menggunakan gateway resmi <strong>Midtrans Snap</strong> dengan verifikasi server instan tanpa perlu konfirmasi manual atau mengirim bukti transfer via chat.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">QRIS</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">BRI</span><span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">BCA</span><span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">BSI</span><span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">Bank Nagari</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">SeaBank</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">DANA</span><span className="px-2 py-0.5 rounded bg-zinc-100 tabular-nums text-[10px] text-zinc-700 font-bold">ShopeePay</span>
            </div>
          </div>

          {/* Sandbox Demo Quick Switcher Bar */}
          <div className="bg-zinc-100/80 p-4 rounded-2xl border border-zinc-200 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-zinc-500 block">
              Simulasi Status Tagihan (Demo Testing)
            </span>
            <div className="space-y-1.5">
              <NextLink
                href="/calon/pembayaran/INV-202506-00045"
                className="w-full block p-2 rounded-lg bg-white border border-zinc-200 hover:border-amber-400 font-medium text-zinc-800 text-[11px]"
              >
                â€¢ Uji Status Menunggu Bayar (INV-202506-00045)
              </NextLink>
              <NextLink
                href="/calon/pembayaran/INV-202506-00012"
                className="w-full block p-2 rounded-lg bg-white border border-zinc-200 hover:border-emerald-400 font-medium text-zinc-800 text-[11px]"
              >
                â€¢ Uji Status Lunas (INV-202506-00012)
              </NextLink>
              <NextLink
                href="/calon/pembayaran/INV-202506-00014"
                className="w-full block p-2 rounded-lg bg-white border border-zinc-200 hover:border-rose-400 font-medium text-zinc-800 text-[11px]"
              >
                â€¢ Uji Status Kedaluwarsa (INV-202506-00014)
              </NextLink>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isUnpaid && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          invoice={invoice}
          reservation={reservation || undefined}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(paid) => {
            setInvoice(paid);
            setIsPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

