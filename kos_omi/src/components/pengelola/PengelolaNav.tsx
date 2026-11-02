'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BedDouble, CalendarCheck, Users, LogIn, LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';

export const PengelolaNav: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/pengelola/dashboard', label: 'Ringkasan Dasbor', icon: LayoutDashboard },
    { href: '/pengelola/kamar', label: 'Kelola 67 Kamar', icon: BedDouble },
    { href: '/pengelola/reservasi', label: 'Verifikasi Reservasi', icon: CalendarCheck },
    { href: '/pengelola/penghuni', label: 'Daftar Penghuni', icon: Users },
    { href: '/pengelola/checkin', label: 'Check-in', icon: LogIn },
    { href: '/pengelola/checkout', label: 'Check-out', icon: LogOut },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          {/* Brand/Area indicator */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Area Pengelola Kos</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Operasional Harian 67 Kamar Kos Omi
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== '/pengelola/dashboard' && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-[hsl(217,91%,45%)] text-white'
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
