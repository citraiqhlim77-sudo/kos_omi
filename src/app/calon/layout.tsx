import React from 'react';
import { requireStrictPortalRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function CalonPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStrictPortalRole('CALON_PENGHUNI');
  return <>{children}</>;
}
