import React from 'react';
import { Metadata } from 'next';
import { fetchAllReservationsAction } from '@/actions/reservations';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { ReservasiManagerClient } from '@/components/pengelola/ReservasiManagerClient';

export const metadata: Metadata = {
  title: 'Daftar Reservasi Masuk - Pengelola | Kos Omi',
  description:
    'Verifikasi berkas KTP calon penghuni, kelola persetujuan reservasi, dan penerbitan invoice booking Kos Omi.',
};

export default async function PengelolaReservasiListPage() {
  const reservations = await fetchAllReservationsAction();

  return (
    <div className="bg-zinc-50 min-h-screen">
      <PengelolaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Verifikasi Pengajuan Reservasi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Periksa kelengkapan identitas KTP calon penghuni, setujui untuk menerbitkan invoice booking 24 jam, atau tolak dengan alasan resmi.
          </p>
        </div>

        <ReservasiManagerClient initialReservations={reservations} />
      </main>
    </div>
  );
}
