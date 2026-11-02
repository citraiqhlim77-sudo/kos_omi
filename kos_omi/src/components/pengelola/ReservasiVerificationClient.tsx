'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { approveReservationAction, rejectReservationAction } from '@/actions/reservations';
import { formatRupiah } from '@/data/rooms';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Briefcase,
  BedDouble,
  Maximize2,
  X,
  FileText,
  Calendar,
} from 'lucide-react';

interface ReservasiVerificationClientProps {
  initialReservation: Reservation;
}

export const ReservasiVerificationClient: React.FC<ReservasiVerificationClientProps> = ({
  initialReservation,
}) => {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation>(initialReservation);

  // Modals state
  const [isKtpZoomOpen, setIsKtpZoomOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Form states inside dialogs
  const [adminNotes, setAdminNotes] = useState('Dokumen KTP dan data calon penghuni telah terverifikasi lengkap.');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const status = reservation.status;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await approveReservationAction(reservation.code, adminNotes);
    if (res.success && res.data) {
      setReservation(res.data);
      setIsApproveDialogOpen(false);
      showToast('Reservasi berhasil disetujui! Invoice pembayaran 24 jam telah diterbitkan.');
    } else {
      setErrorMessage(res.message);
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      setErrorMessage('Alasan penolakan wajib diisi minimal 10 karakter sesuai SOP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await rejectReservationAction(reservation.code, rejectionReason);
    if (res.success && res.data) {
      setReservation(res.data);
      setIsRejectDialogOpen(false);
      showToast('Reservasi telah ditolak. Alasan resmi telah dicatat.');
    } else {
      setErrorMessage(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
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

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <NextLink
            href="/pengelola/reservasi"
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
                  ? 'Menunggu Verifikasi KTP'
                  : status === 'APPROVED'
                  ? 'Disetujui (Menunggu Bayar)'
                  : status === 'PAID'
                  ? 'Lunas Terverifikasi'
                  : status === 'REJECTED'
                  ? 'Reservasi Ditolak'
                  : status}
              </span>
            </div>
            <h1 className="text-xl font-heading font-extrabold text-slate-900 mt-1">
              Verifikasi Calon Penghuni: {reservation.userName}
            </h1>
          </div>
        </div>

        {/* Verification Action Buttons */}
        {status === 'PENDING_REVIEW' && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsRejectDialogOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Tolak Pengajuan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsApproveDialogOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Setujui Reservasi</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Applicant & KTP Document */}
        <div className="lg:col-span-2 space-y-6">
          {/* KTP Document Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dokumen KTP Calon Penghuni</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Periksa kecocokan nama, foto wajah, dan nomor identitas kependudukan 16 digit
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsKtpZoomOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Perbesar Foto</span>
              </button>
            </div>

            {/* Photo preview container */}
            <div
              onClick={() => setIsKtpZoomOpen(true)}
              className="relative aspect-[16/10] max-h-80 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-zoom-in group"
            >
              <Image
                src={reservation.ktpUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'}
                alt={`KTP ${reservation.userName}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-bold transition-opacity">
                  Klik untuk melihat ukuran penuh
                </span>
              </div>
            </div>

            {/* NIK and identity match strip */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Nomor NIK KTP Terdaftar:</span>
                <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                  {reservation.userNik}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Nama Sesuai KTP:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {reservation.userName}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Biodata Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Biodata Calon Penghuni & Kontak Darurat</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-500">Nomor WhatsApp Aktif:</span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{reservation.userPhone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-500">Alamat Email:</span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{reservation.userEmail}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-500">Pekerjaan / Instansi:</span>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                  <span>{reservation.userOccupation || 'Mahasiswa / Karyawan'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-500">Kontak Darurat (Wali):</span>
                <div className="font-bold text-slate-900 text-sm">
                  {reservation.emergencyContactName} ({reservation.emergencyContactRelation})
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {reservation.emergencyContactPhone}
                </div>
              </div>
            </div>

            {/* Rejection / Approval Notes Box */}
            {reservation.adminNotes && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold">Catatan Verifikasi Pengelola:</span>
                <p>{reservation.adminNotes}</p>
              </div>
            )}

            {reservation.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-bold">Alasan Penolakan:</span>
                <p>{reservation.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Room & Booking Terms */}
        <div className="space-y-6 lg:col-span-1">
          {/* Room Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Kamar yang Diajukan
            </h3>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(217,91%,45%)] text-white font-extrabold text-sm flex items-center justify-center">
                {reservation.roomCode}
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">
                  Kamar {reservation.roomCode}
                </div>
                <NextLink
                  href={`/pengelola/kamar/${reservation.roomCode}`}
                  className="text-[11px] text-[hsl(217,91%,45%)] font-bold hover:underline"
                >
                  Lihat Riwayat Kamar →
                </NextLink>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Rencana Masuk:</span>
                <span className="font-bold text-slate-900">{reservation.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Durasi Sewa:</span>
                <span className="font-bold text-slate-900">{reservation.durationMonths} Bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarif Sewa Bulanan:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(reservation.monthlyPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deposit Jaminan:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(reservation.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                <span className="text-slate-900">Total Invoice Booking:</span>
                <span className="text-[hsl(217,91%,45%)] tabular-nums">
                  {formatRupiah(reservation.totalInitialPayment)}
                </span>
              </div>
            </div>
          </div>

          {/* SOP Compliance Information */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Ketentuan SOP Verifikasi</span>
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>Persetujuan akan mengunci kamar menjadi <strong>DIPESAN</strong>.</li>
              <li>Invoice Midtrans Snap otomatis berlaku selama 24 jam.</li>
              <li>Jika tidak dibayar dalam 24 jam, sistem otomatis mengembalikan kamar ke <strong>TERSEDIA</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL 1: KTP Zoom Fullscreen */}
      {isKtpZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <div className="flex items-center justify-between p-3 text-white border-b border-slate-800">
              <div className="text-xs font-bold">
                KTP Calon Penghuni: {reservation.userName} ({reservation.userNik})
              </div>
              <button
                type="button"
                onClick={() => setIsKtpZoomOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-[16/10] w-full max-h-[75vh]">
              <Image
                src={reservation.ktpUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'}
                alt={`KTP ${reservation.userName}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Approve Confirmation Dialog */}
      {isApproveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Setujui Reservasi {reservation.code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsApproveDialogOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan menyetujui, Kamar <strong>{reservation.roomCode}</strong> akan dikunci statusnya menjadi <strong>DIPESAN</strong> dan sistem akan menerbitkan invoice pembayaran senilai <strong>{formatRupiah(reservation.totalInitialPayment)}</strong> untuk calon penghuni dengan batas waktu 24 jam.
            </p>

            <div className="space-y-1">
              <label htmlFor="adminNotes" className="block text-xs font-bold text-slate-700">
                Catatan Persetujuan:
              </label>
              <textarea
                id="adminNotes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApproveDialogOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {isLoading ? 'Memproses...' : 'Konfirmasi & Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reject Confirmation Dialog (Mandatory 10 chars reason) */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Tolak Reservasi {reservation.code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Sesuai SOP Kos Omi Bab 5.C, penolakan pengajuan reservasi <strong>wajib menyertakan alasan penolakan tertulis</strong> minimal 10 karakter yang akan ditampilkan langsung ke calon penghuni.
            </p>

            <div className="space-y-1">
              <label htmlFor="rejectionReason" className="block text-xs font-bold text-slate-700">
                Alasan Penolakan Resmi (Wajib Minimal 10 Karakter): <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Foto KTP buram dan nomor NIK tidak terbaca dengan jelas. Mohon ajukan kembali dengan foto KTP yang lebih terang."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                {rejectionReason.length}/10 karakter minimal
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isLoading || rejectionReason.trim().length < 10}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Menolak...' : 'Kirim Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
