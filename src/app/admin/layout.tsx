import React from 'react';
import { requireStrictPortalRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStrictPortalRole('ADMIN');
  return <>{children}</>;
}
