import { Room, RoomType, RoomStatus } from '@/types/room';

// Foto kamar nyata berkualitas tinggi
const ROOM_PHOTOS = {
  DELUXE: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
  ],
  STANDAR_AC: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
  ],
  STANDAR_NON_AC: [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
  ],
};

const COMMON_FACILITIES = [
  'Kasur Springbed Berkualitas',
  'Lemari Pakaian 2 Pintu',
  'Meja Kerja & Belajar',
  'Kursi Ergonomis',
  'Wi-Fi Kecepatan Tinggi 100 Mbps',
  'Sirkulasi Udara & Jendela Luar',
  'Token Listrik Mandiri Tiap Kamar',
];

const DELUXE_FACILITIES = [
  ...COMMON_FACILITIES,
  'AC Daikin 1/2 PK Hemat Energi',
  'Kamar Mandi Dalam dengan Shower',
  'Water Heater Otomatis',
  'Kloset Duduk Toto & Bidet',
  'Cermin Rias & Rak Dinding',
];

const STANDAR_AC_FACILITIES = [
  ...COMMON_FACILITIES,
  'AC Daikin 1/2 PK Hemat Energi',
  'Kamar Mandi Luar Bersih (Rasio 1:2)',
  'Cermin Dinding',
];

const STANDAR_NON_AC_FACILITIES = [
  ...COMMON_FACILITIES,
  'Kipas Angin Dinding Cosmos',
  'Exhaust Fan Sirkulasi Sejuk',
  'Kamar Mandi Luar Bersih (Rasio 1:2)',
];

function generateRooms(): Room[] {
  const rooms: Room[] = [];

  // Konfigurasi 5 Lantai (Total 67 Kamar)
  const floorConfigs = [
    { floor: 1, prefix: 'A', start: 101, end: 116 }, // 16 kamar
    { floor: 2, prefix: 'B', start: 201, end: 216 }, // 16 kamar
    { floor: 3, prefix: 'C', start: 301, end: 316 }, // 16 kamar
    { floor: 4, prefix: 'D', start: 401, end: 416 }, // 16 kamar
    { floor: 5, prefix: 'E', start: 501, end: 503 }, // 3 kamar (lantai paling atas dekat rooftop)
  ];

  floorConfigs.forEach(({ floor, prefix, start, end }) => {
    for (let codeNum = start; codeNum <= end; codeNum++) {
      const code = `${prefix}-${codeNum}`;
      const indexWithinFloor = codeNum - start;

      // Penentuan tipe kamar berdasarkan zonasi lantai
      let type: RoomType;
      let monthlyPrice: number;
      let depositAmount: number;
      let areaSqm: number;
      let facilities: string[];
      let photos: string[];
      let description: string;

      // Lantai 5 seluruhnya Deluxe AC
      // Lantai 1-4: 6 Deluxe, 6 Standar AC, 4 Standar Non-AC
      if (floor === 5 || indexWithinFloor < 6) {
        type = 'DELUXE_AC';
        monthlyPrice = 1450000;
        depositAmount = 1450000;
        areaSqm = 16 + (codeNum % 3);
        facilities = DELUXE_FACILITIES;
        photos = ROOM_PHOTOS.DELUXE;
        description = `Kamar tipe Deluxe AC di Lantai ${floor} Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol). Dilengkapi kamar mandi dalam dengan pemanas air (water heater), kasur springbed ukuran 120x200, pendingin ruangan (AC), serta jendela luas dengan pencahayaan alami yang melimpah. Sangat tenang dan nyaman untuk istirahat maupun fokus belajar/bekerja.`;
      } else if (indexWithinFloor < 12) {
        type = 'STANDAR_AC';
        monthlyPrice = 1100000;
        depositAmount = 1100000;
        areaSqm = 13 + (codeNum % 2);
        facilities = STANDAR_AC_FACILITIES;
        photos = ROOM_PHOTOS.STANDAR_AC;
        description = `Kamar tipe Standar AC di Lantai ${floor} Kos Omi Sungai Bangek. Suasana sejuk dengan pendingin ruangan hemat energi, meja kerja/belajar luas, lemari pakaian 2 pintu, dan akses dekat ke kamar mandi luar yang selalu terjaga kebersihannya oleh petugas harian.`;
      } else {
        type = 'STANDAR_NON_AC';
        monthlyPrice = 750000;
        depositAmount = 750000;
        areaSqm = 11 + (codeNum % 2);
        facilities = STANDAR_NON_AC_FACILITIES;
        photos = ROOM_PHOTOS.STANDAR_NON_AC;
        description = `Kamar tipe Standar Non-AC ekonomis di Lantai ${floor} Kos Omi Sungai Bangek. Pilihan ideal mahasiswa UIN Imam Bonjol Padang, sejuk berkat ventilasi silang dan kipas angin dinding, dilengkapi perabot siap huni serta Wi-Fi kencang.`;
      }

      // Distribusi Status Kamar Nyata sesuai PRD Bab 9:
      let status: RoomStatus = 'TERSEDIA';

      // Skenario dummy PRD:
      if (code === 'B-205' || code === 'C-310' || code === 'D-402') {
        status = 'TERISI'; // Penghuni aktif (Rina, Dimas, Siti)
      } else if (code === 'A-112') {
        status = 'DIPESAN'; // Reservasi disetujui Anisa Permata
      } else if (code === 'A-101' || code === 'D-404') {
        status = 'TERSEDIA'; // A-101 tersedia untuk demonstrasi detail kamar dan reservasi
      } else if (code === 'B-214' || code === 'D-416') {
        status = 'NONAKTIF'; // Perawatan berkala / cat
      } else if (codeNum % 7 === 0 || codeNum % 9 === 0) {
        status = 'TERISI';
      } else if (codeNum % 11 === 0) {
        status = 'DIPESAN';
      }

      rooms.push({
        id: `room-${code.toLowerCase()}`,
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
        bedType: type === 'DELUXE_AC' ? 'Single Bed (120 x 200)' : 'Single Bed (100 x 200)',
        windowView: floor >= 3 ? 'Pemandangan Perbukitan Sungai Bangek & Kampus UIN' : 'Pemandangan Taman Inner Court',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-10-28T00:00:00.000Z',
      });
    }
  });

  return rooms;
}

export const ALL_ROOMS: Room[] = generateRooms();

export function getRoomByCode(code: string): Room | undefined {
  const normalized = code.toUpperCase().trim();
  return ALL_ROOMS.find((r) => r.code === normalized);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
