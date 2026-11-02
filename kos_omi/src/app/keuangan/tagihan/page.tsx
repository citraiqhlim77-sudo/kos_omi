import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganTagihanClient } from '@/components/keuangan/KeuanganTagihanClient';
import { fetchOverdueBillsAction } from '@/actions/finance';

export const metadata: Metadata = {
  title: 'Monitoring Tagihan Terlambat | Keuangan Kos Omi Sungai Bangek',
  description: 'Monitoring piutang sewa bulanan dan pengiriman pengingat tagihan penghuni Kos Omi Sungai Bangek, Padang.',
};

export default async function KeuanganTagihanPage() {
  const overdueBills = await fetchOverdueBillsAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganTagihanClient initialOverdueBills={overdueBills} />
      </main>
    </div>
  );
}
