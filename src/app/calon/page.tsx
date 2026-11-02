import React from 'react';
import { Metadata } from 'next';
import { fetchMyReservationsAction } from '@/actions/reservations';
import { CalonDashboardClient } from '@/components/calon/CalonDashboardClient';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portal Calon Penghuni - Status Reservasi & Pembayaran | Kos Omi Sungai Bangek',
  description:
    'Pantau status verifikasi KTP, invoice booking, dan pembayaran Midtrans Snap Anda secara real-time di portal resmi Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).',
};

interface CalonPageProps {
  searchParams?: Promise<{ email?: string; registered?: string }>;
}

export default async function CalonPage({ searchParams }: CalonPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const email = resolvedParams?.email;
  const user = await getCurrentUser();

  // Email aktif berdasarkan sesi login atau query param atau fallback akun demo
  const currentEmail = user?.email || email || 'calon@example.com';

  // Ambil seluruh reservasi calon penghuni dari server database
  const reservations = await fetchMyReservationsAction(currentEmail);

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* PAGE TITLE */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            Portal Calon Penghuni Kos Omi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Pantau status reservasi, verifikasi berkas, dan pembayaran invoice booking Anda secara langsung dari server database Kos Omi.
          </p>
        </div>

        {/* CLIENT COMPONENT: Interaksi penuh dengan data dari server */}
        <CalonDashboardClient
          initialReservations={reservations}
          currentEmail={currentEmail}
        />
      </div>
    </div>
  );
}
