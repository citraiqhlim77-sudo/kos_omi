import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { TransaksiDetailClient } from '@/components/keuangan/TransaksiDetailClient';
import { fetchTransactionByIdAction } from '@/actions/finance';

interface KeuanganTransaksiDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: KeuanganTransaksiDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Rincian Transaksi ${resolvedParams.id} | Keuangan Kos Omi`,
    description: `Log transaksi Midtrans Snap, status settlement, dan payload webhook order ${resolvedParams.id}.`,
  };
}

export default async function KeuanganTransaksiDetailPage({
  params,
}: KeuanganTransaksiDetailPageProps) {
  const resolvedParams = await params;
  const transaction = await fetchTransactionByIdAction(resolvedParams.id);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <TransaksiDetailClient transaction={transaction} />
      </main>
    </div>
  );
}
