import React from 'react';
import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniProfilClient } from '@/components/penghuni/PenghuniProfilClient';
import { fetchTenantProfileAction } from '@/actions/billing';

export const metadata: Metadata = {
  title: 'Profil Penghuni | Kos Omi',
  description: 'Kelola data diri, kontak WhatsApp, nomor darurat, dan kata sandi akun penghuni Kos Omi.',
};

export default async function PenghuniProfilPage() {
  const profile = await fetchTenantProfileAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniProfilClient initialProfile={profile} />
      </main>
    </div>
  );
}
