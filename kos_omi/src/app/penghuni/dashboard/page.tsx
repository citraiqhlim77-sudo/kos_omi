import React from 'react';
import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniDashboardClient } from '@/components/penghuni/PenghuniDashboardClient';
import {
  fetchCurrentMonthlyBillAction,
  fetchMonthlyBillsAction,
  fetchTenantProfileAction,
} from '@/actions/billing';
import { fetchRoomByCodeAction } from '@/actions/rooms';

export const metadata: Metadata = {
  title: 'Dasbor Penghuni Aktif | Kos Omi',
  description: 'Informasi tagihan sewa bulanan, kartu kamar aktif A-101, dan riwayat pembayaran resmi Kos Omi.',
};

export default async function PenghuniDashboardPage() {
  const [currentBill, allBills, profile] = await Promise.all([
    fetchCurrentMonthlyBillAction(),
    fetchMonthlyBillsAction(),
    fetchTenantProfileAction(),
  ]);

  const recentBills = Array.isArray(allBills) ? allBills.slice(0, 5) : [];

  // Ambil rincian kamar dari database / actions
  const roomRes = await fetchRoomByCodeAction(profile.roomCode);
  const room = roomRes || null;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniDashboardClient
          currentBill={currentBill}
          recentBills={recentBills}
          profile={profile}
          room={room}
        />
      </main>
    </div>
  );
}
