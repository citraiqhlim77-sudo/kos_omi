import React from 'react';
import { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import { fetchPaymentStatusFromServerAction } from '@/actions/payments';
import { formatRupiah } from '@/data/rooms';
import { ROOM_TYPE_LABELS } from '@/types/room';
import { PaymentStatusBadge, ReservationStatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Home,
  FileText,
  Calendar,
  Building,
  User,
  CreditCard,
  Phone,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Konfirmasi Pembayaran - Kos Omi Sungai Bangek, Padang',
  description:
    'Halaman konfirmasi resmi status pembayaran invoice booking Kos Omi Sungai Bangek, Padang. Status diambil ulang langsung dari server database terpercaya.',
};

interface PembayaranSelesaiPageProps {
  searchParams: Promise<{
    order_id?: string;
    transaction_status?: string; // parameter dari Midtrans — DIABAIKAN, server yang menentukan
    status_code?: string;        // parameter dari Midtrans — DIABAIKAN
  }>;
}

export default async function PembayaranSelesaiPage({
  searchParams,
}: PembayaranSelesaiPageProps) {
  const params = await searchParams;

  // ============================================================
  // PRINSIP UTAMA TASK 2.11:
  // Parameter `transaction_status` dan `status_code` dari Midtrans
  // DIABAIKAN sepenuhnya. Status satu-satunya yang valid adalah
  // hasil query LANGSUNG ke server database Kos Omi.
  // Ini mencegah manipulasi URL oleh pengguna.
  // ============================================================
  const orderIdFromUrl = params.order_id || '';

  // Ambil ulang status otoritatif dari server
  const serverResult = await fetchPaymentStatusFromServerAction(orderIdFromUrl);

  const { isVerified, status, message, payment, reservation, room } = serverResult;

  // ----------------------------------------------------------------
  // RENDER: Tidak ada order_id
  // ----------------------------------------------------------------
  if (!orderIdFromUrl) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Parameter Order Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Halaman ini membutuhkan parameter <code>order_id</code> yang valid. Akses halaman ini melalui alur pembayaran resmi Kos Omi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <NextLink
            href="/calon"
            className="inline-flex items-center gap-2 bg-[hsl(217,91%,45%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
          >
            <Home size={16} />
            Buka Portal Calon Penghuni
          </NextLink>
          <NextLink
            href="/kamar"
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-50"
          >
            Katalog 67 Kamar
          </NextLink>
        </div>

        {/* Sandbox Quick Testing Bar */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-left space-y-2 mt-6">
          <span className="font-bold text-slate-700 block">Uji Simulasi Status Pembayaran (Task 1.7 PRD):</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <NextLink
              href="/pembayaran/selesai?order_id=INV-202506-00012"
              className="p-2.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-semibold hover:bg-emerald-50 text-center"
            >
              ✓ Uji Status Lunas (SETTLEMENT)
            </NextLink>
            <NextLink
              href="/pembayaran/selesai?order_id=INV-202506-00045"
              className="p-2.5 rounded-lg bg-white border border-amber-200 text-amber-800 font-semibold hover:bg-amber-50 text-center"
            >
              ⏳ Uji Status Menunggu (UNPAID)
            </NextLink>
            <NextLink
              href="/pembayaran/selesai?order_id=INV-202506-00014"
              className="p-2.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-semibold hover:bg-rose-50 text-center"
            >
              ✕ Uji Status Kedaluwarsa (EXPIRED)
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: Invoice Tidak Ditemukan
  // ----------------------------------------------------------------
  if (status === 'NOT_FOUND') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Transaksi Tidak Ditemukan di Server</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Invoice dengan kode <strong>{orderIdFromUrl}</strong> tidak terdaftar di server database Kos Omi. Pastikan Anda menggunakan tautan resmi dari sistem kami.
        </p>
        <p className="text-xs text-slate-500 italic max-w-md mx-auto">
          Catatan Keamanan: Status pembayaran Kos Omi selalu diverifikasi dari server database, bukan dari parameter URL. Hal ini melindungi Anda dari manipulasi status pembayaran.
        </p>
        <NextLink
          href="/calon"
          className="inline-flex items-center gap-2 bg-[hsl(217,91%,45%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          Buka Portal Calon Penghuni
        </NextLink>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: Pembayaran LUNAS (SETTLEMENT) — Status Server Terverifikasi
  // ----------------------------------------------------------------
  if (isVerified && payment && reservation) {
    return (
      <div className="bg-slate-50 min-h-screen py-10 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          {/* HEADER BERHASIL */}
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
              <CheckCircle2 size={44} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Pembayaran Lunas Terverifikasi!
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                Status <strong>SETTLEMENT</strong> dikonfirmasi langsung oleh server database Kos Omi — bukan dari parameter URL. Kamar Anda telah resmi terkunci dan siap untuk check-in.
              </p>
            </div>

            {/* Server Verification Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-lg">
              <ShieldCheck size={16} />
              <span>Diverifikasi Langsung dari Server Database Kos Omi — Bukan dari URL Parameter</span>
            </div>
          </div>

          {/* KUITANSI RESMI SERVER */}
          <Card className="p-6 md:p-8 space-y-6 bg-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium">Kuitansi Pembayaran Resmi</p>
                <h2 className="font-heading font-extrabold text-xl text-slate-900">
                  {payment.invoiceCode}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Tanggal Lunas</p>
                <p className="font-bold text-slate-800 text-sm">
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleString('id-ID', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            {/* Kamar Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              {room && room.photoUrls && (
                <div className="relative w-full sm:w-40 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <Image
                    src={room.photoUrls[0]}
                    alt={`Kamar ${reservation.roomCode}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 text-sm flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    Kamar {reservation.roomCode}
                  </h3>
                  {reservation.status && (
                    <ReservationStatusBadge status={reservation.status} size="sm" />
                  )}
                </div>
                <p className="text-slate-500 text-xs flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  Gedung Kos Omi, Jl. Sungai Bangek, Kel. Balai Gadang, Koto Tangah, Kota Padang
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block">Tipe Kamar</span>
                    <span className="font-semibold text-slate-800">
                      {room ? ROOM_TYPE_LABELS[room.type] : reservation.roomCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Durasi Sewa</span>
                    <span className="font-semibold text-slate-800">{reservation.durationMonths} Bulan</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tanggal Check-in</span>
                    <span className="font-semibold text-slate-800">{reservation.checkInDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lantai</span>
                    <span className="font-semibold text-slate-800">Lantai {room?.floor || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Biaya */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3 text-sm">
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-200">
                Rincian Biaya Booking Pertama
              </h3>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Sewa Bulan Pertama</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatRupiah(reservation.monthlyPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Deposit Jaminan (Dapat Dikembalikan 100%)</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatRupiah(reservation.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Biaya Administrasi</span>
                <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-base font-extrabold text-emerald-700">
                <span>Total Pembayaran Diterima</span>
                <span className="tabular-nums">{formatRupiah(payment.amount)}</span>
              </div>
            </div>

            {/* Detail Transaksi */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">Metode Pembayaran</span>
                <span className="font-bold text-slate-800">
                  {payment.paymentMethod === 'QRIS'
                    ? 'QRIS Midtrans'
                    : payment.paymentMethod === 'BCA_VA'
                    ? 'BCA Virtual Account'
                    : payment.paymentMethod === 'MANDIRI_VA'
                    ? 'Mandiri Bill Payment'
                    : payment.paymentMethod === 'GOPAY'
                    ? 'GoPay / GoPay Later'
                    : payment.paymentMethod || 'Midtrans Snap'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status Verifikasi Server</span>
                <PaymentStatusBadge status={payment.status} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Nomor Reservasi</span>
                <span className="font-bold text-slate-800">{reservation.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Nama Penghuni</span>
                <span className="font-bold text-slate-800">{reservation.userName}</span>
              </div>
            </div>
          </Card>

          {/* LANGKAH BERIKUTNYA */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">Langkah Berikutnya</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(217,91%,45%)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Simpan Kuitansi Ini</span>
                  <span>Screenshot halaman ini sebagai bukti pembayaran resmi dari server Kos Omi.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[hsl(217,91%,45%)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Konfirmasi Check-in via WhatsApp
                  </span>
                  <span>
                    Hubungi pengelola Kos Omi di WhatsApp untuk mengatur waktu pengambilan kunci dan serah terima kamar pada tanggal masuk Anda.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block">Selamat Datang di Kos Omi!</span>
                  <span>
                    Kamar {reservation.roomCode} telah resmi berstatus DIPESAN dan terkunci atas nama Anda. Pengelola siap menyambut Anda pada tanggal check-in{' '}
                    <strong>{reservation.checkInDate}</strong>.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20${encodeURIComponent(reservation.userName)}%20telah%20menyelesaikan%20pembayaran%20Invoice%20${payment.invoiceCode}%20untuk%20Kamar%20${reservation.roomCode}.%20Mohon%20konfirmasi%20jadwal%20serah%20terima%20kunci.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-lg transition-colors"
              >
                <Phone size={14} />
                Konfirmasi Check-in via WhatsApp
              </a>
              <NextLink
                href="/calon"
                className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold text-xs px-5 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Buka Portal Calon Penghuni
                <ArrowRight size={13} />
              </NextLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // RENDER: Pembayaran BELUM LUNAS atau KEDALUWARSA
  // ----------------------------------------------------------------
  const isExpired = status === 'EXPIRED';
  const isCancelled = status === 'CANCELLED';

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* HEADER STATUS BELUM LUNAS */}
        <div
          className={`bg-white rounded-2xl border p-8 text-center space-y-4 shadow-sm ${
            isExpired || isCancelled
              ? 'border-rose-200'
              : 'border-amber-200'
          }`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 ${
              isExpired || isCancelled
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {isExpired || isCancelled ? (
              <AlertCircle size={44} />
            ) : (
              <Clock size={44} />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isExpired
                ? 'Batas Waktu Pembayaran Kedaluwarsa'
                : isCancelled
                ? 'Transaksi Dibatalkan'
                : 'Pembayaran Belum Terselesaikan'}
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">{message}</p>
          </div>

          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg">
            <ShieldCheck size={16} className="text-slate-500" />
            <span>
              Status ini dikonfirmasi langsung dari server database — bukan dari parameter URL
            </span>
          </div>
        </div>

        {/* INFO INVOICE */}
        {payment && reservation && (
          <Card className="p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500">Nomor Invoice</span>
                <p className="font-bold text-slate-900">{payment.invoiceCode}</p>
              </div>
              <PaymentStatusBadge status={payment.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block">Kamar</span>
                <span className="font-bold text-slate-800">{reservation.roomCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jumlah Invoice</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {formatRupiah(payment.amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Batas Waktu Bayar</span>
                <span className="font-bold text-slate-800">
                  {new Date(payment.expiresAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Reservasi</span>
                <ReservationStatusBadge status={reservation.status} size="sm" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!isExpired && !isCancelled && reservation.status === 'APPROVED' && (
                <NextLink
                  href={`/calon?email=${reservation.userEmail}`}
                  className="inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] text-white font-semibold text-xs px-5 py-3 rounded-lg hover:bg-[hsl(217,91%,38%)] transition-colors"
                >
                  <CreditCard size={14} />
                  Coba Bayar Lagi via Portal Calon
                </NextLink>
              )}

              {(isExpired || isCancelled) && (
                <NextLink
                  href="/kamar"
                  className="inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] text-white font-semibold text-xs px-5 py-3 rounded-lg hover:bg-[hsl(217,91%,38%)] transition-colors"
                >
                  Pilih Kamar Tersedia Lainnya
                  <ArrowRight size={14} />
                </NextLink>
              )}

              <a
                href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20mengalami%20kendala%20pada%20pembayaran%20invoice%20saya.%20Mohon%20bantuan."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold text-xs px-5 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Phone size={14} className="text-emerald-600" />
                Hubungi Pengelola
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
