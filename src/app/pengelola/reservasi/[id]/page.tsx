import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchReservationByCodeAction } from '@/actions/reservations';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { ReservasiVerificationClient } from '@/components/pengelola/ReservasiVerificationClient';

interface PengelolaReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PengelolaReservationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Verifikasi Berkas KTP ${id.toUpperCase()} - Pengelola | Kos Omi Sungai Bangek`,
    description: `Tinjau dokumen KTP dan proses persetujuan reservasi kamar ${id.toUpperCase()} Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).`,
  };
}

export default async function PengelolaReservationDetailPage({
  params,
}: PengelolaReservationDetailPageProps) {
  const { id } = await params;
  const result = await fetchReservationByCodeAction(id.toUpperCase());

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="bg-zinc-50 min-h-screen">
      <PengelolaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReservasiVerificationClient initialReservation={result.data} />
      </main>
    </div>
  );
}
