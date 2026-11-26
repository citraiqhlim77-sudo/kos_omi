import { Metadata } from 'next';
import { fetchAdminSettingsAction } from '@/actions/admin';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminPengaturanClient } from '@/components/admin/AdminPengaturanClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pengaturan Sistem - Administrator Kos Omi',
  description: 'Konfigurasi parameter operasional dan bisnis Kos Omi.',
};

export default async function AdminPengaturanPage() {
  const settings = await fetchAdminSettingsAction();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <AdminNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 md:pb-12">
        <AdminPengaturanClient initialSettings={settings} />
      </main>
    </div>
  );
}
