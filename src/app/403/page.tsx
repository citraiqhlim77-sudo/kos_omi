import React from 'react';
import NextLink from 'next/link';
import { ShieldX, ArrowLeft, UserCheck, Home } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-server';
import { getRoleDashboardPath } from '@/lib/auth-store';

export const dynamic = 'force-dynamic';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin Sistem',
  PENGELOLA: 'Pengelola Kos',
  KEUANGAN: 'Staf Keuangan',
  CALON_PENGHUNI: 'Calon Penghuni',
  PENGHUNI: 'Penghuni Aktif',
};

export default async function ForbiddenPage() {
  const currentUser = await getCurrentUser();
  const dashboardPath = currentUser ? getRoleDashboardPath(currentUser.role) : '/login';
  const roleLabel = currentUser
    ? ROLE_LABELS[currentUser.role] || currentUser.role
    : 'Belum Masuk Akun';

  return (
    <div className="min-h-[calc(100vh-140px)] bg-zinc-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Status Code Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 mx-auto">
            <ShieldX className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Akses Ditolak: Peran Anda tidak memiliki izin membuka halaman ini
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Sistem keamanan multi-peran Kos Omi membatasi halaman ini hanya untuk peran pengguna yang berwenang. Silakan kembali ke dasbor sesuai peran akun Anda.
          </p>
        </div>

        {/* Identity & Scope Information Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 text-left space-y-4">
          <h2 className="text-sm font-bold text-zinc-800 border-b border-zinc-100 pb-2.5">
            Informasi Sesi Pengguna Saat Ini
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-zinc-500 font-medium">Peran Aktif Terdeteksi:</span>
              <div className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-zinc-600" />
                <span>{roleLabel}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-zinc-500 font-medium">Akun Login:</span>
              <div className="text-zinc-800 text-xs truncate font-semibold">
                {currentUser ? `${currentUser.name} (${currentUser.email})` : '-'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Pemisahan Hak Akses 5 Role:</span> Setiap akun (Admin, Pengelola, Keuangan, Calon Penghuni, dan Penghuni) hanya dapat mengakses halaman dasbor dan menu sesuai kewenangannya masing-masing.
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NextLink
            href={dashboardPath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{currentUser ? 'Kembali ke Dasbor Saya' : 'Masuk ke Akun'}</span>
          </NextLink>

          <NextLink
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-zinc-500" />
            <span>Ganti Akun / Masuk Peran Lain</span>
          </NextLink>

          <NextLink
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Beranda Utama</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
