import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { PenghuniDetailClient } from '@/components/pengelola/PenghuniDetailClient';
import { fetchTenantByIdAction } from '@/actions/tenancy';

interface PengelolaPenghuniDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PengelolaPenghuniDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const res = await fetchTenantByIdAction(resolvedParams.id);

  if (!res.tenant) {
    return {
      title: 'Penghuni Tidak Ditemukan | Kos Omi',
    };
  }

  return {
    title: `Profil ${res.tenant.userName} (Kamar ${res.tenant.roomCode}) | Kos Omi Sungai Bangek`,
    description: `Rincian data sewa, status tagihan, dan kontak penghuni Kamar ${res.tenant.roomCode} Kos Omi Sungai Bangek, Padang.`,
  };
}

export default async function PengelolaPenghuniDetailPage({
  params,
}: PengelolaPenghuniDetailPageProps) {
  const resolvedParams = await params;
  const res = await fetchTenantByIdAction(resolvedParams.id);

  if (!res.tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PengelolaNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniDetailClient tenant={res.tenant} />
      </main>
    </div>
  );
}
