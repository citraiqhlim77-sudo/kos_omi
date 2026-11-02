import React from 'react';
import { Metadata } from 'next';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { PenghuniManagerClient } from '@/components/pengelola/PenghuniManagerClient';
import { fetchAllTenantsAction } from '@/actions/tenancy';

export const metadata: Metadata = {
  title: 'Daftar Penghuni Aktif | Pengelola Kos Omi',
  description: 'Daftar penghuni resmi 67 kamar Kos Omi Sungai Bangek, Padang, status tagihan, dan kontak darurat.',
};

export default async function PengelolaPenghuniPage() {
  const res = await fetchAllTenantsAction();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PengelolaNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniManagerClient initialTenants={res.tenants} />
      </main>
    </div>
  );
}
