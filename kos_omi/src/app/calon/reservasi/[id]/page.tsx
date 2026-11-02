import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchReservationByCodeAction } from '@/actions/reservations';
import { ReservationTimelineClient } from '@/components/calon/ReservationTimelineClient';

interface ReservationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReservationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Timeline Reservasi ${id.toUpperCase()} - Calon Penghuni | Kos Omi Sungai Bangek`,
    description: `Pantau status verifikasi dan jadwal pembayaran reservasi ${id.toUpperCase()} Kos Omi Sungai Bangek, Padang dekat UIN Imam Bonjol.`,
  };
}

export default async function CalonReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id } = await params;
  const result = await fetchReservationByCodeAction(id.toUpperCase());

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReservationTimelineClient reservation={result.data} />
      </div>
    </div>
  );
}
