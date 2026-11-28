import { Metadata } from 'next';
import { fetchRoomsAction,fetchRoomStatsAction } from '@/actions/rooms';
import { ensurePostgresHydrated } from '@/server/persistence';
import { KamarCatalogClient } from '@/components/kamar/KamarCatalogClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await fetchRoomStatsAction();
  const availableCount = stats?.available ?? 0;

  return {
    title: `Katalog 67 Kamar Kos Omi Sungai Bangek, Padang (${availableCount} Tersedia)`,
    description: `Daftar lengkap 67 kamar kos 2 lantai (Kamar No. 1 - 67) di Sungai Bangek Padang dekat Kampus III UIN Imam Bonjol. Tarif Rp 5.000.000 / semester per kamar untuk maksimal 2 orang (boleh 1 orang sendiri Rp 5.000.000 atau berdua Rp 2.500.000 per orang, tanpa biaya deposit).`,
    alternates: {
      canonical: 'https://kosomi.id/kamar',
    },
    openGraph: {
      title: `Katalog 67 Kamar Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Siap Huni`,
      description: `Lihat ketersediaan kamar Lantai 1 (No. 1-33) & Lantai 2 (No. 34-67) di Kos Omi Sungai Bangek Padang. Tarif Rp 5.000.000/semester per kamar (maksimal 2 orang, tanpa deposit).`,
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
  // Ambil seluruh kamar, statistik, dan daftar kamar yang masih menerima 1 orang lagi (sisa 1 slot)
  const [rooms, stats, store] = await Promise.all([
    fetchRoomsAction(),
    fetchRoomStatsAction(),
    ensurePostgresHydrated(),
  ]);

  const usedSlotsByRoom = new Map<string, number>();
  for (const ten of store.tenancies) {
    if (ten.status === 'AKTIF') {
      const slots = ten.monthlyPrice <= 2500000 ? 1 : 2;
      usedSlotsByRoom.set(ten.roomCode, (usedSlotsByRoom.get(ten.roomCode) || 0) + slots);
    }
  }
  for (const rsv of store.reservations) {
    if (rsv.status === 'PENDING_REVIEW' || rsv.status === 'APPROVED' || rsv.status === 'PAID') {
      const isOneSlot =
        (rsv.userOccupation || '').includes('1 Slot Sendiri') || rsv.monthlyPrice <= 2500000;
      const slots = isOneSlot ? 1 : 2;
      usedSlotsByRoom.set(rsv.roomCode, (usedSlotsByRoom.get(rsv.roomCode) || 0) + slots);
    }
  }
  const openSlotRoomCodes = rooms
    .filter((r) => r.status !== 'TERSEDIA' && r.status !== 'NONAKTIF' && usedSlotsByRoom.get(r.code) === 1)
    .map((r) => r.code);

  return (
    <KamarCatalogClient
      initialRooms={rooms}
      initialStats={stats}
      openSlotRoomCodes={openSlotRoomCodes}
    />
  );
}
