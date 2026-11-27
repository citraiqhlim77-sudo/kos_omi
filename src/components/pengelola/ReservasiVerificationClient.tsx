'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { approveReservationAction, rejectReservationAction } from '@/actions/reservations';
import { settlePaymentAction, resetPaymentToUnpaidAction } from '@/actions/payments';
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
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Form states inside dialogs
  const [adminNotes, setAdminNotes] = useState('Data calon penghuni dan jadwal reservasi telah diverifikasi lengkap.');
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

  const handleValidatePaymentByPengelola = async () => {
    const invCode = reservation.payment?.invoiceCode || `INV-${reservation.code.replace('RSV-', '')}`;
    const method = reservation.payment?.paymentMethod || 'DANA';
    setIsLoading(true);
    setErrorMessage(null);
    const res = await settlePaymentAction(invCode, method);
    setIsLoading(false);
    if (res.success) {
      setReservation((prev) => ({
        ...prev,
        status: 'PAID',
        payment: res.payment || prev.payment,
      }));
      showToast(
        `Pembayaran ${invCode} berhasil divalidasi LUNAS oleh Pengelola! Dana ${formatRupiah(reservation.totalInitialPayment)} telah ditambahkan ke Kas Keuangan.`
      );
      router.refresh();
    } else {
      setErrorMessage(res.message || 'Gagal memvalidasi pembayaran.');
    }
  };

  const handleRejectPaymentByPengelola = async () => {
    const invCode = reservation.payment?.invoiceCode || `INV-${reservation.code.replace('RSV-', '')}`;
    setIsLoading(true);
    setErrorMessage(null);
    const res = await resetPaymentToUnpaidAction(invCode);
    setIsLoading(false);
    if (res.success) {
      setReservation((prev) => ({
        ...prev,
        status: 'APPROVED',
        payment: res.payment || prev.payment,
      }));
      showToast(
        `Validasi pembayaran ditolak karena dana belum masuk. Status tagihan ${invCode} dikembalikan menjadi BELUM DIBAYAR.`
      );
      router.refresh();
    }
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <NextLink
            href="/pengelola/reservasi"
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-xs font-bold text-zinc-500">
                {reservation.code}
              </span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-xs ${status === 'APPROVED'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
              >
                {status === 'PENDING_REVIEW'
                  ? 'Menunggu Verifikasi'
                  : status === 'APPROVED'
                  ? 'Disetujui · Menunggu Bayar'
                  : status === 'PAID'
                  ? 'Lunas Terverifikasi'
                  : status === 'REJECTED'
                  ? 'Reservasi Ditolak'
                  : status}
              </span>
            </div>
            <h1 className="text-xl font-heading font-extrabold text-zinc-900 mt-1">
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Setujui Reservasi</span>
            </button>
          </div>
        )}

        {/* Tombol Validasi Pembayaran di Tangan Pengelola (Saat Status APPROVED) */}
        {status === 'APPROVED' && (
          <div className="flex flex-wrap items-center gap-2.5">
            {reservation.payment?.status === 'PENDING' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleRejectPaymentByPengelola}
                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak (Dana Belum Masuk)</span>
              </button>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={handleValidatePaymentByPengelola}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'Memvalidasi...'
                  : 'Validasi Pembayaran Lunas (Dana Sudah Masuk)'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Applicant Biodata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Biodata Card */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Biodata Calon Penghuni & Kontak Darurat</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 space-y-1">
                <span className="text-zinc-500">Nomor WhatsApp Aktif:</span>
                <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{reservation.userPhone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 space-y-1">
                <span className="text-zinc-500">Alamat Email:</span>
                <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate">{reservation.userEmail}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 space-y-1">
                <span className="text-zinc-500">Pekerjaan / Instansi:</span>
                <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{reservation.userOccupation || 'Mahasiswa / Karyawan'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 space-y-1">
                <span className="text-zinc-500">Kontak Darurat (Wali):</span>
                <div className="font-bold text-zinc-900 text-sm">
                  {reservation.emergencyContactName} ({reservation.emergencyContactRelation})
                </div>
                <div className="text-[11px] text-zinc-500 tabular-nums">
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
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
            <h3 className="text-xs font-bold text-zinc-700">
              Kamar yang Diajukan
            </h3>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(186,72%,24%)] text-white font-extrabold text-sm flex items-center justify-center">
                {reservation.roomCode}
              </div>
              <div>
                <div className="font-extrabold text-sm text-zinc-900">
                  Kamar {reservation.roomCode}
                </div>
                <NextLink
                  href={`/pengelola/kamar/${reservation.roomCode}`}
                  className="text-[11px] text-[hsl(186,72%,24%)] font-bold hover:underline"
                >
                  Lihat Riwayat Kamar →
                </NextLink>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Rencana Masuk:</span>
                <span className="font-bold text-zinc-900">{reservation.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Durasi Sewa:</span>
                <span className="font-bold text-zinc-900">1 Semester ({reservation.durationMonths} Bulan)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tarif Sewa Semester:</span>
                <span className="font-bold text-zinc-900 tabular-nums">
                  {formatRupiah(reservation.monthlyPrice)}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-sm">
                <span className="text-zinc-900">Total Invoice Booking:</span>
                <span className="text-[hsl(186,72%,24%)] tabular-nums">
                  {formatRupiah(reservation.monthlyPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* SOP Compliance Information */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3 text-xs text-zinc-600 leading-relaxed">
            <h3 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Ketentuan SOP Verifikasi</span>
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>Persetujuan akan mengunci kamar menjadi <strong>DIPESAN</strong>.</li>
              <li>Tagihan pembayaran Bank BRI berlaku selama 24 jam.</li>
              <li>Jika tidak dibayar dalam 24 jam, kamar kembali berstatus <strong>TERSEDIA</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL 2: Approve Confirmation Dialog */}
      {isApproveDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Setujui Reservasi {reservation.code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsApproveDialogOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <p className="text-xs text-zinc-600 leading-relaxed">
              Dengan menyetujui, Kamar <strong>{reservation.roomCode}</strong> akan dikunci statusnya menjadi <strong>DIPESAN</strong> dan sistem akan menerbitkan invoice pembayaran senilai <strong>{formatRupiah(reservation.totalInitialPayment)}</strong> untuk calon penghuni dengan batas waktu 24 jam.
            </p>

            <div className="space-y-1">
              <label htmlFor="adminNotes" className="block text-xs font-bold text-zinc-700">
                Catatan Persetujuan:
              </label>
              <textarea
                id="adminNotes"
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsApproveDialogOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Tolak Reservasi {reservation.code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <p className="text-xs text-zinc-600 leading-relaxed">
              Sesuai SOP Kos Omi Bab 5.C, penolakan pengajuan reservasi <strong>wajib menyertakan alasan penolakan tertulis</strong> minimal 10 karakter yang akan ditampilkan langsung ke calon penghuni.
            </p>

            <div className="space-y-1">
              <label htmlFor="rejectionReason" className="block text-xs font-bold text-zinc-700">
                Alasan Penolakan Resmi (Wajib Minimal 10 Karakter): <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Kamar sedang dalam perbaikan ringan. Silakan pilih kamar lain yang tersedia."
                className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-rose-500"
              />
              <span className="text-[10px] text-zinc-400 block text-right">
                {rejectionReason.length}/10 karakter minimal
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
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
