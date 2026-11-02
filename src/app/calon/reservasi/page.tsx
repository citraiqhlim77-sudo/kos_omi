import React from 'react';
import { Metadata } from 'next';
import NextLink from 'next/link';
import { fetchMyReservationsAction } from '@/actions/reservations';
import { CalonReservasiListClient } from '@/components/calon/CalonReservasiListClient';
import { ArrowLeft, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Daftar Reservasi Saya - Calon Penghuni | Kos Omi Sungai Bangek',
  description: 'Daftar riwayat dan status pengajuan reservasi kamar Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).',
};

export default async function CalonReservasiListPage() {
  const user = await getCurrentUser();
  const email = user?.email || 'calon@example.com';
  const reservations = await fetchMyReservationsAction(email);

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <NextLink
                href="/calon/dashboard"
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dasbor Calon</span>
              </NextLink>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
              Daftar Reservasi Kamar Saya
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Pantau status verifikasi dokumen KTP, terbitan invoice, dan penyelesaian pembayaran reservasi Anda.
            </p>
          </div>

          <NextLink
            href="/kamar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Reservasi Baru</span>
          </NextLink>
        </div>

        {/* Client Table View */}
        <CalonReservasiListClient initialReservations={reservations} />
      </div>
    </div>
  );
}
