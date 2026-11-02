'use client';

import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { formatRupiah } from '@/data/rooms';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  User,
  BedDouble,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface ReservasiManagerClientProps {
  initialReservations: Reservation[];
}

export const ReservasiManagerClient: React.FC<ReservasiManagerClientProps> = ({
  initialReservations,
}) => {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = useMemo(() => {
    return reservations.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchName = item.userName.toLowerCase().includes(q);
        const matchRoom = item.roomCode.toLowerCase().includes(q);
        const matchEmail = item.userEmail.toLowerCase().includes(q);
        const matchPhone = item.userPhone.includes(q);
        return matchCode || matchName || matchRoom || matchEmail || matchPhone;
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === 'PENDING_REVIEW').length,
      approved: reservations.filter((r) => r.status === 'APPROVED').length,
      paid: reservations.filter((r) => r.status === 'PAID').length,
      rejected: reservations.filter((r) => r.status === 'REJECTED').length,
    };
  }, [reservations]);

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Menunggu Verifikasi
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Disetujui · Siap Bayar
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Lunas Terverifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ditolak
          </span>
        );
      case 'EXPIRED':
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <span className="text-[11px] block font-medium opacity-80">Semua Reservasi</span>
          <span className="text-xl font-heading font-extrabold">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'PENDING_REVIEW'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-amber-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-amber-600">Menunggu Verifikasi</span>
          <span className="text-xl font-heading font-extrabold text-amber-700">{stats.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-blue-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-blue-600">Disetujui</span>
          <span className="text-xl font-heading font-extrabold text-blue-700">{stats.approved}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PAID')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'PAID'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-emerald-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-emerald-600">Lunas</span>
          <span className="text-xl font-heading font-extrabold text-emerald-700">{stats.paid}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-rose-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-rose-600">Ditolak</span>
          <span className="text-xl font-heading font-extrabold text-rose-700">{stats.rejected}</span>
        </button>
      </div>

      {/* Search & Control Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama calon, nomor WA, kode reservasi, atau kode kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[hsl(186,72%,24%)]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[hsl(186,72%,24%)]"
            >
              <option value="ALL">Semua Status Pengajuan</option>
              <option value="PENDING_REVIEW">Menunggu Verifikasi (Pending)</option>
              <option value="APPROVED">Disetujui (Menunggu Bayar)</option>
              <option value="PAID">Lunas Terverifikasi</option>
              <option value="REJECTED">Ditolak Pengelola</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
          <span>
            Menampilkan <strong className="text-zinc-900">{filtered.length}</strong> reservasi
          </span>
          {(statusFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[hsl(186,72%,24%)] font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
              <th className="py-3 px-4">Kode & Waktu</th>
              <th className="py-3 px-4">Calon Penghuni</th>
              <th className="py-3 px-4">Kamar</th>
              <th className="py-3 px-4">Rencana Masuk & Durasi</th>
              <th className="py-3 px-4">Total Biaya</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-500">
                  Tidak ada reservasi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">
                    <div className="tabular-nums text-xs">{item.code}</div>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{item.userName}</div>
                    <div className="text-[11px] text-zinc-500">{item.userPhone}</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-blue-700">
                    <div className="inline-flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kamar {item.roomCode}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600">
                    <div className="font-semibold text-zinc-800">{item.checkInDate}</div>
                    <div className="text-[11px] text-zinc-500">{item.durationMonths} Bulan</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <NextLink
                      href={`/pengelola/reservasi/${item.code}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[hsl(186,72%,24%)] text-white hover:bg-[hsl(186,74%,18%)] transition-colors"
                    >
                      <span>Verifikasi</span>
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
                    Kamar {item.roomCode} · {item.userName}
                  </span>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nomor Kontak:</span>
                  <span className="font-semibold text-zinc-800">{item.userPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tgl Masuk:</span>
                  <span className="font-semibold text-zinc-800">{item.checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Durasi:</span>
                  <span className="font-semibold text-zinc-800">{item.durationMonths} Bulan</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1 mt-1 font-bold">
                  <span className="text-zinc-800">Total Biaya:</span>
                  <span className="text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </span>
                </div>
              </div>

              <NextLink
                href={`/pengelola/reservasi/${item.code}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-[hsl(186,72%,24%)] text-white hover:bg-[hsl(186,74%,18%)] transition-colors"
              >
                <span>Tinjau KTP & Verifikasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
