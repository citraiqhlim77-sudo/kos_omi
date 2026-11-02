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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
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
                ? 'bg-[hsl(217,91%,45%)] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="py-3 px-4">Kode Reservasi</th>
              <th className="py-3 px-4">Kamar</th>
              <th className="py-3 px-4">Tgl Masuk & Durasi</th>
              <th className="py-3 px-4">Total Biaya Awal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500">
                  Tidak ada reservasi dengan status yang dipilih.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="font-mono text-xs">{item.code}</div>
                    <div className="text-[10px] text-slate-400">
                      Diajukan {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="inline-flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kamar {item.roomCode}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{item.checkInDate}</div>
                    <div className="text-[11px] text-slate-500">{item.durationMonths} Bulan Sewa</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <NextLink
                      href={`/calon/reservasi/${item.code}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[hsl(214,95%,96%)] text-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,45%)] hover:text-white transition-colors"
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
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            Tidak ada reservasi ditemukan.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 block">
                    {item.code}
                  </span>
                  <span className="text-sm font-extrabold text-blue-700">
                    Kamar {item.roomCode}
                  </span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rencana Masuk:</span>
                  <span className="font-semibold text-slate-800">{item.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi:</span>
                  <span className="font-semibold text-slate-800">{item.durationMonths} Bulan</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-bold">
                  <span className="text-slate-800">Total Biaya Awal:</span>
                  <span className="text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </span>
                </div>
              </div>

              <NextLink
                href={`/calon/reservasi/${item.code}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-[hsl(217,91%,45%)] text-white hover:bg-[hsl(217,91%,38%)] transition-colors"
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
