import { Metadata } from 'next';
import { fetchNotificationLogsAction } from '@/actions/admin';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminNotifikasiClient } from '@/components/admin/AdminNotifikasiClient';

export const metadata: Metadata = {
  title: 'Monitoring Notifikasi - Administrator Kos Omi',
  description: 'Log pengiriman notifikasi WhatsApp Fonnte dan Email Resend.',
};

export default async function AdminNotifikasiPage() {
  const logs = await fetchNotificationLogsAction();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminNotifikasiClient initialLogs={logs} />
      </main>
    </div>
  );
}
