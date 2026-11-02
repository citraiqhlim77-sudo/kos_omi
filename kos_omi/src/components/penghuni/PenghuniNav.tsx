'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, History, BedDouble, User, Home, ShieldCheck } from 'lucide-react';

export const PenghuniNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/penghuni/dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
    { href: '/penghuni/tagihan', label: 'Tagihan Bulanan', icon: Receipt },
    { href: '/penghuni/riwayat', label: 'Riwayat Pembayaran', icon: History },
    { href: '/penghuni/kamar', label: 'Kamar Saya', icon: BedDouble },
    { href: '/penghuni/profil', label: 'Profil Saya', icon: User },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          {/* Brand/Role indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-sky-600" />
              <span>Portal Penghuni Kos Omi</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Kamar A-101 · Rina Kusuma
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== '/penghuni/dashboard' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-[hsl(217,91%,45%)] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </NextLink>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
