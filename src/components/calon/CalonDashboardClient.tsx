'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
import {
  approveReservationForDemoAction,
  cancelReservationByCalonAction,
  fetchMyReservationsAction,
} from '@/actions/reservations';
import {
  submitPaymentConfirmationAction,
  resetPaymentToUnpaidAction,
} from '@/actions/payments';
import { getClientSession, setClientSession } from '@/lib/auth-client';
import {
  KosOmiPaymentSelector,
  KOS_OMI_PAYMENT_METHODS,
} from '@/components/payment/KosOmiPaymentMethods';
import { useRouter } from 'next/navigation';
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
  XCircle,
} from 'lucide-react';

interface CalonDashboardClientProps {
  initialReservations: Reservation[];
  currentEmail: string;
  currentUserName?: string;
}

export const CalonDashboardClient: React.FC<CalonDashboardClientProps> = ({
  initialReservations,
  currentEmail,
  currentUserName = '',
}) => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(
    initialReservations[0] || null
  );
  const [displayUserName, setDisplayUserName] = useState<string>(currentUserName);
  const [displayUserEmail, setDisplayUserEmail] = useState<string>(currentEmail);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(
    initialReservations[0]?.payment || null
  );
  const [selectedMethod, setSelectedMethod] = useState<string>('dana');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPayingDirect, setIsPayingDirect] = useState(false);
  const [isCancellingModalOpen, setIsCancellingModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const clientUser = getClientSession();
    if (clientUser && clientUser.email) {
      const clientEmail = clientUser.email.toLowerCase().trim();
      setDisplayUserEmail(clientUser.email);
      if (clientUser.name && clientUser.name !== 'Pengguna Terdaftar') {
        setDisplayUserName(clientUser.name);
      } else if (currentUserName) {
        setDisplayUserName(currentUserName);
      }

      // Sinkronkan daftar reservasi milik email akun yang sedang login di browser
      if (clientEmail !== currentEmail.toLowerCase().trim() || initialReservations.length === 0) {
        fetchMyReservationsAction(clientEmail).then((myRes) => {
          setReservations(myRes);
          setActiveReservation(myRes[0] || null);
          setSelectedInvoice(myRes[0]?.payment || null);
          if (myRes[0]?.userName) {
            setDisplayUserName(myRes[0].userName);
          }
        });
      }
    }
  }, [currentEmail, currentUserName, initialReservations.length]);

  const handleDirectPay = async (invoiceCode: string) => {
    setPaymentError(null);
    setIsPayingDirect(true);
    setFeedbackMessage(null);
    const result = await submitPaymentConfirmationAction(invoiceCode, selectedMethod);
    setIsPayingDirect(false);
    if (result.success) {
      setFeedbackMessage(result.message);
      if (result.reservation) {
        setReservations((prev) =>
          prev.map((r) => (r.code === result.reservation!.code ? result.reservation! : r))
        );
        setActiveReservation(result.reservation);
      }
      if (result.payment) {
        setSelectedInvoice(result.payment);
      }
      router.refresh();
    } else {
      setPaymentError(result.message || 'Gagal mengirim konfirmasi pembayaran.');
    }
  };

  const handleResetToUnpaid = (invoiceCode: string) => {
    setFeedbackMessage(null);
    setPaymentError(null);
    startTransition(async () => {
      const res = await resetPaymentToUnpaidAction(invoiceCode);
      if (res.success && res.reservation) {
        setFeedbackMessage(
          `Tagihan ${invoiceCode} berhasil dikembalikan ke status BELUM DIBAYAR.`
        );
        setReservations((prev) =>
          prev.map((r) => (r.code === res.reservation!.code ? res.reservation! : r))
        );
        setActiveReservation(res.reservation);
        if (res.payment) {
          setSelectedInvoice(res.payment);
        }
      }
    });
  };

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

  const handleCancelReservation = async (resCode: string) => {
    setIsCancelling(true);
    setPaymentError(null);
    setFeedbackMessage(null);
    const res = await cancelReservationByCalonAction(resCode);
    setIsCancelling(false);
    setIsCancellingModalOpen(false);

    if (res.success && res.data) {
      setFeedbackMessage(res.message);
      setReservations((prev) => prev.map((r) => (r.code === resCode ? res.data! : r)));
      setActiveReservation(res.data);
      if (res.data.payment) {
        setSelectedInvoice(res.data.payment);
      }
      router.refresh();
    } else {
      setPaymentError(res.message || 'Gagal membatalkan pesanan.');
    }
  };

  const current = activeReservation;
  const canCancelReservation =
    Boolean(current) &&
    (current!.status === 'PENDING_REVIEW' ||
      (current!.status === 'APPROVED' && current!.payment?.status !== 'SETTLEMENT'));

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
              {displayUserName || current?.userName || 'Calon Penghuni Kos Omi'}
            </p>
            <p className="text-xs text-zinc-500">
              {displayUserEmail || current?.userEmail || currentEmail}
            </p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Nomor Kode Reservasi</span>
                <h2 className="font-heading font-extrabold text-xl text-zinc-900">
                  {current.code}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <ReservationStatusBadge status={current.status} size="md" />
                {canCancelReservation && (
                  <button
                    type="button"
                    onClick={() => setIsCancellingModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <XCircle size={14} />
                    <span>Batalkan Pesanan</span>
                  </button>
                )}
              </div>
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

            {/* ACTION BANNER BERDASARKAN STATUS (LANGSUNG TAMPILKAN PAYMENT GATEWAY QRIS & TRANSFER BANK) */}
            {current.status === 'APPROVED' && current.payment && (
              <div className="p-5 sm:p-6 rounded-2xl bg-sky-50/70 border-2 border-sky-200 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-200/70">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sky-950 font-extrabold text-sm sm:text-base">
                      <Clock size={18} className="text-sky-700" />
                      <span>
                        Payment Gateway Siap! Selesaikan Pembayaran Kamar {current.roomCode} ({formatRupiah(current.totalInitialPayment)})
                      </span>
                    </div>
                    <p className="text-xs text-sky-800 max-w-2xl">
                      Tersedia pembayaran via <strong>DANA Resmi (082246424353), Transfer Bank / Virtual Account (BCA, BRI, BNI, Mandiri, Permata), QRIS, serta E-Wallet (GoPay & ShopeePay) melalui Midtrans</strong>.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-lg bg-amber-100 border border-amber-300 text-xs font-extrabold text-amber-900">
                      Batas Waktu Bayar: 1x24 Jam
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white border border-sky-200 text-xs font-extrabold text-sky-900 tabular-nums">
                      Invoice: {current.payment.invoiceCode}
                    </span>
                  </div>
                </div>

                {/* Status apabila sudah kirim konfirmasi transfer namun menunggu validasi Pengelola */}
                {current.payment.status === 'PENDING' && (
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-amber-900">
                        <Clock size={16} className="text-amber-600 animate-pulse" />
                        <span>Status Pembayaran: MENUNGGU VALIDASI PENGELOLA KOS</span>
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                        Metode: {current.payment.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Konfirmasi pembayaran Anda sebesar <strong>{formatRupiah(current.totalInitialPayment)}</strong> telah masuk ke antrean Pengelola Kos Omi. Tagihan Anda akan berubah menjadi <strong>LUNAS</strong> segera setelah <strong>Pengelola memeriksa dana masuk di rekening/DANA (082246424353) dan memvalidasi pembayaran Anda</strong>.
                    </p>
                  </div>
                )}

                {/* Pilihan Langsung QRIS, DANA & Transfer Bank */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200">
                  <KosOmiPaymentSelector
                    selectedMethod={selectedMethod}
                    onSelectMethod={setSelectedMethod}
                    amountFormatted={formatRupiah(current.totalInitialPayment)}
                  />
                </div>

                {paymentError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* SATU TOMBOL AKSI UTAMA DINAMIS SESUAI METODE YANG DIPILIH */}
                <div className="flex flex-col gap-2.5">
                  {selectedMethod === 'dana' ? (
                    <button
                      type="button"
                      disabled={isPayingDirect}
                      onClick={() => handleDirectPay(current.payment!.invoiceCode)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] disabled:opacity-50 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      <span>
                        {isPayingDirect
                          ? 'Mengirim Konfirmasi Pembayaran ke Pengelola...'
                          : current.payment.status === 'PENDING'
                          ? 'Sudah Dikirim ke Pengelola — Kirim Ulang Konfirmasi (DANA)'
                          : 'Saya Sudah Transfer via DANA — Kirim ke Pengelola untuk Divalidasi'}
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedInvoice(current.payment!);
                          setIsPaymentModalOpen(true);
                        }}
                        className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                      >
                        <CreditCard size={18} />
                        <span>Bayar Sekarang via Midtrans Snap</span>
                      </button>
                      <button
                        type="button"
                        disabled={isPayingDirect}
                        onClick={() => handleDirectPay(current.payment!.invoiceCode)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-700 font-bold text-xs px-4 py-3.5 rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>
                          {isPayingDirect
                            ? 'Mengirim...'
                            : `Konfirmasi Sudah Transfer (${
                                KOS_OMI_PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label || 'Midtrans'
                              })`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
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
                    Pengelola Kos Omi sedang memeriksa data dan dokumen identitas Anda. Tagihan pembayaran akan otomatis muncul di halaman ini setelah reservasi disetujui.
                  </p>
                </div>
              </div>
            )}

            {current.status === 'PAID' && current.payment && (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-700" />
                    <span>Pembayaran Terverifikasi Lunas</span>
                  </div>
                  <p className="text-xs text-emerald-800 max-w-xl">
                    Kamar <strong>{current.roomCode}</strong> telah resmi dipesan atas nama Anda. Tanggal rencana masuk Anda adalah <strong>{current.checkInDate}</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const clientUser = getClientSession();
                      setClientSession({
                        id: clientUser?.id || current.userId || `usr-penghuni-${Date.now()}`,
                        name: displayUserName || current.userName,
                        email: displayUserEmail || current.userEmail,
                        role: 'PENGHUNI',
                        roleLabel: 'Penghuni Aktif',
                        dashboardPath: '/penghuni/dashboard',
                        roomCode: current.roomCode,
                        token: clientUser?.token || `jwt-penghuni-${Date.now()}`,
                      });
                      router.push('/penghuni/dashboard');
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Building size={14} />
                    <span>Masuk ke Portal Penghuni Aktif</span>
                    <ArrowRight size={14} />
                  </button>
                  <NextLink
                    href={`/pembayaran/selesai?order_id=${current.payment.invoiceCode}`}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all"
                  >
                    <FileText size={14} />
                    Lihat Bukti Pembayaran
                  </NextLink>
                </div>
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
                      Tipe: <strong>Kamar Standar Kos Omi (Lantai {current.room?.floor || (parseInt(current.roomCode, 10) <= 33 ? 1 : 2)})</strong>
                    </p>
                    <p className="text-zinc-500">
                      Tanggal Rencana Masuk: <strong>{current.checkInDate}</strong>
                    </p>
                    <p className="text-zinc-500">
                      Durasi Kontrak Sewa: <strong>{current.durationMonths} Bulan (1 Semester)</strong>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
                  <div>
                    <span className="text-zinc-400 block">Nama Lengkap</span>
                    <span className="font-bold text-zinc-800">{current.userName}</span>
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
                  <div className="sm:col-span-2">
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
                    <span>Biaya Sewa 1 Semester (Kamar {current.roomCode})</span>
                    <span className="font-bold text-zinc-800 tabular-nums">
                      {formatRupiah(current.monthlyPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Biaya Administrasi Sistem</span>
                    <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-zinc-100 text-base font-extrabold text-[hsl(186,72%,24%)]">
                    <span>Total Pembayaran Awal</span>
                    <span className="tabular-nums">
                      {formatRupiah(current.monthlyPrice)}
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
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Batas Waktu Pembayaran:</span>
                      <span className="font-bold text-amber-700">1x24 Jam Setelah Disetujui</span>
                    </div>
                  </div>
                )}

                {/* Tombol Tindakan Cepat */}
                <div className="space-y-2 pt-2">
                  {current.status === 'PAID' && current.payment && (
                    <NextLink
                      href={`/pembayaran/selesai?order_id=${current.payment.invoiceCode}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors text-center"
                    >
                      Buka Bukti Bayar Server
                      <ExternalLink size={13} />
                    </NextLink>
                  )}

                  {canCancelReservation && (
                    <button
                      type="button"
                      onClick={() => setIsCancellingModalOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
                    >
                      <XCircle size={14} />
                      <span>Batalkan Pesanan Kamar Ini</span>
                    </button>
                  )}

                  <a
                    href="https://wa.me/6282287146763?text=Halo%20Ibu%20Yulastri%20(Kos%20Omi),%20saya%20ingin%20bertanya%20mengenai%20status%20reservasi%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <Phone size={13} className="text-emerald-600" />
                    Hubungi Ibu Yulastri via WhatsApp (0822-8714-6763)
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG KONFIRMASI BATALKAN PESANAN */}
      {isCancellingModalOpen && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Konfirmasi Pembatalan Pesanan
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Reservasi {current.code} · Kamar No. {current.roomCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCancellingModalOpen(false)}
                className="p-1 rounded-lg text-rose-100 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-zinc-700 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pesanan <strong>Kamar No. {current.roomCode}</strong>?
              </p>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold">Dampak Pembatalan:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Status reservasi diubah menjadi <strong>Dibatalkan</strong>.</li>
                  <li>Tagihan/invoice yang belum dibayar otomatis dibatalkan.</li>
                  <li>Status Kamar No. {current.roomCode} dikembalikan menjadi <strong>Tersedia</strong> agar Anda dapat memilih kamar lain.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsCancellingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => handleCancelReservation(current.code)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan'}
                </button>
              </div>
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
