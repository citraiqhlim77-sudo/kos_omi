import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganLaporanClient } from '@/components/keuangan/KeuanganLaporanClient';
import {
  fetchDailyReportAction,
  fetchMonthlyReportAction,
  fetchOperationalAnalyticsAction,
} from '@/actions/finance';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Rekap Laporan Keuangan | Kos Omi',
  description: 'Rekapitulasi pemasukan harian dan bulanan Kos Omi dengan ekspor CSV format akuntansi.',
};

export default async function KeuanganLaporanPage() {
  const [dailyRows, monthlyRows, analytics] = await Promise.all([
    fetchDailyReportAction('2026-ALL'),
    fetchMonthlyReportAction(2026),
    fetchOperationalAnalyticsAction(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganLaporanClient
          initialDailyRows={dailyRows}
          initialMonthlyRows={monthlyRows}
          analytics={analytics}
        />
      </main>
    </div>
  );
}
