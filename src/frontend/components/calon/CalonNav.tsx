'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, ShieldCheck, Menu, X } from 'lucide-react';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const CalonNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/calon/dashboard', label: 'Reservasi & Pembayaran', icon: LayoutDashboard },
    { href: '/calon/profil', label: 'Profil Saya', icon: User },
  ];

  const isLinkActive = (href: string) => {
    const isCalonHome =
      href === '/calon/dashboard' && (pathname === '/calon' || pathname === '/calon/dashboard');
    return (
      isCalonHome ||
      pathname === href ||
      (href !== '/calon/dashboard' && Boolean(pathname?.startsWith(href)))
    );
  };

  return (
    <div className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] px-2.5 py-1 rounded-md border border-[hsl(186,50%,82%)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(186,72%,24%)] shrink-0" />
              <span>Calon Penghuni</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <nav aria-label="Menu Portal Calon Penghuni" className="hidden md:flex items-center gap-1.5 shrink-0">
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

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu Calon Penghuni"
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
    </div>
  );
};
