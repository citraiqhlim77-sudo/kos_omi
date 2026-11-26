import React from 'react';
import { Metadata } from 'next';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { PenghuniManagerClient } from '@/components/pengelola/PenghuniManagerClient';
import {
  fetchAllTenantsAction,
  fetchRegisteredCalonAccountsAction,
} from '@/actions/tenancy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Database Penghuni & Calon Penghuni | Pengelola Kos Omi',
  description:
    'Daftar penghuni aktif dan akun calon penghuni terdaftar di 67 kamar Kos Omi Sungai Bangek, Padang.',
};

interface PengelolaPenghuniPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function PengelolaPenghuniPage({
  searchParams,
}: PengelolaPenghuniPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const [res, calonRes] = await Promise.all([
    fetchAllTenantsAction(),
    fetchRegisteredCalonAccountsAction(),
  ]);

  const initialTab = resolvedParams?.tab === 'calon' ? 'CALON' : 'AKTIF';

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PengelolaNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniManagerClient
          initialTenants={res.tenants}
          initialCalonAccounts={calonRes.accounts}
          initialTab={initialTab}
        />
      </main>
    </div>
  );
}
