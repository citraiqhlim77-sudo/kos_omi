import { Room,RoomType,RoomStatus } from '@/types/room';

// Koleksi foto kamar kos mahasiswi menggunakan aset lokal /rooms/kamar-1.png s/d /rooms/kamar-67.png (100% bebas 404)
export const AESTHETIC_ROOM_PHOTOS = [
  '/rooms/kamar-1.png',
  '/rooms/kamar-2.png',
  '/rooms/kamar-3.png',
  '/rooms/kamar-4.png',
  '/rooms/kamar-5.png',
  '/rooms/kamar-6.png',
  '/rooms/kamar-7.png',
  '/rooms/kamar-8.png',
];

export const AESTHETIC_BATHROOM_PHOTO = '/rooms/kamar-9.png';

export const AESTHETIC_STUDY_PHOTO = '/rooms/kamar-10.png';

// Fasilitas di dalam kamar Kos Omi
export const KOS_OMI_FACILITIES = [
  'Kamar Mandi Dalam',
  'Kasur',
  'Lemari',
];

function generateRooms(): Room[] {
  const rooms: Room[] = [];

  // Penomoran kamar berurutan No. 1 sampai No. 67:
  // Lantai 1 (bawah): Kamar No. 1 s/d No. 33 (33 kamar)
  // Lantai 2 (atas):  Kamar No. 34 s/d No. 67 (34 kamar)
  for (let num = 1; num <= 67; num++) {
    const code = String(num);
    const floor = num <= 33 ? 1 : 2;

    let type: RoomType;
    if (num % 3 === 1) {
      type = 'DELUXE_AC';
    } else if (num % 3 === 2) {
      type = 'STANDAR_AC';
    } else {
      type = 'STANDAR_NON_AC';
    }

    const primaryPhoto = `/rooms/kamar-${num}.png`;
    const secondaryPhoto = `/rooms/kamar-${(num % 67) + 1}.png`;
    const tertiaryPhoto = `/rooms/kamar-${((num + 1) % 67) + 1}.png`;
    const quaternaryPhoto = `/rooms/kamar-${((num + 2) % 67) + 1}.png`;
    const photos = [
      primaryPhoto,
      secondaryPhoto,
      tertiaryPhoto,
      quaternaryPhoto,
    ];

    // Tarif seragam Rp 5.000.000 per semester per kamar (Lantai 1 & Lantai 2, kapasitas 1 kamar 2 orang putri)
    const monthlyPrice = 5000000;
    const depositAmount = 0;
    const areaSqm = 16;
    const facilities = KOS_OMI_FACILITIES;
    const description = `Kamar No. ${code} di Lantai ${floor} Kos Omi (Sungai Bangek, dekat Kampus III UIN Imam Bonjol Padang). Kapasitas 2 orang per kamar dengan kamar mandi dalam, kasur, lemari, dan fasilitas lengkap.`;

    const status: RoomStatus = 'TERSEDIA';

    rooms.push({
      id: `room-${code}`,
      code,
      floor,
      type,
      status,
      areaSqm,
      monthlyPrice,
      depositAmount,
      facilities,
      description,
      photoUrls: photos,
      bedType: '2 Orang / Kamar (Kasur & Lemari)',
      windowView:
        floor === 2
          ? 'Pemandangan Asri Sungai Bangek & Lingkungan Kampus III UIN'
          : 'Area Koridor Dalam Kos Putri yang Tenang & Bersih',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-10-28T00:00:00.000Z',
    });
  }

  return rooms;
}

export const ALL_ROOMS: Room[] = generateRooms();

const LEGACY_ROOM_MAP: Record<string, string> = {
  'A-101': '1',
  'A-105': '5',
  'A-112': '12',
  'B-201': '15',
  'B-202': '16',
  'B-203': '17',
  'B-204': '18',
  'D-402': '20',
  'D-404': '22',
  'B-205': '35',
  'B-214': '44',
  'C-302': '45',
  'C-305': '48',
  'C-310': '45',
  'D-416': '60',
};

export function getRoomByCode(code: string): Room | undefined {
  const normalized = code.toUpperCase().trim().replace(/^(KAMAR\s*)?(NO\.?\s*)?/i, '');
  const mapped = LEGACY_ROOM_MAP[normalized] || String(parseInt(normalized, 10) || normalized);
  return ALL_ROOMS.find((r) => r.code === mapped);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
