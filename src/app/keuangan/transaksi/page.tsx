import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganTransaksiClient } from '@/components/keuangan/KeuanganTransaksiClient';
import { fetchFinanceTransactionsAction } from '@/actions/finance';
import {
  fetchSocialDonationsAction,
  fetchSocialAnnouncementsAction,
} from '@/actions/rent-schedule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Riwayat Pembayaran & Iuran Duka Cita | Keuangan Kos Omi',
  description:
    'Riwayat pembayaran sewa kamar Kos Omi dan pencatatan terpisah iuran sosial / duka cita seikhlasnya.',
};

export default async function KeuanganTransaksiPage() {
  const [transactions, donations, announcements] = await Promise.all([
    fetchFinanceTransactionsAction(),
    fetchSocialDonationsAction(),
    fetchSocialAnnouncementsAction(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganTransaksiClient
          initialTransactions={transactions}
          initialDonations={donations}
          initialAnnouncements={announcements}
        />
      </main>
    </div>
  );
}
