import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganLaporanClient } from '@/components/keuangan/KeuanganLaporanClient';
import {
  fetchDailyReportAction,
  fetchMonthlyReportAction,
} from '@/actions/finance';

export const metadata: Metadata = {
  title: 'Rekap Laporan Keuangan | Kos Omi',
  description: 'Rekapitulasi pemasukan harian dan bulanan Kos Omi dengan ekspor CSV format akuntansi.',
};

export default async function KeuanganLaporanPage() {
  const [dailyRows, monthlyRows] = await Promise.all([
    fetchDailyReportAction('2025-06'),
    fetchMonthlyReportAction(2025),
  ]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganLaporanClient
          initialDailyRows={dailyRows}
          initialMonthlyRows={monthlyRows}
        />
      </main>
    </div>
  );
}
