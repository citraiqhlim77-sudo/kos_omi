'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { LogOut, Home, Loader2 } from 'lucide-react';
import { clearClientSession } from '@/lib/auth-client';
import { logoutAction } from '@/actions/auth';

interface LogoutButtonProps {
  label?: string;
  redirectTo?: string;
  showHomeLink?: boolean;
  variant?: 'nav' | 'header' | 'danger' | 'mobile-tab';
  className?: string;
  onAfterLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  label = 'Keluar',
  redirectTo = '/login',
  showHomeLink = false,
  variant = 'nav',
  className = '',
  onAfterLogout,
}) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      clearClientSession();
      await logoutAction();
    } catch {
      // Tetap lanjutkan proses keluar meskipun server action gagal
    } finally {
      if (onAfterLogout) {
        onAfterLogout();
      }
      router.push(redirectTo);
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  if (variant === 'mobile-tab') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex flex-col items-center justify-center min-h-[44px] px-1 text-rose-600 hover:text-rose-800 transition-colors ${className}`}
        title="Keluar dari Akun"
      >
        {isLoggingOut ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5 font-semibold tracking-tight truncate max-w-full">
          {label}
        </span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {showHomeLink && (
        <NextLink
          href="/"
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Kembali ke Beranda Publik"
        >
          <Home className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">Beranda</span>
        </NextLink>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={
          variant === 'header'
            ? `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors whitespace-nowrap ${className}`
            : variant === 'danger'
            ? `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors whitespace-nowrap ${className}`
            : `px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 whitespace-nowrap ${className}`
        }
        title="Keluar dari Sesi Akun"
      >
        {isLoggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>{isLoggingOut ? 'Keluar...' : label}</span>
      </button>
    </div>
  );
};
