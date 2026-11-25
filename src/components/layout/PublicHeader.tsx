'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import {
  Home,
  BedDouble,
  Info,
  HelpCircle,
  Phone,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { getClientSession } from '@/lib/auth-client';
import { AuthUser } from '@/types/auth';
import { LogoutButton } from '@/components/layout/LogoutButton';

export const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setSessionUser(getClientSession());
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/kamar', label: 'Katalog Kamar', icon: BedDouble },
    ...(sessionUser ? [{ href: '/calon', label: 'Status Reservasi', icon: ShieldCheck }] : []),
    { href: '/tentang', label: 'Tentang Kos', icon: Info },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    { href: '/kontak', label: 'Kontak', icon: Phone },
  ];

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Jangan render PublicHeader pada halaman dasbor internal peran kerja
  const isDashboard =
    Boolean(pathname) &&
    (pathname!.startsWith('/pengelola') ||
      pathname!.startsWith('/keuangan') ||
      pathname!.startsWith('/penghuni') ||
      pathname!.startsWith('/admin'));

  if (isDashboard) {
    return null;
  }

  const isOnCalonPortal = Boolean(pathname) && pathname!.startsWith('/calon');
  const dashboardHref = sessionUser?.dashboardPath || '/calon/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[hsl(240,6%,90%)] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-2.5 lg:py-0 lg:h-20 gap-2 sm:gap-3">
          {/* Logo Brand */}
          <NextLink href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[hsl(186,72%,24%)] flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105 overflow-hidden p-0 shrink-0">
              <img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-extrabold text-base sm:text-xl tracking-tight text-[hsl(240,6%,10%)] truncate">
                Kos Omi
              </span>
              <span className="text-[10px] sm:text-xs text-[hsl(240,4%,46%)] -mt-0.5 font-medium flex items-center gap-1 truncate">
                <span>Sungai Bangek, Padang</span>
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="shrink-0">67 Kamar</span>
              </span>
            </div>
          </NextLink>

          {/* Navigation Links (Peletakan sama di Laptop & HP, responsif menyesuaikan layar tanpa terpotong) */}
          <nav
            aria-label="Navigasi Utama"
            className="order-3 lg:order-2 w-full lg:w-auto flex items-center gap-1 overflow-x-auto whitespace-nowrap pt-2 pb-1 lg:py-0 pr-4 lg:pr-0 border-t lg:border-t-0 border-zinc-100 scrollbar-none"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] font-semibold'
                      : 'text-[hsl(240,6%,10%)] hover:text-[hsl(186,72%,24%)] hover:bg-[hsl(210,20%,98%)]'
                  }`}
                >
                  <Icon size={15} className={active ? 'text-[hsl(186,72%,24%)]' : 'text-zinc-400'} />
                  {link.label}
                </NextLink>
              );
            })}
          </nav>

          {/* Auth CTA Buttons & Mobile Drawer Toggle */}
          <div className="order-2 lg:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
            {sessionUser || isOnCalonPortal ? (
              <>
                <NextLink
                  href={dashboardHref}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] hover:bg-[hsl(180,33%,90%)] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard size={15} />
                  <span>{sessionUser ? sessionUser.name.split(' ')[0] : 'Dasbor Saya'}</span>
                </NextLink>
                <LogoutButton
                  variant="header"
                  label="Keluar"
                  onAfterLogout={() => setSessionUser(null)}
                />
              </>
            ) : (
              <>
                <NextLink
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-[hsl(240,6%,10%)] hover:text-[hsl(186,72%,24%)] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-zinc-200 lg:border-transparent transition-colors whitespace-nowrap"
                >
                  Masuk
                </NextLink>
                <NextLink
                  href="/daftar"
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg transition-all active:scale-[0.99] whitespace-nowrap"
                >
                  <span>Daftar Akun</span>
                  <ArrowRight size={15} />
                </NextLink>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu Navigasi"
              className="lg:hidden p-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-2.5 border-t border-zinc-200 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2.5 ${
                    active
                      ? 'bg-[hsl(186,72%,24%)] text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
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
