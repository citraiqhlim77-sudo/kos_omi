'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, ShieldCheck } from 'lucide-react';

export const CalonNav: React.FC = () => {
  const pathname = usePathname();

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
        <div className="flex flex-wrap items-center justify-between py-2.5 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] px-2.5 py-1 rounded-md border border-[hsl(186,50%,82%)] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[hsl(186,72%,24%)] shrink-0" />
              <span>Portal Calon Penghuni</span>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full scrollbar-none">
            <nav aria-label="Menu Portal Calon Penghuni" className="flex items-center gap-1 shrink-0">
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
          </div>
        </div>
      </div>
    </div>
  );
};
