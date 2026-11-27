import type { SeedUser } from '@/db/seed';
import type { TenancyRecord } from '@/types/tenancy';
import type { TenantProfile } from '@/types/billing';

/**
 * DATA REAL PENGHUNI TETAP KAMAR KOS OMI 2026 (Kamar 01 s/d 67)
 * - 57 Kamar Terisi (26 kamar sendiri + 31 kamar berdua = 88 penghuni tetap)
 * - 10 Kamar Kosong / Tersedia: 1, 17, 24, 37, 39, 40, 41, 53, 54, 57
 */
export const REAL_ROOM_OCCUPANTS_2026: Record<number, string[]> = {
  1: [],
  2: ['Maulidia'],
  3: ['Ratu'],
  4: ['Dela', 'Febri'],
  5: ['Qori'],
  6: ['Sofi'],
  7: ['Mita'],
  8: ['Mifta', 'Khana'],
  9: ['Septii'],
  10: ['Hafizah', 'Aisyah'],
  11: ['Laisa'],
  12: ['Diva', 'Isil'],
  13: ['Ipit'],
  14: ['Asih'],
  15: ['Zulfa'],
  16: ['Ifa', 'Meta'],
  17: [],
  18: ['Epin'],
  19: ['Nabila', 'Sulis'],
  20: ['Nefa', 'Thasa'],
  21: ['Aya', 'Amel'],
  22: ['Patmi'],
  23: ['Ranti', 'Syukria'],
  24: [],
  25: ['Ara'],
  26: ['Tania'],
  27: ['Alda'],
  28: ['Tari', 'Merlen'],
  29: ['Omi'],
  30: ['Ayu', 'Setya'],
  31: ['Denada', 'Mutiara'],
  32: ['Fetty', 'Tania'],
  33: ['Indira', 'Fadila'],
  34: ['Chantika'],
  35: ['Indah'],
  36: ['Tila', 'Anisa'],
  37: [],
  38: ['Tiwi'],
  39: [],
  40: [],
  41: [],
  42: ['Laras', 'Risna'],
  43: ['Stella', 'Widya'],
  44: ['Pipi', 'Viona'],
  45: ['Cinta'],
  46: ['Fipah', 'Aini'],
  47: ['Yola'],
  48: ['Humairah', 'Zilfa'],
  49: ['Hamidah', 'Dwi S'],
  50: ['Pebri', 'Marhamah'],
  51: ['Khaira', 'Nabila'],
  52: ['Tipa'],
  53: [],
  54: [],
  55: ['Ai'],
  56: ['Lidia', 'Ika'],
  57: [],
  58: ['Aza', 'Masnah'],
  59: ['Eci', 'Zahra'],
  60: ['Zensya', 'Khaira'],
  61: ['Salsa'],
  62: ['Mita', 'Nifa'],
  63: ['Nada', 'Risa'],
  64: ['Najla'],
  65: ['Rani'],
  66: ['Sofia', 'Pitri'],
  67: ['Najwa', 'Viodora'],
};

export interface RealTenantBundle2026 {
  occupiedRoomCodes: Set<string>;
  users: SeedUser[];
  tenancies: TenancyRecord[];
  profiles: TenantProfile[];
}

function toEmailSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

export function buildRealTenants2026(passwordHash: string): RealTenantBundle2026 {
  const occupiedRoomCodes = new Set<string>();
  const users: SeedUser[] = [];
  const tenancies: TenancyRecord[] = [];
  const profiles: TenantProfile[] = [];

  for (let roomNum = 1; roomNum <= 67; roomNum++) {
    const names = REAL_ROOM_OCCUPANTS_2026[roomNum] || [];
    if (names.length === 0) continue;

    const roomCode = String(roomNum);
    const paddedRoom = String(roomNum).padStart(2, '0');
    const floor = roomNum <= 33 ? 1 : 2;
    occupiedRoomCodes.add(roomCode);

    // Tarif per kamar Rp 5.000.000/semester (sendiri Rp 5.000.000, berdua Rp 2.500.000/orang)
    const perPersonSemesterPrice = names.length >= 2 ? 2500000 : 5000000;

    names.forEach((rawName, idx) => {
      const cleanName = rawName.trim();
      const slug = toEmailSlug(cleanName);
      const nimCode = `${slug}.k${paddedRoom}`;
      const email = `${nimCode}@kosomi.id`;
      const userId = `usr-k${paddedRoom}-${idx + 1}-${slug.replace(/\./g, '-')}`;
      const tenancyId = `ten-2026-k${paddedRoom}-${idx + 1}`;
      const seqNum = String(roomNum * 10 + (idx + 1)).padStart(4, '0');
      const placeholderPhone = `-`;

      users.push({
        id: userId,
        name: cleanName,
        nim: nimCode,
        email,
        passwordHash,
        phone: placeholderPhone,
        role: 'PENGHUNI',
        roomCode,
        isActive: true,
        whatsappNotifEnabled: true,
      });

      tenancies.push({
        id: tenancyId,
        userId,
        userName: cleanName,
        userEmail: email,
        userPhone: placeholderPhone,
        userNik: `2026${seqNum}`,
        idCardUrl: `/rooms/kamar-${roomCode}.png`,
        roomId: `room-${roomCode}`,
        roomCode,
        roomFloor: floor,
        roomType: roomNum % 3 === 1 ? 'DELUXE_AC' : roomNum % 3 === 2 ? 'STANDAR_AC' : 'STANDAR_NON_AC',
        monthlyPrice: perPersonSemesterPrice,
        depositAmount: 0,
        checkInDate: '2026-07-01',
        contractEndDate: '2026-12-31',
        checkOutDate: null,
        dueDay: 5,
        status: 'AKTIF',
        depositRefunded: false,
        unpaidBillsCount: 0,
        totalUnpaidAmount: 0,
        unpaidInvoices: [],
        pastInvoices: [],
        emergencyContact: {
          name: 'Orang Tua / Wali',
          relation: 'Keluarga',
          phone: '-',
        },
      });

      profiles.push({
        id: userId,
        name: cleanName,
        nik: `2026${seqNum}`,
        email,
        phone: placeholderPhone,
        occupation:
          names.length >= 2
            ? `Penghuni Tetap Kos Omi 2026 (Berdua Sekamar)`
            : `Penghuni Tetap Kos Omi 2026 (Sendiri 1 Kamar)`,
        roomCode,
        checkInDate: '2026-07-01',
        tenancyEnd: '2026-12-31',
        emergencyContactName: 'Orang Tua / Wali',
        emergencyContactRelation: 'Keluarga',
        emergencyContactPhone: '-',
        monthlyRent: perPersonSemesterPrice,
        avatarUrl: `/rooms/kamar-${roomCode}.png`,
      });
    });
  }

  return {
    occupiedRoomCodes,
    users,
    tenancies,
    profiles,
  };
}
