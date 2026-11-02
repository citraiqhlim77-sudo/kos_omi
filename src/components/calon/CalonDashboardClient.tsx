'use client';

import React, { useState, useTransition } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Reservation, PaymentInvoice } from '@/types/reservation';
import { Room } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { ReservationStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import dynamic from 'next/dynamic';

// Dynamic import untuk modal pembayaran Midtrans Snap (Task 3.6 Performa & Optimasi)
const PaymentModal = dynamic(
  () => import('@/components/calon/PaymentModal').then((mod) => mod.PaymentModal),
  { ssr: false }
);
import { approveReservationForDemoAction } from '@/actions/reservations';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Phone,
  Sparkles,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface CalonDashboardClientProps {
  initialReservations: Reservation[];
  currentEmail: string;
}

export const CalonDashboardClient: React.FC<CalonDashboardClientProps> = ({
  initialReservations,
  currentEmail,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(
    initialReservations[0] || null
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(
    initialReservations[0]?.payment || null
  );
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Fungsi demo untuk menyetujui reservasi secara instan (memudahkan pengujian)
  const handleApproveDemo = (resCode: string) => {
    setFeedbackMessage(null);
    startTransition(async () => {
      const res = await approveReservationForDemoAction(
        resCode,
        'Verifikasi KTP dan berkas calon penghuni telah disetujui oleh pengelola Kos Omi.'
      );

      if (res.success && res.data) {
        setFeedbackMessage('Reservasi berhasil disetujui! Invoice pembayaran 24 jam telah aktif.');
        // Perbarui state lokal
        setReservations((prev) =>
          prev.map((r) => (r.code === resCode ? res.data! : r))
        );
        setActiveReservation(res.data);
        if (res.data.payment) {
          setSelectedInvoice(res.data.payment);
        }
      }
    });
  };

  const current = activeReservation;

  return (
    <div className="space-y-8">
      {/* DEMO USER SWITCHER & INFORMATION */}
      <div className="bg-white p-4 rounded-xl border border-[hsl(240,6%,90%)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[hsl(186,72%,24%)] flex items-center justify-center font-bold">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 font-medium">Akun Calon Penghuni Aktif</p>
            <p className="font-heading font-extrabold text-base text-zinc-900">
              {current?.userName || 'Calon Penghuni Kos Omi'}
            </p>
            <p className="text-xs text-zinc-500">{current?.userEmail || currentEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NextLink
            href="/kamar"
            className="text-xs px-3.5 py-2 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 font-bold hover:bg-sky-100 transition-colors"
          >
            + Pesan Kamar Baru
          </NextLink>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} />
            <span>{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KONTEN UTAMA: DETAIL RESERVASI AKTIF */}
      {!current ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
            <FileText size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-zinc-900 text-lg">
              Belum Ada Pengajuan Reservasi
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Anda belum memiliki pengajuan reservasi aktif di Kos Omi. Silakan pilih kamar yang sesuai di katalog kamar.
            </p>
          </div>
          <NextLink
            href="/kamar"
            className="inline-flex items-center gap-2 bg-[hsl(186,72%,24%)] text-white text-xs font-semibold px-4 py-2.5 rounded-lg"
          >
            Pilih Kamar Sekarang
            <ArrowRight size={14} />
          </NextLink>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. STEPPER ALUR RESERVASI & PEMBAYARAN */}
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Nomor Kode Reservasi</span>
                <h2 className="font-heading font-extrabold text-xl text-zinc-900">
                  {current.code}
                </h2>
              </div>
              <ReservationStatusBadge status={current.status} size="md" />
            </div>

            {/* Visualizer 4 Tahap */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Tahap 1: Pengajuan */}
              <div
                className={`p-3.5 rounded-xl border ${
                  current.status === 'PENDING_REVIEW'
                    ? 'border-[hsl(186,72%,24%)] bg-blue-50/40 ring-1 ring-[hsl(186,72%,24%)]'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-zinc-800">1. Pengajuan</span>
                </div>
                <p className="text-[11px] text-zinc-500">Berkas identitas & KTP lengkap tersimpan</p>
              </div>

              {/* Tahap 2: Verifikasi 2x24 Jam */}
              <div
                className={`p-3.5 rounded-xl border ${
                  current.status === 'PENDING_REVIEW'
                    ? 'border-amber-300 bg-amber-50/50'
                    : current.status === 'APPROVED' || current.status === 'PAID'
                    ? 'border-zinc-200 bg-zinc-50'
                    : 'border-zinc-200 bg-zinc-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      current.status === 'APPROVED' || current.status === 'PAID'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {current.status === 'APPROVED' || current.status === 'PAID' ? '✓' : '2'}
                  </div>
                  <span className="text-xs font-bold text-zinc-800">2. Verifikasi Berkas</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {current.status === 'PENDING_REVIEW'
                    ? 'Sedang ditinjau (maks 2x24 jam)'
                    : 'Lolos verifikasi pengelola'}
                </p>
              </div>

              {/* Tahap 3: Pembayaran 24 Jam */}
              <div
                className={`p-3.5 rounded-xl border ${
                  current.status === 'APPROVED'
                    ? 'border-sky-400 bg-sky-50/60 ring-2 ring-sky-200'
                    : current.status === 'PAID'
                    ? 'border-zinc-200 bg-zinc-50'
                    : 'border-zinc-200 bg-zinc-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      current.status === 'PAID'
                        ? 'bg-emerald-600 text-white'
                        : current.status === 'APPROVED'
                        ? 'bg-sky-600 text-white animate-pulse'
                        : 'bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {current.status === 'PAID' ? '✓' : '3'}
                  </div>
                  <span className="text-xs font-bold text-zinc-800">3. Pembayaran</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {current.status === 'APPROVED'
                    ? 'Menunggu bayar (Batas 24 Jam)'
                    : current.status === 'PAID'
                    ? 'Lunas via Midtrans'
                    : 'Menunggu persetujuan'}
                </p>
              </div>

              {/* Tahap 4: Siap Huni */}
              <div
                className={`p-3.5 rounded-xl border ${
                  current.status === 'PAID'
                    ? 'border-emerald-300 bg-emerald-50/60 ring-2 ring-emerald-200'
                    : 'border-zinc-200 bg-zinc-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      current.status === 'PAID'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {current.status === 'PAID' ? '✓' : '4'}
                  </div>
                  <span className="text-xs font-bold text-zinc-800">4. Siap Check-in</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {current.status === 'PAID' ? 'Kunci siap diserahterimakan' : 'Setelah lunas'}
                </p>
              </div>
            </div>

            {/* ACTION BANNER BERDASARKAN STATUS */}
            {current.status === 'APPROVED' && current.payment && (
              <div className="p-5 rounded-xl bg-sky-50 border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                    <Clock size={18} className="text-sky-700" />
                    <span>Reservasi Anda Telah Disetujui! Selesaikan Pembayaran Dalam 24 Jam</span>
                  </div>
                  <p className="text-xs text-sky-800 max-w-xl">
                    Kamar <strong>{current.roomCode}</strong> telah dikunci dengan status &quot;Sedang Dipesan&quot;. Silakan selesaikan invoice booking pertama sejumlah{' '}
                    <strong>{formatRupiah(current.totalInitialPayment)}</strong> via Midtrans Snap.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedInvoice(current.payment!);
                    setIsPaymentModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shrink-0 active:scale-95"
                >
                  <CreditCard size={18} />
                  Bayar Sekarang via Midtrans Snap
                </button>
              </div>
            )}

            {current.status === 'PENDING_REVIEW' && (
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Clock size={18} className="text-amber-700" />
                    <span>Verifikasi Berkas Sedang Berjalan (Maksimal 2x24 Jam)</span>
                  </div>
                  <p className="text-xs text-amber-800 max-w-xl">
                    Tim Pengelola Kos Omi sedang mencocokkan data KTP dan identitas Anda. Notifikasi akan dikirimkan otomatis segera setelah disetujui.
                  </p>
                </div>

                {/* Tombol Demo Simulator Persetujuan */}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleApproveDemo(current.code)}
                  className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shrink-0 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {isPending ? 'Memproses Persetujuan...' : 'Simulasikan Persetujuan Admin (Demo)'}
                </button>
              </div>
            )}

            {current.status === 'PAID' && current.payment && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-700" />
                    <span>Pembayaran Terverifikasi Lunas di Server Kos Omi</span>
                  </div>
                  <p className="text-xs text-emerald-800 max-w-xl">
                    Kamar <strong>{current.roomCode}</strong> telah resmi berstatus TERISI atas nama Anda. Tanggal rencana masuk Anda adalah <strong>{current.checkInDate}</strong>.
                  </p>
                </div>

                <NextLink
                  href={`/pembayaran/selesai?order_id=${current.payment.invoiceCode}`}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shrink-0"
                >
                  <FileText size={14} />
                  Lihat Kuitansi Resmi Server
                </NextLink>
              </div>
            )}
          </Card>

          {/* 2. RINCIAN KAMAR & BIAYA TRANSAKSI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Spesifikasi Kamar & Informasi Calon Penghuni */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                  <Building size={18} className="text-[hsl(186,72%,24%)]" />
                  Kamar yang Dipesan
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                  {current.room && current.room.photoUrls && (
                    <div className="relative w-full sm:w-44 aspect-[16/10] rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                      <Image
                        src={current.room.photoUrls[0]}
                        alt={`Kamar ${current.roomCode}`}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-zinc-600 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-base text-zinc-900">
                        Kamar {current.roomCode}
                      </span>
                      <span className="text-[hsl(186,72%,24%)] font-bold">
                        Lantai {current.room?.floor || current.roomCode.split('-')[0]}
                      </span>
                    </div>
                    <p className="text-zinc-500">
                      Tipe: <strong>{current.room?.type || 'DELUXE_AC'}</strong>
                    </p>
                    <p className="text-zinc-500">
                      Tanggal Rencana Masuk: <strong>{current.checkInDate}</strong>
                    </p>
                    <p className="text-zinc-500">
                      Durasi Kontrak Sewa: <strong>{current.durationMonths} Bulan</strong>
                    </p>
                  </div>
                </div>
              </Card>

              {/* Data Diri Penghuni */}
              <Card className="p-6 space-y-3">
                <h3 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                  <User size={18} className="text-[hsl(186,72%,24%)]" />
                  Data Diri Calon Penghuni
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600">
                  <div>
                    <span className="text-zinc-400 block">Nama Lengkap</span>
                    <span className="font-bold text-zinc-800">{current.userName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Nomor NIK KTP</span>
                    <span className="font-bold text-zinc-800">{current.userNik}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Nomor WhatsApp</span>
                    <span className="font-bold text-zinc-800">{current.userPhone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Alamat Email</span>
                    <span className="font-bold text-zinc-800">{current.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Pekerjaan / Instansi</span>
                    <span className="font-bold text-zinc-800">{current.userOccupation}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Kontak Darurat</span>
                    <span className="font-bold text-zinc-800">
                      {current.emergencyContactName} ({current.emergencyContactRelation}) -{' '}
                      {current.emergencyContactPhone}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Kolom Kanan: Rincian Invoice & Pembayaran */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
                  <CreditCard size={18} className="text-[hsl(186,72%,24%)]" />
                  Rincian Biaya & Invoice
                </h3>

                <div className="space-y-3 text-xs text-zinc-600">
                  <div className="flex justify-between items-center">
                    <span>Sewa Bulan Pertama ({current.roomCode})</span>
                    <span className="font-bold text-zinc-800 tabular-nums">
                      {formatRupiah(current.monthlyPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Deposit Jaminan (1 Bulan)</span>
                    <span className="font-bold text-zinc-800 tabular-nums">
                      {formatRupiah(current.depositAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Biaya Administrasi Sistem</span>
                    <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 text-base font-extrabold text-[hsl(186,72%,24%)]">
                    <span>Total Pembayaran Awal</span>
                    <span className="tabular-nums">
                      {formatRupiah(current.totalInitialPayment)}
                    </span>
                  </div>
                </div>

                {current.payment && (
                  <div className="pt-2 border-t border-zinc-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Nomor Invoice:</span>
                      <span className="font-bold text-zinc-800">{current.payment.invoiceCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Status Invoice:</span>
                      <PaymentStatusBadge status={current.payment.status} size="sm" />
                    </div>
                  </div>
                )}

                {/* Tombol Tindakan Cepat */}
                <div className="space-y-2 pt-2">
                  {current.status === 'APPROVED' && current.payment && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedInvoice(current.payment!);
                        setIsPaymentModalOpen(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-lg transition-all"
                    >
                      <CreditCard size={16} />
                      Bayar Sekarang via Midtrans Snap
                    </button>
                  )}

                  {current.status === 'PAID' && current.payment && (
                    <NextLink
                      href={`/pembayaran/selesai?order_id=${current.payment.invoiceCode}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors text-center"
                    >
                      Buka Bukti Bayar Server
                      <ExternalLink size={13} />
                    </NextLink>
                  )}

                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20ingin%20bertanya%20mengenai%20status%20reservasi%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    Hubungi Pengelola via WhatsApp
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMBAYARAN MIDTRANS SNAP */}
      {selectedInvoice && current && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          invoice={selectedInvoice}
          reservation={current}
        />
      )}
    </div>
  );
};
