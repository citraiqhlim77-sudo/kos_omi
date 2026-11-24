'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BedDouble, User, ShieldCheck, Menu, X } from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const CalonNav: React.FC = () => {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: '/calon/dashboard', label: 'Reservasi & Pembayaran', icon: LayoutDashboard },
    { href: '/kamar', label: 'Katalog Kamar', icon: BedDouble },
    { href: '/calon/profil', label: 'Profil Saya', icon: User },
  ];

  const isLinkActive = (href: string) => {
    const isCalonHome =
      href === '/calon/dashboard' && (pathname === '/calon' || pathname === '/calon/dashboard');
    return (
      isCalonHome ||
      pathname === href ||
      (href !== '/calon/dashboard' && href !== '/kamar' && Boolean(pathname?.startsWith(href)))
    );
  };

  return (
    <div className="bg-white border-b border-zinc-200 sticky top-16 md:top-20 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] px-2.5 py-1 rounded-md border border-[hsl(186,50%,82%)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(186,72%,24%)] shrink-0" />
              <span>Portal Calon Penghuni</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1">
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

          {/* Mobile Toggle & Quick Logout */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <LogoutButton showHomeLink label="Keluar" />
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              aria-label="Toggle menu calon penghuni"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Pill Bar */}
        <nav className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none">
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

        {/* Mobile Dropdown Drawer */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-zinc-100 py-3 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
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
    </div>
  );
};
