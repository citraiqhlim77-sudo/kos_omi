'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Room, RoomStatus, TenantHistoryItem, ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { RoomStatusModal } from './RoomStatusModal';
import { RoomEditModal } from './RoomEditModal';
import {
  ArrowLeft,
  Wrench,
  Edit,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Maximize2,
  Tag,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface RoomDetailClientProps {
  initialRoom: Room;
  initialHistories: TenantHistoryItem[];
}

export const RoomDetailClient: React.FC<RoomDetailClientProps> = ({
  initialRoom,
  initialHistories,
}) => {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [histories, setHistories] = useState<TenantHistoryItem[]>(initialHistories);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleUpdated = (updated: Room) => {
    setRoom(updated);
    setSuccessToast(`Data kamar ${updated.code} berhasil diperbarui di database.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'TERSEDIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Tersedia
          </span>
        );
      case 'DIPESAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Sedang Dipesan
          </span>
        );
      case 'TERISI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Terisi Penuh
          </span>
        );
      case 'NONAKTIF':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Dalam Perawatan
          </span>
        );
    }
  };

  const getTenancyBadge = (status: TenantHistoryItem['status']) => {
    switch (status) {
      case 'AKTIF':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Huni Aktif
          </span>
        );
      case 'RESERVASI':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Menunggu Bayar
          </span>
        );
      case 'SELESAI':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            Selesai Sewa
          </span>
        );
    }
  };

  const getDepositBadge = (status: TenantHistoryItem['depositStatus']) => {
    switch (status) {
      case 'DITAHAN':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Ditahan (Aktif)
          </span>
        );
      case 'DIKEMBALIKAN':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Dikembalikan 100%
          </span>
        );
      case 'MENUNGGU_PEMERIKSAAN':
      default:
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Menunggu Lunas
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <NextLink
            href="/pengelola/kamar"
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
            title="Kembali ke daftar kamar"
          >
            <ArrowLeft className="w-4 h-4" />
          </NextLink>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900">
                Kamar {room.code}
              </h1>
              {getStatusBadge(room.status)}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Lantai {room.floor} · {ROOM_TYPE_LABELS[room.type]} · Kos Omi Sungai Bangek, Padang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ubah Status</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Tarif & Fasilitas</span>
          </button>
        </div>
      </div>

      {/* Room Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo & Specs */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Photo Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="relative h-56 w-full bg-zinc-100">
              {room.photoUrls && room.photoUrls[0] ? (
                <Image
                  src={room.photoUrls[0]}
                  alt={`Kamar ${room.code}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                  Foto Kamar
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="text-xs font-bold text-zinc-900">
                Ringkasan Tarif & Ukuran
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-500 block">Tarif Sewa</span>
                  <span className="font-extrabold text-zinc-900 text-sm tabular-nums">
                    {formatRupiah(room.monthlyPrice)}
                  </span>
                  <span className="text-[10px] text-zinc-400">/bulan</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-500 block">Deposit Jaminan</span>
                  <span className="font-extrabold text-zinc-900 text-sm tabular-nums">
                    {formatRupiah(room.depositAmount)}
                  </span>
                  <span className="text-[10px] text-zinc-400">1x sewa</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-500 block">Luas Kamar</span>
                  <span className="font-bold text-zinc-900 text-sm">
                    {room.areaSqm} m²
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Ukuran Bersih</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-500 block">Posisi Bangunan</span>
                  <span className="font-bold text-zinc-900 text-sm">
                    Lantai {room.floor}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Gedung Utama</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-700">
              Deskripsi & Kondisi Kamar
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {room.description || 'Kamar kos nyaman dengan sirkulasi udara optimal dan pencahayaan alami.'}
            </p>
          </div>
        </div>

        {/* Right Column: Facilities & Tenant History */}
        <div className="space-y-6 lg:col-span-2">
          {/* Facilities Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-700">
                Fasilitas & Inventaris Kamar ({room.facilities.length})
              </h2>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Sesuai Standar Kos Omi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.facilities.map((fac) => (
                <div
                  key={fac}
                  className="p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 text-xs font-medium text-zinc-800 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tenant History Section */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">
                  Riwayat Penghuni & Tenancy Kamar {room.code}
                </h2>
                <p className="text-xs text-zinc-500">
                  Pencatatan riwayat sewa masa lalu dan masa kini untuk keperluan audit operasional
                </p>
              </div>
              <span className="text-xs text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md font-semibold">
                {histories.length} Catatan
              </span>
            </div>

            {histories.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-50 rounded-xl border border-zinc-100">
                Belum ada riwayat penghuni tercatat untuk kamar ini.
              </div>
            ) : (
              <div className="space-y-3">
                {histories.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors space-y-3 bg-white"
                  >
                    {/* Top Row: Name, Status, Dates */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 text-sm">{item.tenantName}</div>
                          <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                            <span>{item.tenantPhone}</span>
                            <span>•</span>
                            <span>{item.tenantEmail}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(room.status)}
                        {getTenancyBadge(item.status)}
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 block">Periode Sewa</span>
                        <span className="font-semibold text-zinc-800">
                          {item.startDate} s/d {item.endDate || 'Sekarang'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 block">Tarif Sewa Saat Itu</span>
                        <span className="font-bold text-zinc-900 tabular-nums">
                          {formatRupiah(item.monthlyRent)}/bln
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-0.5">
                        <span className="text-[10px] text-zinc-500 block">Status Deposit</span>
                        <div>{getDepositBadge(item.depositStatus)}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="text-[11px] text-zinc-600 bg-zinc-50/60 p-2.5 rounded-lg border border-zinc-100 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{item.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RoomStatusModal
        isOpen={isStatusModalOpen}
        room={room}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={handleUpdated}
      />

      <RoomEditModal
        isOpen={isEditModalOpen}
        room={room}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleUpdated}
      />
    </div>
  );
};
