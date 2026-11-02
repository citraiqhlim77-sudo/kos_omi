'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { Room, RoomStatus, ROOM_STATUS_LABELS } from '@/types/room';
import { updateRoomStatusAction } from '@/actions/rooms';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  BedDouble,
  ArrowRight,
  LogOut,
  CalendarCheck,
} from 'lucide-react';

interface RoomStatusModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: (updatedRoom: Room) => void;
}

export const RoomStatusModal: React.FC<RoomStatusModalProps> = ({
  isOpen,
  room,
  onClose,
  onSuccess,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !room) return null;

  const currentStatus = room.status;

  // Tentukan apakah status dapat diubah secara manual
  const canChangeManually = currentStatus === 'TERSEDIA' || currentStatus === 'NONAKTIF';

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setErrorMessage('Pilih status baru yang diinginkan.');
      return;
    }

    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await updateRoomStatusAction(room.code, selectedStatus, reason);

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setErrorMessage(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900">Ubah Status Kamar {room.code}</h2>
            <p className="text-xs text-slate-500">Lantai {room.floor} · Aturan Transisi SOP PRD</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Status Kamar Saat Ini:</span>
          <span
            className={`font-bold px-2.5 py-1 rounded-md text-xs ${
              currentStatus === 'TERSEDIA'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentStatus === 'TERISI'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : currentStatus === 'DIPESAN'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {ROOM_STATUS_LABELS[currentStatus]}
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Conditional Content based on Transition Rules */}
        {!canChangeManually ? (
          <div className="space-y-4">
            {currentStatus === 'TERISI' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Kamar Sedang Terisi Penuh</span>
                </div>
                <p>
                  Sesuai aturan SOP PRD Bab 5.B, kamar berstatus <strong>TERISI</strong> tidak dapat diubah langsung ke <strong>TERSEDIA</strong> secara manual tanpa melalui proses check-out resmi untuk memastikan tagihan sewa dan pengembalian deposit telah terselesaikan.
                </p>
                <div className="pt-2">
                  <NextLink
                    href="/pengelola/checkout"
                    className="inline-flex items-center gap-1.5 font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    <span>Buka Menu Proses Check-out</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              </div>
            )}

            {currentStatus === 'DIPESAN' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Kamar Sedang Dipesan</span>
                </div>
                <p>
                  Kamar ini sedang dikunci oleh sistem karena ada pengajuan reservasi yang telah disetujui (dalam batas waktu pembayaran 24 jam). Untuk membatalkan, lakukan pembatalan reservasi melalui modul Verifikasi Reservasi.
                </p>
                <div className="pt-2">
                  <NextLink
                    href="/pengelola/reservasi"
                    className="inline-flex items-center gap-1.5 font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    <span>Tinjau Daftar Reservasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Transisi Status Valid:
              </label>

              {currentStatus === 'TERSEDIA' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('NONAKTIF')}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      selectedStatus === 'NONAKTIF'
                        ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        NONAKTIF (Perawatan / Renovasi)
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Kamar sementara tidak dapat dipesan oleh calon penghuni di katalog publik.
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {currentStatus === 'NONAKTIF' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('TERSEDIA')}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      selectedStatus === 'TERSEDIA'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        TERSEDIA (Buka Reservasi)
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Kamar telah selesai diperbaiki dan siap menerima pengajuan sewa baru di katalog.
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Optional Reason Input */}
            <div className="space-y-1.5">
              <label htmlFor="reason" className="block text-xs font-bold text-slate-700">
                Catatan Pengelola / Alasan Perubahan:
              </label>
              <textarea
                id="reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Perbaikan unit AC Daikin dan pengecatan dinding kamar."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedStatus || isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Status Baru'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
