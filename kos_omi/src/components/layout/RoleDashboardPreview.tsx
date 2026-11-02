'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Users,
  Wallet,
  Home,
  UserCheck,
  ArrowRight,
  LogOut,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/data/auth-demo';
import { clearClientSession, getClientSession, loginWithDemoAccount } from '@/lib/auth-client';
import { AuthUser, UserRole } from '@/types/auth';

interface RoleDashboardPreviewProps {
  role: UserRole;
  title: string;
  subtitle: string;
  nextTaskInfo: string;
  badgeText: string;
}

export const RoleDashboardPreview: React.FC<RoleDashboardPreviewProps> = ({
  role,
  title,
  subtitle,
  nextTaskInfo,
  badgeText,
}) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setCurrentUser(session);
    } else {
      // Otomatis sinkronisasi dengan role halaman demo
      const { user } = loginWithDemoAccount(role);
      setCurrentUser(user);
    }
  }, [role]);

  const handleLogout = () => {
    clearClientSession();
    router.push('/login');
  };

  const handleSwitchRole = (targetRole: UserRole) => {
    const { redirectUrl } = loginWithDemoAccount(targetRole);
    router.push(redirectUrl);
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header bar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] px-2.5 py-1 rounded-md">
                {badgeText}
              </span>
              <span className="text-xs text-slate-500 font-medium">Simulasi Role Routing Aktif</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Nama Pengguna</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {currentUser?.name || 'Staf Kos Omi'}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Email Akun</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {currentUser?.email || `${role.toLowerCase()}@kosomi.id`}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">Hak Akses Modul</span>
            <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{role} (Terverifikasi)</span>
            </div>
          </div>
        </div>

        {/* Role Routing & Task Roadmap Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[hsl(217,91%,45%)] border border-blue-100 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-900">Status Implementasi Task PRD</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Task 1.4 (Autentikasi & Role Routing) telah berhasil mengarahkan pengguna ke rute peran ini. {nextTaskInfo}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Ingin menguji proteksi otorisasi jika peran tidak memiliki izin?</span>
            </div>
            <NextLink
              href="/403"
              className="inline-flex items-center gap-1 font-bold text-[hsl(217,91%,45%)] hover:underline shrink-0"
            >
              <span>Uji Halaman 403 Forbidden</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </NextLink>
          </div>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Peralihan Cepat Antar Peran (Quick Switcher)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isCurrent = acc.role === role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSwitchRole(acc.role)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'border-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] ring-2 ring-[hsl(217,91%,45%)]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{acc.roleLabel}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{acc.dashboardPath}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
