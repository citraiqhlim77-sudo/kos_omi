import React from 'react';
import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniKamarClient } from '@/components/penghuni/PenghuniKamarClient';
import { fetchTenantProfileAction } from '@/actions/billing';
import { fetchRoomByCodeAction } from '@/actions/rooms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kamar Saya | Kos Omi Sungai Bangek, Padang',
  description:
    'Informasi rincian fasilitas kamar aktif, masa sewa semesteran (6 bulan), token listrik, dan tata tertib penghuni Kos Omi Sungai Bangek dekat UIN Imam Bonjol Padang.',
};

export default async function PenghuniKamarPage() {
  const profile = await fetchTenantProfileAction();
  const roomRes = await fetchRoomByCodeAction(profile.roomCode);
  const room = roomRes || null;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20 md:pb-16">
      <PenghuniNav />
      <PenghuniKamarClient initialProfile={profile} initialRoom={room} />
    </div>
  );
}
