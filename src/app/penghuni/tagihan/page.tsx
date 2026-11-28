import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniTagihanClient } from '@/components/penghuni/PenghuniTagihanClient';
import { fetchMonthlyBillsAction } from '@/actions/billing';
import { fetchMyRoomRentScheduleAction } from '@/actions/rent-schedule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tagihan Sewa & Jadwal 3 Bulanan | Kos Omi',
  description:
    'Jadwal jatuh tempo sewa 3 bulanan per kamar, pengajuan perpanjangan waktu bayar maksimal 7 hari, dan riwayat tagihan Kos Omi.',
};

export default async function PenghuniTagihanPage() {
  const [bills, roomSchedule] = await Promise.all([
    fetchMonthlyBillsAction(),
    fetchMyRoomRentScheduleAction(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniTagihanClient
          initialBills={Array.isArray(bills) ? bills : []}
          initialSchedule={roomSchedule}
        />
      </main>
    </div>
  );
}
