'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users,
  Building2,
  Settings,
  Lock,
} from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const KeuanganNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/keuangan/dashboard', label: 'Dasbor Keuangan', icon: LayoutDashboard },
    { href: '/keuangan/laporan', label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { href: '/keuangan/transaksi', label: 'Transaksi Kas', icon: Receipt },
    { href: '/keuangan/tagihan', label: 'Tagihan Sewa', icon: Building2 },
  ];

  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/keuangan/dashboard' && Boolean(pathname?.startsWith(href)));

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-2.5 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <NextLink
              href="/"
              className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] overflow-hidden shrink-0 flex items-center justify-center"
            >
              <img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" />
            </NextLink>
            <span className="font-heading font-extrabold text-sm text-zinc-900 whitespace-nowrap">
              Kos Omi
            </span>
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Pemilik Kos · Keuangan</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none">
            <nav aria-label="Navigasi Keuangan" className="flex items-center gap-1 shrink-0">
              {links.map((link) => {
                const active = isLinkActive(link.href);
                const Icon = link.icon;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                      active
                        ? 'bg-[hsl(186,72%,24%)] text-white'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{link.label}</span>
                  </NextLink>
                );
              })}
            </nav>

            <div className="flex items-center pl-2 border-l border-zinc-200 shrink-0">
              <LogoutButton showHomeLink label="Keluar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
