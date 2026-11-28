import { Metadata } from 'next';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { PenghuniTagihanClient } from '@/components/penghuni/PenghuniTagihanClient';
import { fetchMonthlyBillsAction } from '@/actions/billing';
import { fetchMyRoomRentScheduleAction } from '@/actions/rent-schedule';
import { getCurrentUser } from '@/lib/auth-server';
import { MonthlyBill } from '@/types/billing';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tagihan Sewa & Jadwal 3 Bulanan | Kos Omi',
  description:
    'Jadwal jatuh tempo sewa 3 bulanan per kamar, pembayaran via Bank BRI, pengajuan perpanjangan waktu bayar maksimal 7 hari, dan riwayat tagihan Kos Omi.',
};

export default async function PenghuniTagihanPage() {
  const [bills, roomSchedule, currentUser] = await Promise.all([
    fetchMonthlyBillsAction(),
    fetchMyRoomRentScheduleAction(),
    getCurrentUser(),
  ]);

  const syncedBills: MonthlyBill[] = Array.isArray(bills) ? [...bills] : [];

  // Sinkronkan tagihan jatuh tempo 3-bulanan agar selalu muncul di daftar tagihan saat belum lunas
  if (roomSchedule && !roomSchedule.isCyclePaid) {
    const cycleInvoiceCode = `INV-SEWA-${roomSchedule.roomCode}-${roomSchedule.nextDueDate.replace(/-/g, '')}`;
    const alreadyExists = syncedBills.some(
      (b) =>
        b.invoiceCode === cycleInvoiceCode ||
        (b.status !== 'LUNAS' && b.dueDate === roomSchedule.effectiveDueDate)
    );

    if (!alreadyExists) {
      const amount = roomSchedule.myCycleAmount ?? roomSchedule.cycleAmount;
      const dueYear = Number(roomSchedule.nextDueDate.slice(0, 4)) || new Date().getFullYear();
      syncedBills.unshift({
        id: `cycle-${roomSchedule.roomCode}-${roomSchedule.nextDueDate}`,
        invoiceCode: cycleInvoiceCode,
        roomCode: roomSchedule.roomCode,
        tenantEmail: currentUser?.email || '',
        tenantName: currentUser?.name || '',
        tenantPhone: currentUser?.phone || '-',
        periodMonth: `Sewa 3-Bulanan (${roomSchedule.nextDueDate})`,
        periodKey: roomSchedule.nextDueDate.slice(0, 7),
        year: dueYear,
        dueDate: roomSchedule.effectiveDueDate,
        rentAmount: amount,
        amount,
        penaltyAmount: 0,
        totalAmount: amount,
        status: roomSchedule.daysOverdue > 0 ? 'TERLAMBAT' : 'BELUM_BAYAR',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PenghuniTagihanClient
          initialBills={syncedBills}
          initialSchedule={roomSchedule}
        />
      </main>
    </div>
  );
}
