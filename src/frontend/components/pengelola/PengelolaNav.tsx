'use client';

import React,{ useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
LayoutDashboard,
BedDouble,
CalendarCheck,
Users,
LogIn,
ShieldCheck,
Menu,
X,
} from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { LiveNotifBell } from '@/components/layout/LiveNotifBell';

export const PengelolaNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/pengelola/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/pengelola/kamar', label: 'Kamar (1–67)', icon: BedDouble },
    { href: '/pengelola/reservasi', label: 'Verifikasi Reservasi', icon: CalendarCheck },
    { href: '/pengelola/checkin', label: 'Check-In', icon: LogIn },
    { href: '/pengelola/penghuni', label: 'Penghuni & Check-Out', icon: Users },
  ];

  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/pengelola/dashboard' && Boolean(pathname?.startsWith(href)));

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <NextLink
              href="/"
              className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] overflow-hidden shrink-0 flex items-center justify-center"
            >
              <img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" />
            </NextLink>
            <span className="font-heading font-extrabold text-sm text-zinc-900 whitespace-nowrap">
              Kos Omi
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-2 sm:px-2.5 py-1 rounded-md border border-blue-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
              <span>Pengelola Kos</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <nav aria-label="Navigasi Pengelola" className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none">
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

            <LiveNotifBell />

            {/* Tombol Beranda & Keluar disembunyikan di HP (< md) agar tidak menumpuk badge Pengelola Kos */}
            <div className="hidden md:inline-flex items-center gap-1.5 pl-2 border-l border-zinc-200 shrink-0">
              <LogoutButton showHomeLink label="Keluar" />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu Navigasi"
              className="md:hidden p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer (☰) */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2.5 border-t border-zinc-200 space-y-1">
            {links.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
                    active
                      ? 'bg-[hsl(186,72%,24%)] text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NextLink>
              );
            })}
            <div className="pt-2 mt-1 border-t border-zinc-100 flex items-center justify-end">
              <LogoutButton showHomeLink label="Keluar" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
