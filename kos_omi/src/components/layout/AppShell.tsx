'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deteksi apakah rute adalah dasbor kerja internal
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  const isInternalDashboard =
    Boolean(currentPath) &&
    (currentPath.startsWith('/pengelola') ||
      currentPath.startsWith('/keuangan') ||
      currentPath.startsWith('/penghuni') ||
      currentPath.startsWith('/admin'));

  if (isInternalDashboard) {
    return (
      <div className="flex-grow w-full flex flex-col bg-slate-50 min-h-screen pb-16 md:pb-0">
        {children}
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16 md:pb-0">
      <PublicHeader />
      <main className="flex-grow">{children}</main>
      <PublicFooter />
      <MobileBottomNav />
    </div>
  );
};
