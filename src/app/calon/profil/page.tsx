import React from 'react';
import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth-server';
import { fetchAllReservationsAction } from '@/actions/reservations';
import { CalonProfilClient } from '@/components/calon/CalonProfilClient';
import NextLink from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Calon Penghuni | Kos Omi Sungai Bangek',
  description: 'Kelola data diri, kontak darurat, dan kata sandi akun Calon Penghuni Kos Omi Sungai Bangek, Padang dekat UIN Imam Bonjol.',
};

export default async function CalonProfilPage() {
  const user = await getCurrentUser();
  const reservations = await fetchAllReservationsAction();
  const latestRes = reservations[0];

  const initialProfile = {
    name: latestRes?.userName || user?.name || '',
    email: latestRes?.userEmail || user?.email || '',
    phone: latestRes?.userPhone || user?.phone || '',
    role: user?.role || 'CALON_PENGHUNI',
  };

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
              Profil Saya
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Perbarui informasi identitas pribadi, nomor kontak WhatsApp, dan kata sandi akun Anda.
            </p>
          </div>
        </div>

        {/* Client Profil Component */}
        <CalonProfilClient initialUser={initialProfile} />
      </div>
    </div>
  );
}
