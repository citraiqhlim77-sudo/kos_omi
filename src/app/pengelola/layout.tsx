import React from 'react';
import { requireStrictPortalRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function PengelolaPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStrictPortalRole('PENGELOLA');
  return <>{children}</>;
}
