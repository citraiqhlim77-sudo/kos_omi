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
        <div className="flex items-center justify-between h-16 md:h-20 gap-2">
          {/* Logo Brand */}
          <NextLink href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[hsl(186,72%,24%)] flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105 overflow-hidden p-0 shrink-0">
              <img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[hsl(240,6%,10%)] truncate">
                Kos Omi
              </span>
              <span className="text-[11px] sm:text-xs text-[hsl(240,4%,46%)] -mt-1 font-medium flex items-center gap-1 truncate">
                <span className="hidden xl:inline">Sungai Bangek, Padang (UIN Imam Bonjol)</span>
                <span className="xl:hidden">Sungai Bangek, Padang</span>
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="shrink-0">67 Kamar</span>
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation (lg+) */}
          <nav aria-label="Navigasi Utama" className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] font-semibold'
                      : 'text-[hsl(240,6%,10%)] hover:text-[hsl(186,72%,24%)] hover:bg-[hsl(210,20%,98%)]'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[hsl(186,72%,24%)]' : 'text-zinc-400'} />
                  {link.label}
                </NextLink>
              );
            })}
          </nav>

          {/* Auth CTA Buttons (lg+) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {sessionUser || isOnCalonPortal ? (
              <>
                <NextLink
                  href={dashboardHref}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] hover:bg-[hsl(180,33%,90%)] px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
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
                  className="text-sm font-medium text-[hsl(240,6%,10%)] hover:text-[hsl(186,72%,24%)] px-3 py-2 transition-colors whitespace-nowrap"
                >
                  Masuk
                </NextLink>
                <NextLink
                  href="/daftar"
                  className="inline-flex items-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all active:scale-[0.99] whitespace-nowrap"
                >
                  Daftar Akun
                  <ArrowRight size={16} />
                </NextLink>
              </>
            )}
          </div>

          {/* Mobile & Tablet Menu Button (< lg) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {sessionUser || isOnCalonPortal ? (
              <NextLink
                href={dashboardHref}
                className="inline-flex items-center gap-1 text-xs bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] font-semibold px-2.5 py-1.5 rounded-lg"
              >
                <LayoutDashboard size={14} />
                <span className="max-w-[90px] truncate">
                  {sessionUser ? sessionUser.name.split(' ')[0] : 'Dasbor'}
                </span>
              </NextLink>
            ) : (
              <NextLink
                href="/kamar"
                className="text-xs bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
              >
                Cari Kamar
              </NextLink>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none border border-zinc-200/80"
              aria-label="Toggle menu navigasi"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Drawer (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[hsl(240,6%,90%)] bg-white px-4 pt-3 pb-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {sessionUser && (
            <div className="mb-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 truncate">{sessionUser.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{sessionUser.email}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] border border-[hsl(186,50%,82%)] shrink-0">
                {sessionUser.roleLabel}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] font-semibold'
                      : 'text-[hsl(240,6%,10%)] hover:bg-[hsl(210,20%,98%)]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[hsl(186,72%,24%)]' : 'text-zinc-400'} />
                  {link.label}
                </NextLink>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-2.5">
            {sessionUser || isOnCalonPortal ? (
              <>
                <NextLink
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[hsl(186,72%,24%)] text-white text-sm font-semibold hover:bg-[hsl(186,74%,18%)] transition-colors"
                >
                  Buka Dasbor Akun Saya
                </NextLink>
                <LogoutButton
                  variant="danger"
                  label="Keluar dari Akun"
                  className="w-full"
                  onAfterLogout={() => {
                    setSessionUser(null);
                    setIsMobileMenuOpen(false);
                  }}
                />
              </>
            ) : (
              <>
                <NextLink
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg border border-[hsl(240,6%,90%)] text-sm font-semibold text-[hsl(240,6%,10%)] hover:bg-zinc-50 transition-colors"
                >
                  Masuk ke Akun
                </NextLink>
                <NextLink
                  href="/daftar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-[hsl(186,72%,24%)] text-white text-sm font-semibold hover:bg-[hsl(186,74%,18%)] transition-colors"
                >
                  Daftar Calon Penghuni
                </NextLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
