import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganTransaksiClient } from '@/components/keuangan/KeuanganTransaksiClient';
import { fetchFinanceTransactionsAction } from '@/actions/finance';

export const metadata: Metadata = {
  title: 'Monitoring Gateway Midtrans | Keuangan Kos Omi',
  description: 'Daftar transaksi payment gateway Midtrans Snap, status settlement, dan rekonsiliasi tagihan.',
};

export default async function KeuanganTransaksiPage() {
  const transactions = await fetchFinanceTransactionsAction();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganTransaksiClient initialTransactions={transactions} />
      </main>
    </div>
  );
}
