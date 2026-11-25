'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, History, BedDouble, User, Home, Menu, X } from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { getClientSession, setClientSession } from '@/lib/auth-client';
import { fetchTenantProfileAction } from '@/actions/billing';

export const PenghuniNav: React.FC = () => {
  const pathname = usePathname();
  const [tenantBadge, setTenantBadge] = useState<string>('Penghuni Aktif');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const clientUser = getClientSession();
    const emailToQuery = clientUser?.email || undefined;

    if (clientUser) {
      const initialRoom = clientUser.roomCode ? ` · Kamar No. ${clientUser.roomCode}` : '';
      setTenantBadge(`Penghuni Aktif${initialRoom}`);
    }

    fetchTenantProfileAction(emailToQuery)
      .then((profile) => {
        if (profile && profile.roomCode) {
          setTenantBadge(`Penghuni Aktif · Kamar No. ${profile.roomCode}`);

          if (clientUser && clientUser.roomCode !== profile.roomCode) {
            setClientSession({
              ...clientUser,
              roomCode: profile.roomCode,
            });
          }
        }
      })
      .catch(() => {
        // Pertahankan badge dari clientUser apabila gagal memuat
      });
  }, [pathname]);

  const links = [
    { href: '/penghuni/dashboard', label: 'Dasbor & Tagihan', icon: LayoutDashboard },
    { href: '/penghuni/tagihan', label: 'Daftar Tagihan', icon: Receipt },
    { href: '/penghuni/riwayat', label: 'Riwayat', icon: History },
    { href: '/penghuni/kamar', label: 'Kamar Saya', icon: BedDouble },
    { href: '/penghuni/profil', label: 'Profil Saya', icon: User },
  ];

  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/penghuni/dashboard' && Boolean(pathname?.startsWith(href)));

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
            <span className="text-[11px] sm:text-xs font-bold text-sky-700 bg-sky-50 px-2 sm:px-2.5 py-1 rounded-md border border-sky-200 inline-flex items-center gap-1 whitespace-nowrap shrink-0">
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
              <span>{tenantBadge}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <nav aria-label="Navigasi Penghuni" className="hidden lg:flex items-center gap-1">
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

            <div className="flex items-center gap-1.5 lg:pl-2 lg:border-l border-zinc-200 shrink-0">
              <LogoutButton showHomeLink label="Keluar" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle Menu Navigasi"
                className="lg:hidden p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Horizontal Scrollable Bar */}
        <nav
          aria-label="Navigasi Cepat Penghuni"
          className="lg:hidden flex items-center gap-1.5 w-full overflow-x-auto whitespace-nowrap py-2 pr-4 border-t border-zinc-100 scrollbar-none"
        >
          {links.map((link) => {
            const active = isLinkActive(link.href);
            const Icon = link.icon;
            return (
              <NextLink
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'bg-[hsl(186,72%,24%)] text-white'
                    : 'text-zinc-600 bg-zinc-50 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* Mobile Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-2.5 border-t border-zinc-200 space-y-1">
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
          </div>
        )}
      </div>
    </header>
  );
};
