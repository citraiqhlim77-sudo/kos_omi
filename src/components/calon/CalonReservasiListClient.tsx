'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { formatRupiah } from '@/data/rooms';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  User,
  BedDouble,
  CreditCard,
} from 'lucide-react';

interface CalonReservasiListClientProps {
  initialReservations: Reservation[];
}

export const CalonReservasiListClient: React.FC<CalonReservasiListClientProps> = ({
  initialReservations,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = initialReservations.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Menunggu Verifikasi
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Disetujui · Siap Bayar
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Lunas Terverifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ditolak
          </span>
        );
      case 'EXPIRED':
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {[
          { key: 'ALL', label: 'Semua Status' },
          { key: 'PENDING_REVIEW', label: 'Menunggu Verifikasi' },
          { key: 'APPROVED', label: 'Disetujui' },
          { key: 'PAID', label: 'Lunas' },
          { key: 'REJECTED', label: 'Ditolak' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-[hsl(186,72%,24%)] text-white'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
              <th className="py-3 px-4">Kode Reservasi</th>
              <th className="py-3 px-4">Kamar</th>
              <th className="py-3 px-4">Tgl Masuk & Durasi</th>
              <th className="py-3 px-4">Total Biaya Awal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-zinc-500">
                  Tidak ada reservasi dengan status yang dipilih.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">
                    <div className="tabular-nums text-xs">{item.code}</div>
                    <div className="text-[10px] text-zinc-400">
                      Diajukan {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900">
                    <div className="inline-flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kamar {item.roomCode}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600">
                    <div className="font-semibold text-zinc-800">{item.checkInDate}</div>
                    <div className="text-[11px] text-zinc-500">{item.durationMonths} Bulan Sewa</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <NextLink
                      href={`/calon/reservasi/${item.code}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] hover:bg-[hsl(186,72%,24%)] hover:text-white transition-colors"
                    >
                      <span>Lihat Timeline</span>
                      <ArrowRight className="w-3 h-3" />
                    </NextLink>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-500">
            Tidak ada reservasi ditemukan.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="tabular-nums text-xs font-bold text-zinc-900 block">
                    {item.code}
                  </span>
                  <span className="text-sm font-extrabold text-blue-700">
                    Kamar {item.roomCode}
                  </span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Rencana Masuk:</span>
                  <span className="font-semibold text-zinc-800">{item.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Durasi:</span>
                  <span className="font-semibold text-zinc-800">{item.durationMonths} Bulan</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1 mt-1 font-bold">
                  <span className="text-zinc-800">Total Biaya Awal:</span>
                  <span className="text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </span>
                </div>
              </div>

              <NextLink
                href={`/calon/reservasi/${item.code}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-[hsl(186,72%,24%)] text-white hover:bg-[hsl(186,74%,18%)] transition-colors"
              >
                <span>Lihat Timeline Status & Rincian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
