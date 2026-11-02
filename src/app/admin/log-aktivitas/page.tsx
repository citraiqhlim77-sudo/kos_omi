import { Metadata } from 'next';
import { fetchAuditLogsAction } from '@/actions/admin';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminAuditClient } from '@/components/admin/AdminAuditClient';

export const metadata: Metadata = {
  title: 'Log Aktivitas Sistem - Administrator Kos Omi',
  description: 'Catatan audit mutasi data dan aktivitas operasional Kos Omi.',
};

export default async function AdminLogAktivitasPage() {
  const logs = await fetchAuditLogsAction();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminAuditClient initialLogs={logs} />
      </main>
    </div>
  );
}
