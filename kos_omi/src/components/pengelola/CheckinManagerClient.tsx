'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { CheckinCandidate } from '@/types/tenancy';
import { processCheckinAction } from '@/actions/tenancy';
import { formatRupiah } from '@/data/rooms';
import {
  LogIn,
  CheckCircle2,
  Calendar,
  BedDouble,
  User,
  Phone,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Eye,
  X,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CheckinManagerClientProps {
  initialCandidates: CheckinCandidate[];
}

export const CheckinManagerClient: React.FC<CheckinManagerClientProps> = ({
  initialCandidates,
}) => {
  const [candidates, setCandidates] = useState<CheckinCandidate[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<CheckinCandidate | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewKtpUrl, setPreviewKtpUrl] = useState<string | null>(null);

  const openConfirmModal = (candidate: CheckinCandidate) => {
    setSelectedCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCheckin = async () => {
    if (!selectedCandidate) return;

    setIsProcessing(true);
    setFeedback(null);

    const res = await processCheckinAction(selectedCandidate.id);

    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? { ...c, status: 'CHECKIN' } : c))
      );
      setIsConfirmModalOpen(false);
      setFeedback({
        type: 'success',
        message: res.message || `Check-in berhasil diproses untuk ${selectedCandidate.userName}!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal memproses check-in.',
      });
    }

    setIsProcessing(false);
  };

  const pendingCheckinCount = candidates.filter((c) => c.status === 'LUNAS').length;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Operasional Check-in
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Penerimaan & Check-in Penghuni
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar reservasi lunas yang tanggal masuknya sudah tiba. Proses check-in akan mengaktifkan tenancy dan mengubah status kamar menjadi Terisi.
          </p>
        </div>

        <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-left sm:text-right">
          <span className="text-[11px] text-slate-500 font-medium block">
            Antrean Siap Masuk
          </span>
          <span className="text-xl font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
            {pendingCheckinCount} Calon Penghuni
          </span>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-4">
        {candidates.map((cand) => {
          const isReady = cand.status === 'LUNAS';
          return (
            <div
              key={cand.id}
              className={`bg-white rounded-2xl border transition-all shadow-xs p-6 ${
                isReady
                  ? 'border-slate-200 hover:border-blue-300'
                  : 'border-emerald-200 bg-emerald-50/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* User & Room Details */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[hsl(217,91%,45%)] font-heading font-extrabold text-lg flex items-center justify-center border border-blue-100 shrink-0">
                    {cand.roomCode}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-extrabold text-slate-900 text-lg">
                        {cand.userName}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          isReady
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isReady ? '⏳ Siap Check-in' : '✓ Sudah Check-in (Aktif)'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Kode Reservasi: <strong className="font-mono text-slate-900">{cand.reservationCode}</strong></span>
                      <span>•</span>
                      <span>Kamar: <strong className="text-slate-900">{cand.roomCode}</strong> (Lantai {cand.roomFloor})</span>
                      <span>•</span>
                      <span>Durasi Sewa: <strong>{cand.durationMonths} Bulan</strong></span>
                      <span>•</span>
                      <span>Mulai Masuk: <strong>{cand.startDate}</strong></span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span>WhatsApp: <strong className="text-slate-700">{cand.userPhone}</strong></span>
                      <span>•</span>
                      <span>NIK: <span className="font-mono text-slate-700">{cand.userNik}</span></span>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setPreviewKtpUrl(cand.idCardUrl)}
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau KTP</span>
                      </button>
                    </div>

                    {cand.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1">
                        Catatan: "{cand.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Info & Action Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Total Booking & Deposit (Lunas)
                    </span>
                    <span className="text-lg font-heading font-extrabold text-slate-900 tabular-nums">
                      {formatRupiah(cand.totalPaid)}
                    </span>
                    <div className="text-[11px] text-emerald-700 flex items-center lg:justify-end gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      <span>{cand.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => openConfirmModal(cand)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Proses Check-in</span>
                      </button>
                    ) : (
                      <NextLink
                        href={`/pengelola/penghuni`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                      >
                        <span>Lihat Data Penghuni</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </NextLink>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRM CHECK-IN MODAL */}
      {isConfirmModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(217,91%,45%)] flex items-center justify-center font-bold text-sm">
                  KO
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Konfirmasi Operasional</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Proses Check-in Kamar
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <strong className="block text-sm">
                    Konfirmasi Check-in {selectedCandidate.userName}
                  </strong>
                  <p className="leading-relaxed">
                    Tindakan ini akan mengaktifkan masa sewa kamar <strong>{selectedCandidate.roomCode}</strong>, mengubah status kamar menjadi <strong>TERISI</strong>, dan memberikan akses portal penghuni aktif.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Penghuni:</span>
                  <span className="font-bold text-slate-900">{selectedCandidate.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kamar Tujuan:</span>
                  <span className="font-bold text-slate-900">Kamar {selectedCandidate.roomCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Check-in:</span>
                  <span className="font-bold text-slate-900">Hari ini ({new Date().toLocaleDateString('id-ID')})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uang Jaminan / Deposit:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(selectedCandidate.depositAmount)} (Lunas)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  disabled={isProcessing}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckin}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-colors cursor-pointer"
                >
                  {isProcessing ? 'Memproses Check-in...' : 'Ya, Selesaikan Check-in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KTP PREVIEW MODAL */}
      {previewKtpUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Dokumen KTP Calon Penghuni</span>
              </h4>
              <button
                type="button"
                onClick={() => setPreviewKtpUrl(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center min-h-64">
              <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-300">
                <Image
                  src={previewKtpUrl}
                  alt="KTP Calon Penghuni"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="p-3 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewKtpUrl(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
