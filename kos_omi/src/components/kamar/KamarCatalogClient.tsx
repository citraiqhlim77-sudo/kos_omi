'use client';

import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { formatRupiah } from '@/data/rooms';
import { Room, RoomType, RoomStatus, ROOM_TYPE_LABELS } from '@/types/room';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Search,
  Filter,
  RotateCcw,
  Bed,
  Maximize2,
  Building,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface KamarCatalogClientProps {
  initialRooms: Room[];
  initialStats: {
    total: number;
    available: number;
    booked: number;
    occupied: number;
    maintenance: number;
  };
}

export const KamarCatalogClient: React.FC<KamarCatalogClientProps> = ({
  initialRooms,
  initialStats,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('code-asc');

  // Filter dan sorting data kamar
  const filteredRooms = useMemo(() => {
    return initialRooms
      .filter((room) => {
        // Filter Lantai
        if (selectedFloor !== 'ALL' && room.floor !== parseInt(selectedFloor, 10)) {
          return false;
        }
        // Filter Tipe
        if (selectedType !== 'ALL' && room.type !== selectedType) {
          return false;
        }
        // Filter Status
        if (selectedStatus !== 'ALL' && room.status !== selectedStatus) {
          return false;
        }
        // Pencarian
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchesCode = room.code.toLowerCase().includes(q);
          const matchesType = ROOM_TYPE_LABELS[room.type].toLowerCase().includes(q);
          const matchesFloor = `lantai ${room.floor}`.includes(q);
          if (!matchesCode && !matchesType && !matchesFloor) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.monthlyPrice - b.monthlyPrice;
        if (sortBy === 'price-desc') return b.monthlyPrice - a.monthlyPrice;
        if (sortBy === 'floor-asc') return a.floor - b.floor || a.code.localeCompare(b.code);
        return a.code.localeCompare(b.code);
      });
  }, [initialRooms, selectedFloor, selectedType, selectedStatus, searchQuery, sortBy]);

  const handleReset = () => {
    setSelectedFloor('ALL');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setSortBy('code-asc');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HEADER HALAMAN */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
                Katalog 67 Kamar Kos Omi Sungai Bangek, Padang
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mt-2">
                Pantau ketersediaan kamar secara langsung di 5 lantai (dekat Kampus III UIN Imam Bonjol Padang). Seluruh data ketersediaan terhubung langsung dengan server database Kos Omi.
              </p>
            </div>

            {/* Counter Ringkasan Status */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-lg border border-[hsl(214,20%,90%)] shadow-sm shrink-0">
              <div className="px-3 py-1 text-center border-r border-slate-100">
                <span className="block text-xs text-slate-500 font-medium">Tersedia</span>
                <span className="text-base font-extrabold text-emerald-600 font-heading tabular-nums">
                  {initialStats.available}
                </span>
              </div>
              <div className="px-3 py-1 text-center border-r border-slate-100">
                <span className="block text-xs text-slate-500 font-medium">Dipesan</span>
                <span className="text-base font-extrabold text-amber-600 font-heading tabular-nums">
                  {initialStats.booked}
                </span>
              </div>
              <div className="px-3 py-1 text-center border-r border-slate-100">
                <span className="block text-xs text-slate-500 font-medium">Terisi</span>
                <span className="text-base font-extrabold text-slate-700 font-heading tabular-nums">
                  {initialStats.occupied}
                </span>
              </div>
              <div className="px-3 py-1 text-center">
                <span className="block text-xs text-slate-500 font-medium">Total</span>
                <span className="text-base font-extrabold text-[hsl(217,91%,45%)] font-heading tabular-nums">
                  {initialStats.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KONTROL FILTER & PENCARIAN */}
        <div className="bg-white p-5 rounded-xl border border-[hsl(214,20%,90%)] shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Pencarian Teks */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari kode kamar (mis: A-101)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[hsl(217,91%,45%)] focus:ring-1 focus:ring-[hsl(217,91%,45%)]"
              />
            </div>

            {/* 2. Filter Lantai */}
            <div>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value="ALL">Semua Lantai (1 - 5)</option>
                <option value="1">Lantai 1 (Kamar A-101 - A-116)</option>
                <option value="2">Lantai 2 (Kamar B-201 - B-216)</option>
                <option value="3">Lantai 3 (Kamar C-301 - C-316)</option>
                <option value="4">Lantai 4 (Kamar D-401 - D-416)</option>
                <option value="5">Lantai 5 (Kamar E-501 - E-503)</option>
              </select>
            </div>

            {/* 3. Filter Tipe Kamar */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value="ALL">Semua Tipe Kamar</option>
                <option value="STANDAR_NON_AC">Standar Non-AC</option>
                <option value="STANDAR_AC">Standar AC</option>
                <option value="DELUXE_AC">Deluxe AC (KM Dalam)</option>
              </select>
            </div>

            {/* 4. Filter Status */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value="ALL">Semua Status Kamar</option>
                <option value="TERSEDIA">Hanya Tersedia (Bisa Dipesan)</option>
                <option value="DIPESAN">Sedang Dipesan (Verifikasi / Bayar)</option>
                <option value="TERISI">Terisi Penuh</option>
                <option value="NONAKTIF">Perawatan / Maintenance</option>
              </select>
            </div>

            {/* 5. Urutkan */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value="code-asc">Urutkan: Kode Kamar (A-Z)</option>
                <option value="price-asc">Urutkan: Harga Terendah</option>
                <option value="price-desc">Urutkan: Harga Tertinggi</option>
                <option value="floor-asc">Urutkan: Lantai (1 ke 5)</option>
              </select>
            </div>
          </div>

          {/* Baris Keterangan Hasil & Tombol Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Menampilkan <strong>{filteredRooms.length}</strong> dari <strong>{initialRooms.length}</strong> kamar
            </span>
            {(selectedFloor !== 'ALL' ||
              selectedType !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              searchQuery !== '') && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[hsl(217,91%,45%)] hover:underline font-semibold"
              >
                <RotateCcw size={13} />
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* GRID DAFTAR KAMAR */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search size={24} />
            </div>
            <div className="space-y-1">
              <p className="font-heading font-bold text-slate-800 text-lg">Tidak Ada Kamar yang Sesuai</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Silakan coba sesuaikan kriteria filter atau kata kunci pencarian Anda untuk menemukan kamar lainnya.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-[hsl(217,91%,45%)] text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room, index) => {
              const isAvailable = room.status === 'TERSEDIA';
              const isPriority = index < 4; // LCP optimization: prioritas eager loading pada 4 kamar pertama di atas fold

              return (
                <Card
                  key={room.id}
                  className="overflow-hidden flex flex-col justify-between group hover:border-[hsl(217,91%,45%)] transition-colors"
                >
                  <div>
                    {/* Foto Kamar & Status */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <Image
                        src={room.photoUrls[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                        alt={`Kamar ${room.code} ${ROOM_TYPE_LABELS[room.type]}`}
                        fill
                        priority={isPriority}
                        loading={isPriority ? 'eager' : 'lazy'}
                        quality={80}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={room.status} size="sm" />
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                        Lantai {room.floor}
                      </div>
                    </div>

                    {/* Informasi Kamar */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h2 className="font-heading font-extrabold text-lg text-slate-900">
                            Kamar {room.code}
                          </h2>
                          <span className="text-xs font-medium text-slate-500">
                            {ROOM_TYPE_LABELS[room.type].split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {ROOM_TYPE_LABELS[room.type]}
                        </p>
                      </div>

                      {/* Detail Spesifikasi */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Maximize2 size={13} className="text-slate-400" />
                          <span>{room.areaSqm} m²</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bed size={13} className="text-slate-400" />
                          <span className="truncate">{room.bedType?.split(' ')[0] || 'Single Bed'}</span>
                        </div>
                      </div>

                      {/* Cuplikan Fasilitas */}
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-500">Fasilitas Utama:</p>
                        <ul className="text-xs text-slate-600 space-y-0.5 line-clamp-2">
                          {room.facilities.slice(0, 2).map((f, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 truncate">
                              <span className="w-1 h-1 rounded-full bg-[hsl(217,91%,45%)] shrink-0"></span>
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Footer Harga & Aksi */}
                  <div className="p-4 pt-0 mt-auto border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-500">Tarif Bulanan</p>
                      <p className="font-heading font-extrabold text-base text-[hsl(217,91%,45%)] tabular-nums">
                        {formatRupiah(room.monthlyPrice)}
                        <span className="text-[11px] text-slate-400 font-normal">/bln</span>
                      </p>
                    </div>

                    <NextLink
                      href={isAvailable ? `/reservasi/${room.code}` : `/kamar/${room.code}`}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                        isAvailable
                          ? 'bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white shadow-sm'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isAvailable ? 'Reservasi' : 'Lihat Detail'}
                      <ArrowRight size={13} />
                    </NextLink>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
