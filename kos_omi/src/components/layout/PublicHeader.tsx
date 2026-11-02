'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { Home, BedDouble, Info, HelpCircle, Phone, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/kamar', label: 'Katalog Kamar', icon: BedDouble },
    { href: '/calon', label: 'Status Reservasi', icon: ShieldCheck },
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[hsl(214,20%,90%)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Brand */}
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[hsl(217,91%,45%)] flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
              KO
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-[hsl(222,47%,11%)]">
                Kos Omi
              </span>
              <span className="text-xs text-[hsl(215,16%,47%)] -mt-1 font-medium flex items-center gap-1">
                Sungai Bangek, Padang (UIN Imam Bonjol) <span className="inline-block w-1 h-1 rounded-full bg-emerald-500"></span> 67 Kamar
              </span>
            </div>
          </NextLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'text-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] font-semibold'
                      : 'text-[hsl(222,47%,11%)] hover:text-[hsl(217,91%,45%)] hover:bg-[hsl(210,20%,98%)]'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[hsl(217,91%,45%)]' : 'text-slate-400'} />
                  {link.label}
                </NextLink>
              );
            })}
          </nav>

          {/* Auth CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <NextLink
              href="/login"
              className="text-sm font-medium text-[hsl(222,47%,11%)] hover:text-[hsl(217,91%,45%)] px-3 py-2 transition-colors"
            >
              Masuk
            </NextLink>
            <NextLink
              href="/kamar"
              className="inline-flex items-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.99]"
            >
              Cek Kamar Kosong
              <ArrowRight size={16} />
            </NextLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <NextLink
              href="/kamar"
              className="text-xs bg-[hsl(214,95%,96%)] text-[hsl(217,91%,45%)] font-semibold px-2.5 py-1.5 rounded-lg"
            >
              Cari Kamar
            </NextLink>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[hsl(214,20%,90%)] bg-white px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'text-[hsl(217,91%,45%)] bg-[hsl(214,95%,96%)] font-semibold'
                      : 'text-[hsl(222,47%,11%)] hover:bg-[hsl(210,20%,98%)]'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-[hsl(217,91%,45%)]' : 'text-slate-400'} />
                  {link.label}
                </NextLink>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <NextLink
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-4 rounded-lg border border-[hsl(214,20%,90%)] text-sm font-semibold text-[hsl(222,47%,11%)] hover:bg-slate-50 transition-colors"
            >
              Masuk ke Akun
            </NextLink>
            <NextLink
              href="/daftar"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-4 rounded-lg bg-[hsl(217,91%,45%)] text-white text-sm font-semibold hover:bg-[hsl(217,91%,38%)] shadow-sm transition-colors"
            >
              Daftar Calon Penghuni
            </NextLink>
          </div>
        </div>
      )}
    </header>
  );
};
