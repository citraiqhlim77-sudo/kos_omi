'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const KeuanganNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/keuangan/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/keuangan/laporan', label: 'Laporan Keuangan', icon: FileSpreadsheet },
    { href: '/keuangan/transaksi', label: 'Transaksi', icon: Receipt },
    { href: '/keuangan/tagihan', label: 'Tagihan Terlambat', icon: AlertCircle },
  ];

  return (
    <div className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2.5 gap-2.5">
          <div className="flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <NextLink
                href="/"
                className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] overflow-hidden shrink-0 flex items-center justify-center"
              >
                <img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" />
              </NextLink>
              <span className="font-heading font-extrabold text-sm text-zinc-900 whitespace-nowrap">
                Kos Omi
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Keuangan</span>
              </span>
            </div>

            <div className="flex md:hidden items-center gap-1.5 shrink-0">
              <LogoutButton showHomeLink label="Keluar" />
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 min-w-0">
            <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== '/keuangan/dashboard' && pathname.startsWith(link.href));
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

            <div className="hidden md:flex items-center pl-2 border-l border-zinc-200 shrink-0">
              <LogoutButton showHomeLink label="Keluar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
