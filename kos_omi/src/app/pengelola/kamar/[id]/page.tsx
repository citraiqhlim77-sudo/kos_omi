import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchRoomByCodeAction, fetchRoomTenantHistoryAction } from '@/actions/rooms';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import { RoomDetailClient } from '@/components/pengelola/RoomDetailClient';

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RoomDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail & Riwayat Kamar ${id.toUpperCase()} - Pengelola | Kos Omi`,
    description: `Tinjau spesifikasi, tarif sewa, fasilitas inventaris, dan riwayat tenancy kamar ${id.toUpperCase()} Kos Omi.`,
  };
}

export default async function PengelolaRoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const normalizedCode = id.toUpperCase();

  const [room, histories] = await Promise.all([
    fetchRoomByCodeAction(normalizedCode),
    fetchRoomTenantHistoryAction(normalizedCode),
  ]);

  if (!room) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PengelolaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoomDetailClient initialRoom={room} initialHistories={histories} />
      </main>
    </div>
  );
}
