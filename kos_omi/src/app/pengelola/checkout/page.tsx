import React from 'react';
import { Metadata } from 'next';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { CheckoutManagerClient } from '@/components/pengelola/CheckoutManagerClient';
import { fetchAllTenantsAction } from '@/actions/tenancy';

export const metadata: Metadata = {
  title: 'Check-out Penghuni | Pengelola Kos Omi',
  description: 'Pemeriksaan tagihan sewa bulanan dan proses check-out kamar Kos Omi Sungai Bangek, Padang.',
};

export default async function PengelolaCheckoutPage() {
  const res = await fetchAllTenantsAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PengelolaNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <CheckoutManagerClient initialTenants={res.tenants} />
      </main>
    </div>
  );
}
