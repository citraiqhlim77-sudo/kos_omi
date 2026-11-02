'use client';

import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { Room, RoomStatus, RoomType, ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { RoomStatusModal } from './RoomStatusModal';
import { RoomEditModal } from './RoomEditModal';
import {
  Search,
  Filter,
  Edit,
  Wrench,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Home,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

interface KamarManagerClientProps {
  initialRooms: Room[];
}

export const KamarManagerClient: React.FC<KamarManagerClientProps> = ({ initialRooms }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // Filters
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('code-asc');

  // Modals state
  const [statusModalRoom, setStatusModalRoom] = useState<Room | null>(null);
  const [editModalRoom, setEditModalRoom] = useState<Room | null>(null);

  // Success Notification banner
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRoomUpdated = (updated: Room) => {
    setRooms((prev) => prev.map((r) => (r.code === updated.code ? updated : r)));
    showToast(`Data kamar ${updated.code} berhasil diperbarui di server database.`);
  };

  // Filtered and sorted rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        if (selectedFloor !== 'ALL' && room.floor !== Number(selectedFloor)) return false;
        if (selectedType !== 'ALL' && room.type !== selectedType) return false;
        if (selectedStatus !== 'ALL' && room.status !== selectedStatus) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchCode = room.code.toLowerCase().includes(q);
          const matchType = ROOM_TYPE_LABELS[room.type].toLowerCase().includes(q);
          const matchDesc = room.description.toLowerCase().includes(q);
          return matchCode || matchType || matchDesc;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.monthlyPrice - b.monthlyPrice;
        if (sortBy === 'price-desc') return b.monthlyPrice - a.monthlyPrice;
        if (sortBy === 'floor-asc') return a.floor - b.floor || a.code.localeCompare(b.code);
        return a.code.localeCompare(b.code);
      });
  }, [rooms, selectedFloor, selectedType, selectedStatus, searchQuery, sortBy]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'TERSEDIA').length,
      booked: rooms.filter((r) => r.status === 'DIPESAN').length,
      occupied: rooms.filter((r) => r.status === 'TERISI').length,
      maintenance: rooms.filter((r) => r.status === 'NONAKTIF').length,
    };
  }, [rooms]);

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'TERSEDIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Tersedia
          </span>
        );
      case 'DIPESAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Dipesan
          </span>
        );
      case 'TERISI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Terisi
          </span>
        );
      case 'NONAKTIF':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Perawatan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-time Status Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] block font-medium opacity-80">Total 67 Kamar</span>
          <span className="text-xl font-heading font-extrabold">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('TERSEDIA')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'TERSEDIA'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-emerald-600 group-hover:text-emerald-700">
            Tersedia
          </span>
          <span className="text-xl font-heading font-extrabold text-emerald-700">{stats.available}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('DIPESAN')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'DIPESAN'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-amber-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-amber-600">Dipesan</span>
          <span className="text-xl font-heading font-extrabold text-amber-700">{stats.booked}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('TERISI')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'TERISI'
              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-blue-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-blue-600">Terisi</span>
          <span className="text-xl font-heading font-extrabold text-blue-700">{stats.occupied}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('NONAKTIF')}
          className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            selectedStatus === 'NONAKTIF'
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:bg-rose-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-rose-600">Perawatan</span>
          <span className="text-xl font-heading font-extrabold text-rose-700">{stats.maintenance}</span>
        </button>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode kamar (misal: A-101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[hsl(217,91%,45%)]"
            />
          </div>

          {/* Filter Lantai */}
          <div className="sm:col-span-2">
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[hsl(217,91%,45%)]"
            >
              <option value="ALL">Semua Lantai (1-5)</option>
              <option value="1">Lantai 1 (A-101 s/d A-116)</option>
              <option value="2">Lantai 2 (B-201 s/d B-216)</option>
              <option value="3">Lantai 3 (C-301 s/d C-316)</option>
              <option value="4">Lantai 4 (D-401 s/d D-416)</option>
              <option value="5">Lantai 5 (E-501 s/d E-503)</option>
            </select>
          </div>

          {/* Filter Tipe */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[hsl(217,91%,45%)]"
            >
              <option value="ALL">Semua Tipe Kamar</option>
              <option value="STANDAR_NON_AC">Standar Non-AC (Rp 750rb)</option>
              <option value="STANDAR_AC">Standar AC (Rp 1,1jt)</option>
              <option value="DELUXE_AC">Deluxe AC KM Dalam (Rp 1,45jt)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[hsl(217,91%,45%)]"
            >
              <option value="code-asc">Urutkan Kode (A-101 ke E-503)</option>
              <option value="floor-asc">Urutkan Posisi Lantai</option>
              <option value="price-asc">Harga Sewa Termurah</option>
              <option value="price-desc">Harga Sewa Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Results summary count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredRooms.length}</strong> dari 67 kamar
          </span>
          {(selectedFloor !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedFloor('ALL');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="text-[hsl(217,91%,45%)] font-bold hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP TABLE VIEW (hidden on mobile, visible on sm and up) */}
      {/* ========================================================= */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Kamar</th>
                <th className="py-3 px-4">Lantai</th>
                <th className="py-3 px-4">Tipe & Spesifikasi</th>
                <th className="py-3 px-4">Harga / Bulan</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Pengelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Tidak ada kamar yang cocok dengan kriteria filter aktif.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[hsl(217,91%,45%)] font-extrabold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                          {room.code}
                        </div>
                        <NextLink
                          href={`/pengelola/kamar/${room.code}`}
                          className="hover:text-[hsl(217,91%,45%)] hover:underline"
                        >
                          {room.code}
                        </NextLink>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">Lantai {room.floor}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{ROOM_TYPE_LABELS[room.type]}</div>
                      <div className="text-[11px] text-slate-500">{room.areaSqm} m² · {room.facilities.length} fasilitas</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                      {formatRupiah(room.monthlyPrice)}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600 tabular-nums">
                      {formatRupiah(room.depositAmount)}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(room.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStatusModalRoom(room)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ubah status kamar (SOP transisi)"
                        >
                          <Wrench className="w-3 h-3 text-slate-500" />
                          <span>Status</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditModalRoom(room)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit tarif dan fasilitas kamar"
                        >
                          <Edit className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <NextLink
                          href={`/pengelola/kamar/${room.code}`}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[hsl(217,91%,45%)] hover:bg-blue-50 transition-colors"
                          title="Lihat detail lengkap & riwayat penghuni"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </NextLink>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE CARDS VIEW (visible on mobile screens only) */}
      {/* ========================================================= */}
      <div className="sm:hidden grid grid-cols-1 gap-3">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            Tidak ada kamar yang cocok dengan kriteria filter aktif.
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.code}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[hsl(217,91%,45%)] font-extrabold text-sm flex items-center justify-center border border-blue-100">
                    {room.code}
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-slate-900 text-base">
                      Kamar {room.code}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Lantai {room.floor} · {ROOM_TYPE_LABELS[room.type]}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(room.status)}</div>
              </div>

              {/* Price & specs strip */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Tarif Sewa</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatRupiah(room.monthlyPrice)}/bln
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Luas & Deposit</span>
                  <span className="font-medium text-slate-700">
                    {room.areaSqm} m² · Dep. {formatRupiah(room.depositAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalRoom(room)}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  <span>Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditModalRoom(room)}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>

                <NextLink
                  href={`/pengelola/kamar/${room.code}`}
                  className="py-2 px-2.5 rounded-xl bg-[hsl(217,91%,45%)] text-white font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <span>Riwayat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <RoomStatusModal
        isOpen={Boolean(statusModalRoom)}
        room={statusModalRoom}
        onClose={() => setStatusModalRoom(null)}
        onSuccess={handleRoomUpdated}
      />

      <RoomEditModal
        isOpen={Boolean(editModalRoom)}
        room={editModalRoom}
        onClose={() => setEditModalRoom(null)}
        onSuccess={handleRoomUpdated}
      />
    </div>
  );
};
