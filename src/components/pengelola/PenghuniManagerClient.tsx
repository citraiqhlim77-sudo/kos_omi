'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { TenancyRecord } from '@/types/tenancy';
import { formatRupiah } from '@/data/rooms';
import {
  Users,
  Search,
  BedDouble,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Mail,
  UserCheck,
} from 'lucide-react';

interface PenghuniManagerClientProps {
  initialTenants: TenancyRecord[];
}

export const PenghuniManagerClient: React.FC<PenghuniManagerClientProps> = ({
  initialTenants,
}) => {
  const [tenants] = useState<TenancyRecord[]>(initialTenants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [floorFilter, setFloorFilter] = useState('ALL');

  const filteredTenants = tenants.filter((t) => {
    // Status filter
    if (statusFilter === 'LUNAS' && t.unpaidBillsCount > 0) return false;
    if (statusFilter === 'UNPAID' && t.unpaidBillsCount === 0) return false;
    if (statusFilter === 'AKTIF' && t.status !== 'AKTIF') return false;
    if (statusFilter === 'SELESAI' && t.status !== 'SELESAI') return false;

    // Floor filter
    if (floorFilter !== 'ALL' && t.roomFloor.toString() !== floorFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = t.userName.toLowerCase().includes(q);
      const matchRoom = t.roomCode.toLowerCase().includes(q);
      const matchPhone = t.userPhone.includes(q);
      if (!matchName && !matchRoom && !matchPhone) return false;
    }

    return true;
  });

  const activeCount = tenants.filter((t) => t.status === 'AKTIF').length;
  const unpaidCount = tenants.filter((t) => t.status === 'AKTIF' && t.unpaidBillsCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Database Penghuni
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Daftar Penghuni Aktif Kos Omi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Data resmi penghuni kamar, status masa sewa, nomor kontak WhatsApp, dan status tagihan berjalan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Penghuni Aktif</span>
            <span className="font-heading font-extrabold text-zinc-900 text-base">{activeCount} Orang</span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Tertunggak</span>
            <span className={`font-heading font-extrabold text-base ${unpaidCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {unpaidCount} Kamar
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama penghuni, nomor kamar (1), atau nomor WhatsApp..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tagihan Filter */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-zinc-900 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('LUNAS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'LUNAS' ? 'bg-white text-emerald-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNPAID')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'UNPAID' ? 'bg-white text-amber-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Tertunggak
            </button>
          </div>

          {/* Floor Filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Semua Lantai</option>
            <option value="1">Lantai 1 (Kamar No. 1 - 33)</option>
            <option value="2">Lantai 2 (Kamar No. 34 - 67)</option>
          </select>
        </div>
      </div>

      {/* Tenant List */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-bold text-zinc-700">Tidak ada penghuni yang sesuai</p>
            <p className="text-xs text-zinc-500">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredTenants.map((tenant) => {
              const hasUnpaid = tenant.unpaidBillsCount > 0;

              return (
                <div
                  key={tenant.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[hsl(186,72%,24%)] font-heading font-extrabold text-base flex items-center justify-center border border-blue-100 shrink-0">
                      {tenant.roomCode}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <NextLink
                          href={`/pengelola/penghuni/${tenant.id}`}
                          className="font-heading font-extrabold text-zinc-900 text-base hover:text-blue-600 transition-colors"
                        >
                          {tenant.userName}
                        </NextLink>

                        {hasUnpaid ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Tertunggak ({formatRupiah(tenant.totalUnpaidAmount)})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Tagihan Lunas</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Kamar: <strong className="text-zinc-900">{tenant.roomCode}</strong> (Lantai {tenant.roomFloor})</span>
                        <span>•</span>
                        <span>Check-in: <strong>{tenant.checkInDate}</strong></span>
                        <span>•</span>
                        <span>Jatuh Tempo: <strong>Tgl {tenant.dueDay} / bln</strong></span>
                      </div>

                      <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                        <a
                          href={`https://wa.me/62${tenant.userPhone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{tenant.userPhone}</span>
                        </a>
                        <span>•</span>
                        <span className="text-zinc-500">{tenant.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Profile Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-zinc-500 font-medium block">Tarif Sewa Bulanan</span>
                      <span className="text-base font-heading font-extrabold text-zinc-900 tabular-nums">
                        {formatRupiah(tenant.monthlyPrice)}
                      </span>
                    </div>

                    <NextLink
                      href={`/pengelola/penghuni/${tenant.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-colors"
                    >
                      <span>Detail Profil</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                    </NextLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
