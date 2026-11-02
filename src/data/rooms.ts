import { Room, RoomType, RoomStatus } from '@/types/room';

// Koleksi foto kamar kos mahasiswi modern, estetik, hangat, bersih, dan profesional
export const AESTHETIC_ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=85',
];

export const AESTHETIC_BATHROOM_PHOTO =
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85';

export const AESTHETIC_STUDY_PHOTO =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=85';

// 9 Fasilitas Resmi Kos Omi
export const KOS_OMI_FACILITIES = [
  'Kasur & Lemari (2 Orang)',
  'Kamar Mandi Dalam',
  'Ruang Belajar Umum',
  'Dapur & Area Cuci',
  'CCTV 24 Jam',
  'Wi-Fi, TV & Kulkas',
  'Alat Olahraga',
  'Parkir Motor Dalam',
  'Keamanan 24 Jam',
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

    const primaryPhoto = AESTHETIC_ROOM_PHOTOS[(num - 1) % AESTHETIC_ROOM_PHOTOS.length];
    const secondaryPhoto = AESTHETIC_ROOM_PHOTOS[(num + 2) % AESTHETIC_ROOM_PHOTOS.length];
    const photos = [
      primaryPhoto,
      secondaryPhoto,
      AESTHETIC_BATHROOM_PHOTO,
      AESTHETIC_STUDY_PHOTO,
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
