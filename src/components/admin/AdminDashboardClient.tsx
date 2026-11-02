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

interface AdminDashboardClientProps {
  userCount: number;
  auditCount: number;
  notifCount: number;
  occupiedCount?: number;
  bookedCount?: number;
  monthlyIncome?: number;
}

export const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  userCount,
  auditCount,
  notifCount,
  occupiedCount = 0,
  bookedCount = 0,
  monthlyIncome = 0,
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
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
          <div className="text-[11px] text-blue-700 font-semibold">
            {occupiedCount} Terisi · {bookedCount} Dipesan · {67 - occupiedCount - bookedCount} Tersedia
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
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
          <div className="text-[11px] text-zinc-500 font-medium">
            3 Staf & Manajemen · 2 Akun Demo
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
              Pemasukan Bulan Ini
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {formatRupiah(monthlyIncome)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Status settlement Midtrans
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
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
          <div className="text-[11px] text-zinc-500 font-medium">
            Terekam permanen di database
          </div>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NextLink
          href="/admin/pengguna"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">
            Kelola Pengguna
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Tambah akun staf Pengelola / Keuangan dan kelola status akses pengguna.
          </p>
          <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>Buka Modul</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/pengaturan"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">
            Pengaturan Kos
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Konfigurasi tanggal jatuh tempo (tgl 5), persentase deposit, dan profil kos.
          </p>
          <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>Buka Pengaturan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/log-aktivitas"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">
            Log Audit Aktivitas
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Catatan kronologis perubahan data kamar, reservasi, check-in, dan transaksi.
          </p>
          <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>Lihat Log Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NextLink>

        <NextLink
          href="/admin/notifikasi"
          className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-extrabold text-zinc-900 text-sm group-hover:text-blue-600 transition-colors">
            Monitoring Notifikasi
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Pantau pengiriman pesan WhatsApp Fonnte dan Email tagihan Resend.
          </p>
          <div className="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>Monitoring Pesan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </NextLink>
      </div>

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
