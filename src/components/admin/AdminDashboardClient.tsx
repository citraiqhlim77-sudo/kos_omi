'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  ShieldCheck,
  Users,
  Settings,
  History,
  Bell,
  BedDouble,
  Activity,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { AdminUserRecord } from '@/types/admin';

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  ADMIN: 'Admin Sistem',
  PENGELOLA: 'Pengelola Kos',
  KEUANGAN: 'Staf Keuangan',
  PENGHUNI: 'Penghuni Aktif',
  CALON_PENGHUNI: 'Calon Penghuni',
};

interface AdminDashboardClientProps {
  userCount: number;
  auditCount: number;
  notifCount: number;
  occupiedCount?: number;
  bookedCount?: number;
  users?: AdminUserRecord[];
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  userCount,
  auditCount,
  notifCount,
  occupiedCount = 0,
  bookedCount = 0,
  users = [],
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              Pusat Kendali Sistem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Dasbor Administrator Kos Omi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Monitoring menyeluruh master data 67 kamar, manajemen hak akses peran staf, audit trail, dan konfigurasi sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-zinc-400 block text-[10px]">Pemilik & Kontak Resmi</span>
            <span className="font-bold text-zinc-900">Ibu Yulastri (0822-8714-6763)</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-600 block text-[10px]">Status Sistem</span>
            <span className="font-bold text-emerald-800">100% Beroperasi</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (4 Kartu Utama Administrasi Sistem) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NextLink
          href="/admin/pengaturan"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-blue-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-blue-700">
              Total Kamar Properti
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
            67
            <span className="text-xs text-zinc-500 font-normal ml-1">Kamar</span>
          </div>
          <div className="text-[11px] text-blue-700 font-semibold flex items-center justify-between">
            <span>{occupiedCount} Terisi · {bookedCount} Dipesan · {67 - occupiedCount - bookedCount} Tersedia</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/pengguna"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-indigo-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-indigo-700">
              Akun Pengguna Terdaftar
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {userCount}
            <span className="text-xs text-zinc-500 font-normal ml-1">Akun</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold flex items-center justify-between">
            <span>Kelola akses 5 role pengguna</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/notifikasi"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-emerald-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-700">
              Riwayat Notifikasi Sistem
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {notifCount}
            <span className="text-xs text-zinc-500 font-normal ml-1">Notifikasi</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
            <span>Klik buka riwayat notifikasi</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/log-aktivitas"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-amber-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-amber-700">
              Log Aktivitas Audit
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {auditCount}
            <span className="text-xs text-zinc-500 font-normal ml-1">Event</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
            <span>Klik buka riwayat audit sistem</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>
      </div>

      {/* Daftar Langsung Akun Pengguna Terdaftar di Dasbor */}
      {users.length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-heading font-extrabold text-zinc-900">
                Daftar Akun Pengguna Terdaftar ({users.length} Akun)
              </h2>
              <p className="text-xs text-zinc-500">
                Menampilkan seluruh akun staf, penghuni aktif, dan calon penghuni yang baru mendaftar.
              </p>
            </div>
            <NextLink
              href="/admin/pengguna"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[hsl(186,72%,24%)] text-white font-bold text-xs hover:bg-[hsl(186,74%,18%)] transition-colors shrink-0"
            >
              <span>Kelola Semua Pengguna</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                  <th className="py-2.5 px-4">Nama Pengguna</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">No. WhatsApp</th>
                  <th className="py-2.5 px-4">Peran</th>
                  <th className="py-2.5 px-4">Kamar</th>
                  <th className="py-2.5 px-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-4 font-bold text-zinc-900 whitespace-nowrap">{u.name}</td>
                    <td className="py-2.5 px-4 text-zinc-600 break-all">{u.email}</td>
                    <td className="py-2.5 px-4 text-zinc-600 tabular-nums whitespace-nowrap">{u.phone}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {ROLE_DISPLAY_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-zinc-700 whitespace-nowrap">
                      {u.roomCode ? `Kamar No. ${u.roomCode}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <NextLink
                        href="/admin/pengguna"
                        className="text-[hsl(186,72%,24%)] font-bold hover:underline"
                      >
                        Buka →
                      </NextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
