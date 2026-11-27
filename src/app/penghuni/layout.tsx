import React from 'react';
import { requireStrictPortalRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function PenghuniPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStrictPortalRole('PENGHUNI');
  return <>{children}</>;
}
