import React from 'react';
import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniTagihanClient } from '@/components/penghuni/PenghuniTagihanClient';
import { fetchMonthlyBillsAction } from '@/actions/billing';

export const metadata: Metadata = {
  title: 'Daftar Tagihan Sewa | Kos Omi',
  description: 'Daftar lengkap tagihan sewa bulanan, status pelunasan, jatuh tempo tanggal 5, dan kuitansi resmi Kos Omi.',
};

export default async function PenghuniTagihanPage() {
  const bills = await fetchMonthlyBillsAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniTagihanClient initialBills={Array.isArray(bills) ? bills : []} />
      </main>
    </div>
  );
}
