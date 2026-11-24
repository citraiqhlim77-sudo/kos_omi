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
  DollarSign,
  Activity,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { formatRupiah } from '@/data/rooms';
import { AdminUserRecord } from '@/types/admin';

interface AdminDashboardClientProps {
  userCount: number;
  auditCount: number;
  notifCount: number;
  occupiedCount?: number;
  bookedCount?: number;
  monthlyIncome?: number;
  users?: AdminUserRecord[];
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  userCount,
  auditCount,
  notifCount,
  occupiedCount = 0,
  bookedCount = 0,
  monthlyIncome = 0,
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
            <span className="text-zinc-400 block text-[10px]">Peran Anda</span>
            <span className="font-bold text-zinc-900">Administrator Utama</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-600 block text-[10px]">Status Sistem</span>
            <span className="font-bold text-emerald-800">100% Beroperasi</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Semua Bisa Diklik Langsung ke Halamannya) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NextLink
          href="/pengelola/kamar"
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
            <span>Klik untuk lihat daftar {userCount} akun</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        <NextLink
          href="/keuangan/transaksi"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-emerald-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-700">
              Pemasukan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {formatRupiah(monthlyIncome)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
            <span>Klik rincian transaksi masuk</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/log-aktivitas"
          className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-amber-400 hover:shadow-sm transition-all space-y-2 group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-amber-700">
              Log Audit & Notifikasi
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {auditCount + notifCount}
            <span className="text-xs text-zinc-500 font-normal ml-1">Event</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
            <span>Klik buka riwayat aktivitas</span>
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
                    <td className="py-2.5 px-4 font-bold text-zinc-900">{u.name}</td>
                    <td className="py-2.5 px-4 text-zinc-600">{u.email}</td>
                    <td className="py-2.5 px-4 text-zinc-600 tabular-nums">{u.phone}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-zinc-700">
                      {u.roomCode ? `Kamar ${u.roomCode}` : '-'}
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

      {/* System Infrastructure Health */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
          <Server className="w-4 h-4 text-blue-600" />
          <span>Status Infrastruktur & Layanan Pihak Ketiga (PRD Bab 10)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">Database Neon</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Connected
              </span>
            </div>
            <p className="text-zinc-500 text-[11px]">Serverless PostgreSQL di region Singapore (ap-southeast-1).</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">Midtrans Gateway</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sandbox Ready
              </span>
            </div>
            <p className="text-zinc-500 text-[11px]">Snap API v1 & Status API dengan verifikasi signature SHA512.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">Vercel Cron</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active 00:05 WIB
              </span>
            </div>
            <p className="text-zinc-500 text-[11px]">Pembuat invoice bulanan otomatis & pengingat H-7 jatuh tempo.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800">Notifikasi WA & Mail</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready
              </span>
            </div>
            <p className="text-zinc-500 text-[11px]">Adapter Fonnte WhatsApp & Resend React Email terintegrasi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
