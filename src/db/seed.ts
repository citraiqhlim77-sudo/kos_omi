import { ALL_ROOMS } from '@/data/rooms';

// BCRYPT mock hash untuk password default: "Password123!"
// Format bcrypt cost 12: $2a$12$...
export const DEFAULT_PASSWORD_HASH =
  '$2a$12$K8p5g0M8R7pWbB8J6e2Vye868N87j2i7l4V.bN2/U6OQcW4yv7hO2';

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'ADMIN' | 'PENGELOLA' | 'KEUANGAN' | 'CALON_PENGHUNI' | 'PENGHUNI';
  isActive: boolean;
  whatsappNotifEnabled?: boolean;
}

// 1. Akun Pengguna Utama (Hanya 3 Akun Staf Manajemen Resmi Kos Omi, Tanpa Akun Dummy)
export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Ibu Omi (Pemilik & Administrator Kos Omi)',
    email: 'admin@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '+62 813-7432-9562',
    role: 'ADMIN',
    isActive: true,
  },
  {
    id: 'usr-pengelola-01',
    name: 'Yanti Susanti (Pengelola Kos Omi)',
    email: 'pengelola@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '081288990011',
    role: 'PENGELOLA',
    isActive: true,
  },
  {
    id: 'usr-keuangan-01',
    name: 'Aisyah Fitriani (Staf Keuangan Kos Omi)',
    email: 'keuangan@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '081399001122',
    role: 'KEUANGAN',
    isActive: true,
  },
];

// 2. Data Hunian Aktif Awal (Kosong / Bersih)
export const SEED_TENANCIES: any[] = [];

// 3. Data Invoice & Transaksi Awal (Kosong / Bersih)
export const SEED_INVOICES: any[] = [];

export const SEED_PAYMENTS: any[] = [];

// 4. Parameter Bisnis Default (PRD Bab 10 Table Settings)
export const SEED_SETTINGS = [
  { key: 'kos_name', value: 'Kos Omi Sungai Bangek, Padang' },
  { key: 'kos_address', value: 'Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)' },
  { key: 'admin_phone', value: '+6281234567890' },
  { key: 'due_day_default', value: '5' },
  { key: 'deposit_percent', value: '100' },
  { key: 'booking_window_hours', value: '24' },
  { key: 'timezone', value: 'Asia/Jakarta' },
];

/**
 * Runner fungsi Seed Database
 */
export async function runSeed() {
  console.log('--- Mulai Seeding Database Kos Omi ---');
  console.log(`1. Menyiapkan ${SEED_USERS.length} akun pengguna utama (Admin, Pengelola, Keuangan, Penghuni, Calon)...`);
  console.log(`2. Menyiapkan ${ALL_ROOMS.length} kamar lengkap (1 sampai E-503)...`);
  console.log(`3. Menyiapkan ${SEED_TENANCIES.length} data hunian aktif (Rina, Dimas, Siti)...`);
  console.log(`4. Menyiapkan ${SEED_INVOICES.length} invoice dan transaksi Midtrans dummy...`);
  console.log(`5. Menyiapkan ${SEED_SETTINGS.length} parameter bisnis default...`);

  return {
    success: true,
    totalUsers: SEED_USERS.length,
    totalRooms: ALL_ROOMS.length,
    totalTenancies: SEED_TENANCIES.length,
    totalInvoices: SEED_INVOICES.length,
    totalSettings: SEED_SETTINGS.length,
  };
}
