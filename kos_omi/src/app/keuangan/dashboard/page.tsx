import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganDashboardClient } from '@/components/keuangan/KeuanganDashboardClient';
import {
  fetchFinanceDashboardStatsAction,
  fetchFinanceTransactionsAction,
} from '@/actions/finance';

export const metadata: Metadata = {
  title: 'Dasbor Staf Keuangan | Kos Omi',
  description: 'Rekapitulasi transaksi pembayaran Midtrans Snap, rekonsiliasi tagihan, dan tren pemasukan Kos Omi.',
};

export default async function KeuanganDashboardPage() {
  const [stats, transactions] = await Promise.all([
    fetchFinanceDashboardStatsAction(),
    fetchFinanceTransactionsAction(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganDashboardClient
          stats={stats}
          recentTransactions={transactions}
        />
      </main>
    </div>
  );
}
