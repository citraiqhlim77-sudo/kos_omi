import React from 'react';
import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniRiwayatClient } from '@/components/penghuni/PenghuniRiwayatClient';
import { fetchPaymentHistoryAction } from '@/actions/billing';

export const metadata: Metadata = {
  title: 'Riwayat Pembayaran Sewa | Kos Omi Sungai Bangek',
  description: 'Arsip riwayat pembayaran sewa bulanan dan kuitansi lunas Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).',
};

export default async function PenghuniRiwayatPage() {
  const history = await fetchPaymentHistoryAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniRiwayatClient initialHistory={Array.isArray(history) ? history : []} />
      </main>
    </div>
  );
}
