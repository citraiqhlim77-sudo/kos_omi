'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, History, BedDouble, User, Home, Menu, X } from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { getClientSession } from '@/lib/auth-client';

export const PenghuniNav: React.FC = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [tenantBadge, setTenantBadge] = useState<string>('Penghuni Aktif');

  useEffect(() => {
    setIsMobileOpen(false);
    const clientUser = getClientSession();
    if (clientUser) {
      const firstName = clientUser.name ? clientUser.name.split(' ')[0] : 'Penghuni';
      const roomLabel = clientUser.roomCode ? ` · Kamar ${clientUser.roomCode}` : '';
      setTenantBadge(`${firstName}${roomLabel}`);
    }
  }, [pathname]);

  const links = [
    { href: '/penghuni/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/penghuni/tagihan', label: 'Tagihan Sewa', icon: Receipt },
    { href: '/penghuni/riwayat', label: 'Riwayat Lunas', icon: History },
    { href: '/penghuni/kamar', label: 'Kamar Saya', icon: BedDouble },
    { href: '/penghuni/profil', label: 'Profil Saya', icon: User },
  ];

  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/penghuni/dashboard' && Boolean(pathname?.startsWith(href)));

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
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
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 inline-flex items-center gap-1.5 truncate">
              <Home className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{tenantBadge}</span>
            </span>
          </div>

          {/* Desktop Navigation (lg+) */}
          <div className="hidden lg:flex items-center gap-2">
            <nav aria-label="Navigasi Penghuni" className="flex items-center gap-1">
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

          {/* Mobile & Tablet Actions (< lg) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <LogoutButton showHomeLink label="Keluar" />
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              aria-label="Toggle menu penghuni"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tablet/Mobile Quick Scrollable Pills */}
        <nav className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none">
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
                    : 'bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* Collapsible Mobile Dropdown Drawer */}
        {isMobileOpen && (
          <div className="lg:hidden border-t border-zinc-100 py-3 grid grid-cols-1 sm:grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {links.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
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
          </div>
        )}
      </div>
    </header>
  );
};
