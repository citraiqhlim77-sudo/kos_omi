import React from 'react';
import { Metadata } from 'next';
import { KeuanganNav } from '@/components/keuangan/KeuanganNav';
import { KeuanganTagihanClient } from '@/components/keuangan/KeuanganTagihanClient';
import { fetchRoomRentSchedulesAction } from '@/actions/rent-schedule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tagihan Sewa & Pengingat Per Kamar | Keuangan Kos Omi',
  description:
    'Monitoring jadwal sewa 3-bulanan per kamar sesuai tanggal masuk, pengajuan tempo maksimal 7 hari, dan pengiriman pengingat WhatsApp Kos Omi.',
};

export default async function KeuanganTagihanPage() {
  const schedules = await fetchRoomRentSchedulesAction();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <KeuanganNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <KeuanganTagihanClient initialSchedules={schedules} />
      </main>
    </div>
  );
}
