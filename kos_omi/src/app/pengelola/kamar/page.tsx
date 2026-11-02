import React from 'react';
import { Metadata } from 'next';
import { fetchRoomsAction } from '@/actions/rooms';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { KamarManagerClient } from '@/components/pengelola/KamarManagerClient';

export const metadata: Metadata = {
  title: 'Kelola 67 Kamar - Operasional Pengelola | Kos Omi',
  description:
    'Manajemen ketersediaan seluruh 67 kamar Kos Omi, monitoring status real-time, penyesuaian tarif sewa, fasilitas, dan transisi status kamar.',
};

export default async function PengelolaKamarPage() {
  const rooms = await fetchRoomsAction();

  return (
    <div className="bg-slate-50 min-h-screen">
      <PengelolaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Kelola 67 Kamar Kos Omi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Pantau ketersediaan kamar lantai 1 hingga 5, sesuaikan tarif bulanan, dan atur pemeliharaan fasilitas sesuai SOP.
            </p>
          </div>
        </div>

        {/* Client Manager (Table + Cards + Modals) */}
        <KamarManagerClient initialRooms={rooms} />
      </main>
    </div>
  );
}
