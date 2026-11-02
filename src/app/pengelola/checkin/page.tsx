import React from 'react';
import { Metadata } from 'next';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { CheckinManagerClient } from '@/components/pengelola/CheckinManagerClient';
import { fetchCheckinCandidatesAction } from '@/actions/tenancy';

export const metadata: Metadata = {
  title: 'Check-in Penghuni | Pengelola Kos Omi',
  description: 'Penerimaan dan proses check-in calon penghuni dengan status reservasi lunas di Kos Omi Sungai Bangek, Padang.',
};

export default async function PengelolaCheckinPage() {
  const res = await fetchCheckinCandidatesAction();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PengelolaNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <CheckinManagerClient initialCandidates={res.candidates} />
      </main>
    </div>
  );
}
