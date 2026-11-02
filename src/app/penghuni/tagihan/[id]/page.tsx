import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { TagihanDetailClient } from '@/components/penghuni/TagihanDetailClient';
import {
  fetchMonthlyBillByIdAction,
  fetchTenantProfileAction,
} from '@/actions/billing';

interface TagihanDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TagihanDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Rincian Tagihan ${resolvedParams.id} | Kos Omi Sungai Bangek`,
    description: `Bukti kuitansi dan rincian tagihan sewa ${resolvedParams.id} Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).`,
  };
}

export default async function PenghuniTagihanDetailPage({
  params,
}: TagihanDetailPageProps) {
  const resolvedParams = await params;
  const [bill, profile] = await Promise.all([
    fetchMonthlyBillByIdAction(resolvedParams.id),
    fetchTenantProfileAction(),
  ]);

  if (!bill) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <div className="print:hidden">
        <PenghuniNav />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 print:p-0 print:max-w-none">
        <TagihanDetailClient bill={bill} profile={profile} />
      </main>
    </div>
  );
}
