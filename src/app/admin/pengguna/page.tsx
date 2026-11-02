import React from 'react';
import { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminPenggunaClient } from '@/components/admin/AdminPenggunaClient';
import { fetchAdminUsersAction } from '@/actions/admin';

export const metadata: Metadata = {
  title: 'Kelola Pengguna & Peran | Admin Kos Omi',
  description: 'Manajemen akun staf Pengelola, Keuangan, dan status akses akun pengguna sistem Kos Omi.',
};

export default async function AdminPenggunaPage() {
  const users = await fetchAdminUsersAction();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdminPenggunaClient initialUsers={users} />
      </main>
    </div>
  );
}
