import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser,requireStrictPortalRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function CalonPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user?.role === 'PENGHUNI') {
    redirect('/penghuni/dashboard');
  }
  await requireStrictPortalRole('CALON_PENGHUNI');
  return <>{children}</>;
}
