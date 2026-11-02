'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { Reservation, PaymentInvoice, ReservationStatus } from '@/types/reservation';
import { formatRupiah } from '@/data/rooms';
import dynamic from 'next/dynamic';

// Dynamic import untuk modal pembayaran Midtrans Snap (Task 3.6 Performa & Optimasi)
const PaymentModal = dynamic(
  () => import('@/components/calon/PaymentModal').then((mod) => mod.PaymentModal),
  { ssr: false }
);
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  BedDouble,
  User,
  Phone,
  Mail,
  FileText,
  Building,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface ReservationTimelineClientProps {
  reservation: Reservation;
}

export const ReservationTimelineClient: React.FC<ReservationTimelineClientProps> = ({
  reservation: initialReservation,
}) => {
  const [reservation, setReservation] = useState<Reservation>(initialReservation);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const status = reservation.status;
  const invoice = reservation.payment;

  // Calculate timeline states
  const isStep1Done = true; // Created
  const isStep2Done = status === 'APPROVED' || status === 'PAID';
  const isStep2Rejected = status === 'REJECTED';
  const isStep3Done = Boolean(invoice && (status === 'APPROVED' || status === 'PAID'));
  const isStep4Done = status === 'PAID';
  const isStep5Done = false; // Check-in at check-in date

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <NextLink
            href="/calon/reservasi"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {reservation.code}
              </span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-xs ${
                  status === 'APPROVED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status === 'PENDING_REVIEW'
                  ? 'Menunggu Verifikasi Pengelola'
                  : status === 'APPROVED'
                  ? 'Disetujui · Siap Bayar'
                  : status === 'PAID'
                  ? 'Lunas Terverifikasi'
                  : status === 'REJECTED'
                  ? 'Reservasi Ditolak'
                  : status}
              </span>
            </div>
            <h1 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
              Timeline Reservasi Kamar {reservation.roomCode}
            </h1>
          </div>
        </div>

        {status === 'APPROVED' && (
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Sekarang ({formatRupiah(reservation.totalInitialPayment)})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline Progress */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Alur Verifikasi & Pembayaran</h2>
            <p className="text-xs text-slate-500">
              Setiap langkah tercatat otomatis sesuai SOP resmi Kos Omi Sungai Bangek, Padang
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {/* Step 1: Pengajuan Formulir */}
            <div className="relative">
              <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">1. Formulir Diajukan</h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(reservation.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Data calon penghuni ({reservation.userName}) dan foto KTP berhasil dikirim ke server.
                </p>
              </div>
            </div>

            {/* Step 2: Verifikasi Berkas Pengelola */}
            <div className="relative">
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                  isStep2Done
                    ? 'bg-emerald-600 text-white'
                    : isStep2Rejected
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {isStep2Done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isStep2Rejected ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    2. Verifikasi Berkas & KTP (Pengelola)
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isStep2Done ? 'Terverifikasi' : isStep2Rejected ? 'Ditolak' : 'Maks 2x24 Jam'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {isStep2Done
                    ? reservation.adminNotes || 'Dokumen KTP dan data diri lengkap terverifikasi resmi oleh pengelola.'
                    : isStep2Rejected
                    ? 'Pengajuan tidak dapat disetujui.'
                    : 'Pengelola sedang mencocokkan NIK, foto KTP, dan jadwal ketersediaan kamar.'}
                </p>

                {/* Rejection box if rejected */}
                {isStep2Rejected && reservation.rejectionReason && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-950">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Alasan Penolakan dari Pengelola:
                    </span>
                    <p className="italic pl-5">"{reservation.rejectionReason}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Terbit Invoice Booking */}
            <div className="relative">
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                  isStep3Done
                    ? 'bg-emerald-600 text-white'
                    : isStep2Rejected
                    ? 'bg-slate-300 text-slate-500'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isStep3Done ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    3. Penerbitan Tagihan Pembayaran
                  </h3>
                  {invoice && (
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {invoice.invoiceCode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {isStep3Done
                    ? `Invoice booking sebesar ${formatRupiah(reservation.totalInitialPayment)} terbit dengan masa berlaku 24 jam.`
                    : 'Invoice otomatis diterbitkan setelah reservasi disetujui oleh pengelola.'}
                </p>
              </div>
            </div>

            {/* Step 4: Pembayaran via Midtrans */}
            <div className="relative">
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                  isStep4Done
                    ? 'bg-emerald-600 text-white'
                    : status === 'APPROVED'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isStep4Done ? <CheckCircle2 className="w-4 h-4" /> : '4'}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">
                    4. Konfirmasi Pembayaran Midtrans Snap
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isStep4Done ? 'LUNAS' : status === 'APPROVED' ? 'Menunggu Pembayaran' : '-'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Mendukung QRIS instan, Virtual Account (BCA, Mandiri, BNI, BRI), dan E-Wallet (GoPay, ShopeePay).
                </p>

                {status === 'APPROVED' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Buka Jendela Pembayaran Midtrans</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 5: Check-in */}
            <div className="relative">
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                  isStep5Done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                <KeyRound className="w-3 h-3" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">5. Check-in & Serah Terima Kunci</h3>
                <p className="text-xs text-slate-600">
                  Tanggal rencana masuk:{' '}
                  <strong className="text-slate-900">{reservation.checkInDate}</strong>. Kunci kamar fisik dan kartu akses diserahkan langsung oleh pengelola di lokasi Kos Omi Sungai Bangek, Padang.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Room & Invoice Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Room Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rincian Kamar Pilihan
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[hsl(217,91%,45%)] font-extrabold text-sm flex items-center justify-center border border-blue-100">
                {reservation.roomCode}
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">
                  Kamar {reservation.roomCode}
                </div>
                <div className="text-[11px] text-slate-500">
                  Durasi Sewa: {reservation.durationMonths} Bulan
                </div>
              </div>
            </div>

            <div className="text-xs space-y-2 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Sewa Bulan Pertama:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(reservation.monthlyPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Jaminan (1x):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(reservation.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span className="text-slate-900">Total Pembayaran Awal:</span>
                <span className="text-[hsl(217,91%,45%)] tabular-nums">
                  {formatRupiah(reservation.totalInitialPayment)}
                </span>
              </div>
            </div>
          </div>

          {/* Applicant Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Data Calon Penghuni
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Nama Lengkap:</span>
                <span className="font-semibold text-slate-900">{reservation.userName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Nomor WhatsApp:</span>
                <span className="font-semibold text-slate-900">{reservation.userPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Alamat Email:</span>
                <span className="font-semibold text-slate-900">{reservation.userEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Kontak Darurat:</span>
                <span className="font-semibold text-slate-900">
                  {reservation.emergencyContactName} ({reservation.emergencyContactRelation}) -{' '}
                  {reservation.emergencyContactPhone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Integration */}
      {invoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          invoice={invoice}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={(paidInvoice) => {
            setReservation((prev) => ({
              ...prev,
              status: 'PAID',
              payment: paidInvoice,
            }));
            setIsPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
