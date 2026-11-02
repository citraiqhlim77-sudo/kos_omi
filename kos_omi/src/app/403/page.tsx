'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { ShieldX, ArrowLeft, ArrowRight, UserCheck, Building2, Home } from 'lucide-react';
import { getClientSession } from '@/lib/auth-client';
import { AuthUser } from '@/types/auth';

export default function ForbiddenPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getClientSession());
  }, []);

  const userRole = currentUser?.role || 'TIDAK_TERAUTENTIKASI';
  const dashboardPath = currentUser?.dashboardPath || '/login';

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Status Code Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 mx-auto">
            <ShieldX className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Akses Halaman Ditolak (Error 403)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            Akun Anda saat ini tidak memiliki kewenangan otorisasi untuk membuka modul atau halaman yang Anda tuju.
          </p>
        </div>

        {/* Identity & Scope Information Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-left space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2.5">
            Informasi Sesi Pengguna
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 font-medium">Peran Aktif Terdeteksi:</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-600" />
                <span>{currentUser ? currentUser.roleLabel : 'Belum Masuk Akun'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 font-medium">Alamat Email Sesi:</span>
              <div className="text-slate-800 text-xs truncate font-medium">
                {currentUser ? currentUser.email : '-'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Ketentuan Otorisasi Kos Omi:</span> Halaman khusus pengelolaan (Admin, Pengelola, dan Keuangan) hanya dapat diakses oleh staf berwenang. Calon penghuni dan penghuni diarahkan ke dasbor masing-masing.
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NextLink
            href={dashboardPath}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dasbor Saya</span>
          </NextLink>

          <NextLink
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Ganti Akun / Masuk Peran Lain</span>
          </NextLink>

          <NextLink
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Halaman Utama</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
