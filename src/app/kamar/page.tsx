import React from 'react';
import { Metadata } from 'next';
import { fetchRoomsAction, fetchRoomStatsAction } from '@/actions/rooms';
import { KamarCatalogClient } from '@/components/kamar/KamarCatalogClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await fetchRoomStatsAction();
  const availableCount = stats?.available ?? 0;

  return {
    title: `Katalog 67 Kamar Kos Omi Sungai Bangek, Padang (${availableCount} Tersedia)`,
    description: `Daftar lengkap 67 kamar kos 2 lantai (Kamar No. 1 - 67) di Sungai Bangek Padang dekat Kampus III UIN Imam Bonjol. Tersedia ${availableCount} kamar kosong siap huni dengan pilihan tipe Standar dan Deluxe AC. Cek ketersediaan real-time dan ajukan reservasi online aman via Midtrans.`,
    alternates: {
      canonical: 'https://kosomi.id/kamar',
    },
    openGraph: {
      title: `Katalog 67 Kamar Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Siap Huni`,
      description: `Lihat ketersediaan kamar Lantai 1 (No. 1-33) & Lantai 2 (No. 34-67) di Kos Omi Sungai Bangek Padang (dekat UIN Imam Bonjol). Kapasitas 1 kamar 2 orang putri (Rp 5.000.000/semester), Wi-Fi kencang, CCTV 24 jam, dan verifikasi KTP instan.`,
      url: 'https://kosomi.id/kamar',
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'Katalog Kamar Kos Omi Sungai Bangek Padang',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Katalog 67 Kamar Kos Omi Sungai Bangek, Padang (${availableCount} Tersedia)`,
      description: 'Daftar lengkap 67 kamar kos 2 lantai (Kamar No. 1 - 67) di Sungai Bangek Padang dekat UIN Imam Bonjol. Cek ketersediaan real-time.',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default async function KamarPage() {
  // Ambil seluruh kamar dan statistik langsung dari server database
  const [rooms, stats] = await Promise.all([
    fetchRoomsAction(),
    fetchRoomStatsAction(),
  ]);

  return <KamarCatalogClient initialRooms={rooms} initialStats={stats} />;
}
