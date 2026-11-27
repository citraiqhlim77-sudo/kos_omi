'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CalonNav } from '@/components/calon/CalonNav';
import { getClientSession } from '@/lib/auth-client';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // Deteksi apakah rute adalah dasbor kerja internal
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  const isInternalDashboard =
    Boolean(currentPath) &&
    (currentPath.startsWith('/pengelola') ||
      currentPath.startsWith('/keuangan') ||
      currentPath.startsWith('/penghuni') ||
      currentPath.startsWith('/admin'));

  const isCalonArea = Boolean(currentPath) && currentPath.startsWith('/calon');

  useEffect(() => {
    setMounted(true);
    if (!currentPath) return;

    if (isInternalDashboard || isCalonArea) {
      const session = getClientSession();
      if (!session) {
        setIsAuthorized(false);
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      const role = session.role;
      const isAdmin = role === 'ADMIN';

      if (currentPath.startsWith('/admin') && !isAdmin) {
        setIsAuthorized(false);
        router.replace(session.dashboardPath || '/');
        return;
      }
      if (currentPath.startsWith('/pengelola') && !isAdmin && role !== 'PENGELOLA') {
        setIsAuthorized(false);
        router.replace(session.dashboardPath || '/');
        return;
      }
      if (currentPath.startsWith('/keuangan') && !isAdmin && role !== 'KEUANGAN') {
        setIsAuthorized(false);
        router.replace(session.dashboardPath || '/');
        return;
      }
      if (
        currentPath.startsWith('/penghuni') &&
        !isAdmin &&
        role !== 'PENGHUNI' &&
        role !== 'CALON_PENGHUNI'
      ) {
        setIsAuthorized(false);
        router.replace(session.dashboardPath || '/');
        return;
      }
      setIsAuthorized(true);
    } else {
      setIsAuthorized(true);
    }
  }, [currentPath, isInternalDashboard, isCalonArea, router]);

  if (isInternalDashboard) {
    if (mounted && !isAuthorized) {
      return null;
    }
    return (
      <div className="flex-grow w-full flex flex-col bg-zinc-50 min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      {isCalonArea && <CalonNav />}
      <main className="flex-grow">{mounted && isCalonArea && !isAuthorized ? null : children}</main>
      <PublicFooter />
    </div>
  );
};
