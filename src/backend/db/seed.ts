import { ALL_ROOMS } from '@/data/rooms';
import { buildRealTenants2026 } from '@/data/real-tenants-2026';

// Placeholder hash awal (akan diganti Bcrypt hash asli saat inisialisasi)
export const DEFAULT_PASSWORD_HASH =
  '$2a$12$K8p5g0M8R7pWbB8J6e2Vye868N87j2i7l4V.bN2/U6OQcW4yv7hO2';

export interface SeedUser {
  id: string;
  name: string;
  nim?: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'ADMIN' | 'PENGELOLA' | 'KEUANGAN' | 'CALON_PENGHUNI' | 'PENGHUNI';
  roomCode?: string;
  isActive: boolean;
  whatsappNotifEnabled?: boolean;
}

export const STAFF_SEED_USERS: SeedUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Ibu Yulastri (Pemilik Kos & Super Admin)',
    nim: 'admin',
    email: 'admin@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '0813-7432-9562',
    role: 'ADMIN',
    isActive: true,
  },
  {
    id: 'usr-pengelola-01',
    name: 'Yanti Susanti (Pengelola Operasional Kos)',
    nim: 'pengelola',
    email: 'pengelola@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '0813-7432-9562',
    role: 'PENGELOLA',
    isActive: true,
  },
  {
    id: 'usr-keuangan-01',
    name: 'Aisyah Fitriani (Staf Keuangan)',
    nim: 'keuangan',
    email: 'keuangan@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '0813-7432-9562',
    role: 'KEUANGAN',
    isActive: true,
  },
];

const realBundlePreview = buildRealTenants2026(DEFAULT_PASSWORD_HASH);

// 1. Akun Pengguna Utama (3 Staf + 88 Penghuni Tetap Kos Omi 2026, 0 Akun Dummy)
export const SEED_USERS: SeedUser[] = [
  ...STAFF_SEED_USERS,
  ...realBundlePreview.users,
];

// 2. Data Hunian Aktif Real Kos Omi 2026 (88 Kontrak Aktif)
export const SEED_TENANCIES = realBundlePreview.tenancies;

// 3. Data Invoice & Transaksi Awal (Kosong Rp 0 — khusus transaksi baru di web)
export const SEED_INVOICES: any[] = [];
export const SEED_PAYMENTS: any[] = [];

// 4. Parameter Bisnis Default
export const SEED_SETTINGS = [
  { key: 'kos_name', value: 'Kos Omi Sungai Bangek, Padang' },
  {
    key: 'kos_address',
    value:
      'Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)',
  },
  { key: 'admin_phone', value: '0813-7432-9562' },
  { key: 'due_day_default', value: '5' },
  { key: 'deposit_percent', value: '0' },
  { key: 'booking_window_hours', value: '24' },
  { key: 'timezone', value: 'Asia/Jakarta' },
];

export async function runSeed() {
  return {
    success: true,
    totalUsers: SEED_USERS.length,
    totalRooms: ALL_ROOMS.length,
    totalTenancies: SEED_TENANCIES.length,
    totalInvoices: SEED_INVOICES.length,
    totalSettings: SEED_SETTINGS.length,
  };
}
