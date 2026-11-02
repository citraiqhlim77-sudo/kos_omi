'use client';

import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { formatRupiah, ALL_ROOMS } from '@/data/rooms';
import { Room } from '@/types/room';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Search,
  RotateCcw,
  ArrowRight,
  Check,
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
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sourceRooms = useMemo(() => {
    if (!initialRooms || initialRooms.length === 0 || initialRooms.some((r) => r.code.includes('-'))) {
      return ALL_ROOMS;
    }
    return initialRooms;
  }, [initialRooms]);

  const filteredRooms = useMemo(() => {
    return sourceRooms
      .filter((room) => {
        if (selectedFloor !== 'ALL' && room.floor !== parseInt(selectedFloor, 10)) {
          return false;
        }
        if (selectedStatus !== 'ALL' && room.status !== selectedStatus) {
          return false;
        }
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim().replace(/^(kamar\s*)?(no\.?\s*)?/i, '');
          const matchesCode = room.code.toLowerCase().includes(q);
          const matchesFloor = `lantai ${room.floor}`.includes(searchQuery.toLowerCase().trim());
          if (!matchesCode && !matchesFloor) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.floor - b.floor || (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
  }, [sourceRooms, selectedFloor, selectedStatus, searchQuery]);

  const handleReset = () => {
    setSelectedFloor('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* HEADER RINGKAS & RAPI */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
              Katalog Kamar Kos Omi
            </h1>
            <p className="text-zinc-600 text-sm">
              Lantai 1 (No. 1–33) & Lantai 2 (No. 34–67) • Rp 5.000.000 / semester (isi 2 orang).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-zinc-200 shrink-0 text-xs">
            <div className="px-2.5 text-center border-r border-zinc-100">
              <span className="block text-zinc-500">Tersedia</span>
              <span className="text-sm font-extrabold text-emerald-600 tabular-nums">
                {initialStats.available}
              </span>
            </div>
            <div className="px-2.5 text-center border-r border-zinc-100">
              <span className="block text-zinc-500">Dipesan</span>
              <span className="text-sm font-extrabold text-amber-600 tabular-nums">
                {initialStats.booked}
              </span>
            </div>
            <div className="px-2.5 text-center border-r border-zinc-100">
              <span className="block text-zinc-500">Terisi</span>
              <span className="text-sm font-extrabold text-zinc-700 tabular-nums">
                {initialStats.occupied}
              </span>
            </div>
            <div className="px-2.5 text-center">
              <span className="block text-zinc-500">Total</span>
              <span className="text-sm font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                {initialStats.total}
              </span>
            </div>
          </div>
        </div>

        {/* FILTER SIMPLE */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Cari nomor kamar (1 – 67)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-zinc-200 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>

            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-[hsl(186,72%,24%)]"
            >
              <option value="ALL">Semua Lantai (No. 1 – 67)</option>
              <option value="1">Lantai 1 (Kamar No. 1 – 33)</option>
              <option value="2">Lantai 2 (Kamar No. 34 – 67)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-zinc-200 bg-white focus:outline-none focus:border-[hsl(186,72%,24%)]"
            >
              <option value="ALL">Semua Status Kamar</option>
              <option value="TERSEDIA">Tersedia</option>
              <option value="DIPESAN">Dipesan</option>
              <option value="TERISI">Terisi</option>
              <option value="NONAKTIF">Perawatan</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500">
            <span>
              Menampilkan <strong>{filteredRooms.length}</strong> dari <strong>{sourceRooms.length}</strong> kamar
            </span>
            {(selectedFloor !== 'ALL' || selectedStatus !== 'ALL' || searchQuery !== '') && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[hsl(186,72%,24%)] hover:underline font-semibold"
              >
                <RotateCcw size={12} />
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* GRID KATALOG SIMPLE & RAPI */}
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-3">
            <p className="font-heading font-bold text-base text-zinc-800">
              Kamar tidak ditemukan
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 bg-[hsl(186,72%,24%)] text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <RotateCcw size={13} />
              Tampilkan Semua Kamar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => {
              const isAvailable = room.status === 'TERSEDIA';

              return (
                <Card
                  key={room.id}
                  className="overflow-hidden flex flex-col justify-between group hover:border-zinc-300 transition-all bg-white"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                      <Image
                        src={room.photoUrls[0]}
                        alt={`Kamar No. ${room.code}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <StatusBadge status={room.status} size="sm" />
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="bg-white/95 text-zinc-900 text-xs font-extrabold px-2.5 py-0.5 rounded border border-zinc-200">
                          No. {room.code}
                        </span>
                        <span className="bg-zinc-900/85 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                          Lantai {room.floor}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h2 className="font-heading font-extrabold text-base text-zinc-900">
                          Kamar No. {room.code}
                        </h2>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          2 Orang
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-600">
                        <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded">
                          <Check size={11} className="text-[hsl(186,72%,24%)]" /> KM Dalam
                        </span>
                        <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded">
                          <Check size={11} className="text-[hsl(186,72%,24%)]" /> Kasur & Lemari
                        </span>
                        <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200/80 px-2 py-0.5 rounded">
                          <Check size={11} className="text-[hsl(186,72%,24%)]" /> Wi-Fi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-heading font-extrabold text-sm text-[hsl(186,72%,24%)] tabular-nums">
                        {formatRupiah(room.monthlyPrice)}
                        <span className="text-[11px] text-zinc-400 font-normal"> /smt</span>
                      </p>
                    </div>

                    <NextLink
                      href={isAvailable ? `/reservasi/${room.code}` : `/kamar/${room.code}`}
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        isAvailable
                          ? 'bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white'
                          : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {isAvailable ? 'Pesan' : 'Detail'}
                      <ArrowRight size={12} />
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
