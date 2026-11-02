'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BedDouble,
  FileCheck2,
  User,
  LayoutDashboard,
  Receipt,
  History,
  Users,
  CalendarCheck,
  LogIn,
  BarChart3,
  CreditCard,
  AlertCircle,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  if (!pathname) return null;

  // 1. Role Penghuni
  if (pathname.startsWith('/penghuni')) {
    const penghuniTabs = [
      { href: '/penghuni/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/penghuni/tagihan', label: 'Tagihan', icon: Receipt },
      { href: '/penghuni/riwayat', label: 'Riwayat', icon: History },
      { href: '/penghuni/kamar', label: 'Kamar', icon: BedDouble },
      { href: '/penghuni/profil', label: 'Profil', icon: User },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Penghuni"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
      >
        <div className="grid grid-cols-6 h-14">
          {penghuniTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== '/penghuni/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <NextLink
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-[hsl(186,72%,24%)] font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NextLink>
            );
          })}
          <LogoutButton variant="mobile-tab" label="Keluar" />
        </div>
      </nav>
    );
  }

  // 2. Role Pengelola
  if (pathname.startsWith('/pengelola')) {
    const pengelolaTabs = [
      { href: '/pengelola/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/pengelola/kamar', label: 'Kamar', icon: BedDouble },
      { href: '/pengelola/reservasi', label: 'Reservasi', icon: CalendarCheck },
      { href: '/pengelola/penghuni', label: 'Penghuni', icon: Users },
      { href: '/pengelola/checkin', label: 'Check-in', icon: LogIn },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Pengelola"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
      >
        <div className="grid grid-cols-6 h-14">
          {pengelolaTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== '/pengelola/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <NextLink
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-[hsl(186,72%,24%)] font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NextLink>
            );
          })}
          <LogoutButton variant="mobile-tab" label="Keluar" />
        </div>
      </nav>
    );
  }

  // 3. Role Keuangan
  if (pathname.startsWith('/keuangan')) {
    const keuanganTabs = [
      { href: '/keuangan/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/keuangan/laporan', label: 'Laporan', icon: BarChart3 },
      { href: '/keuangan/transaksi', label: 'Transaksi', icon: CreditCard },
      { href: '/keuangan/tagihan', label: 'Terlambat', icon: AlertCircle },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Keuangan"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
      >
        <div className="grid grid-cols-5 h-14">
          {keuanganTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== '/keuangan/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <NextLink
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-emerald-700 font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NextLink>
            );
          })}
          <LogoutButton variant="mobile-tab" label="Keluar" />
        </div>
      </nav>
    );
  }

  // 4. Role Administrator
  if (pathname.startsWith('/admin')) {
    const adminTabs = [
      { href: '/admin/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/admin/pengguna', label: 'Akun', icon: Users },
      { href: '/admin/pengaturan', label: 'Atur', icon: Settings },
      { href: '/admin/log-aktivitas', label: 'Audit', icon: ShieldAlert },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Admin"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
      >
        <div className="grid grid-cols-5 h-14">
          {adminTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== '/admin/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <NextLink
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-[hsl(186,72%,24%)] font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NextLink>
            );
          })}
          <LogoutButton variant="mobile-tab" label="Keluar" />
        </div>
      </nav>
    );
  }

  // 5. Role Calon Penghuni
  if (pathname.startsWith('/calon')) {
    const calonTabs = [
      { href: '/calon/dashboard', label: 'Dasbor', icon: LayoutDashboard },
      { href: '/calon/reservasi', label: 'Reservasi', icon: FileCheck2 },
      { href: '/kamar', label: 'Cari Kamar', icon: BedDouble },
      { href: '/calon/profil', label: 'Profil', icon: User },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Calon Penghuni"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
      >
        <div className="grid grid-cols-5 h-14">
          {calonTabs.map((tab) => {
            const active =
              pathname === tab.href ||
              (tab.href !== '/calon/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <NextLink
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                  active
                    ? 'text-[hsl(186,72%,24%)] font-bold'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                  {tab.label}
                </span>
              </NextLink>
            );
          })}
          <LogoutButton variant="mobile-tab" label="Keluar" />
        </div>
      </nav>
    );
  }

  // 6. Public Routes (Default)
  const publicTabs = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/kamar', label: 'Katalog Kamar', icon: BedDouble },
    { href: '/calon/dashboard', label: 'Reservasi', icon: FileCheck2 },
    { href: '/login', label: 'Akun', icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Publik"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 safe-bottom"
    >
      <div className="grid grid-cols-4 h-14">
        {publicTabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href));
          const Icon = tab.icon;
          return (
            <NextLink
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors ${
                active
                  ? 'text-[hsl(186,72%,24%)] font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </NextLink>
          );
        })}
      </div>
    </nav>
  );
};
