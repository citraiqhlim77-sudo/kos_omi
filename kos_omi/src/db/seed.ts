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

// 1. Akun Pengguna Utama (Sesuai Bab 5 & Bab 10 PRD)
export const SEED_USERS: SeedUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Omi Pratama (Owner & Super Admin)',
    email: 'admin@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281234567890',
    role: 'ADMIN',
    isActive: true,
  },
  {
    id: 'usr-pengelola-01',
    name: 'Yanti Susanti (Pengelola Lapangan)',
    email: 'pengelola@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281234567891',
    role: 'PENGELOLA',
    isActive: true,
  },
  {
    id: 'usr-keuangan-01',
    name: 'Arif Hidayat (Staf Keuangan)',
    email: 'keuangan@kosomi.id',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281234567892',
    role: 'KEUANGAN',
    isActive: true,
  },
  {
    id: 'usr-penghuni-01',
    name: 'Rina Kusuma (Penghuni Kamar A-101)',
    email: 'penghuni@example.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281211112222',
    role: 'PENGHUNI',
    isActive: true,
  },
  {
    id: 'usr-calon-01',
    name: 'Anisa Permata (Calon Penghuni)',
    email: 'calon@example.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281298765432',
    role: 'CALON_PENGHUNI',
    isActive: true,
  },
  {
    id: 'usr-penghuni-02',
    name: 'Dimas Prasetyo (Penghuni Kamar B-204)',
    email: 'dimas@example.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281299998888',
    role: 'PENGHUNI',
    isActive: true,
  },
  {
    id: 'usr-penghuni-03',
    name: 'Siti Nurhaliza (Penghuni Kamar C-302)',
    email: 'siti@example.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    phone: '6281377776666',
    role: 'PENGHUNI',
    isActive: true,
  },
];

// 2. Data Dummy Hunian Aktif (Tenancies)
export const SEED_TENANCIES = [
  {
    id: 'ten-rina-101',
    userId: 'usr-penghuni-01',
    roomCode: 'A-101',
    checkInDate: '2025-01-03',
    contractEndDate: '2026-01-03',
    monthlyPrice: 1450000,
    dueDay: 5,
    status: 'AKTIF' as const,
  },
  {
    id: 'ten-dimas-204',
    userId: 'usr-penghuni-02',
    roomCode: 'B-204',
    checkInDate: '2025-02-10',
    contractEndDate: '2025-08-10',
    monthlyPrice: 1100000,
    dueDay: 5,
    status: 'AKTIF' as const,
  },
  {
    id: 'ten-siti-302',
    userId: 'usr-penghuni-03',
    roomCode: 'C-302',
    checkInDate: '2025-03-01',
    contractEndDate: '2026-03-01',
    monthlyPrice: 750000,
    dueDay: 5,
    status: 'AKTIF' as const,
  },
];

// 3. Data Dummy Invoice & Transaksi Gateway Midtrans
export const SEED_INVOICES = [
  {
    id: 'inv-dummy-00045',
    invoiceNumber: 'INV-202506-00045',
    userId: 'usr-penghuni-01',
    roomCode: 'A-101',
    type: 'SEWA_BULANAN' as const,
    periodMonth: '2025-06',
    amount: 1450000,
    dueDate: '2025-06-05',
    status: 'LUNAS' as const,
    midtransOrderId: 'KOS-202506-00012',
    paidAt: '2025-06-03T10:15:22+07:00',
  },
  {
    id: 'inv-dummy-00046',
    invoiceNumber: 'INV-202506-00046',
    userId: 'usr-penghuni-03',
    roomCode: 'C-302',
    type: 'SEWA_BULANAN' as const,
    periodMonth: '2025-06',
    amount: 750000,
    dueDate: '2025-06-05',
    status: 'BELUM_BAYAR' as const,
    midtransOrderId: 'KOS-202506-00013',
  },
];

export const SEED_PAYMENTS = [
  {
    id: 'pay-001',
    invoiceId: 'inv-dummy-00045',
    midtransOrderId: 'KOS-202506-00012',
    midtransTransactionId: '98d5a231-50e8-48b4-8252-9bc54b670001',
    paymentType: 'qris',
    grossAmount: 1450000,
    transactionStatus: 'settlement',
    fraudStatus: 'accept',
    settlementTime: '2025-06-03T10:15:22+07:00',
  },
];

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
  console.log(`2. Menyiapkan ${ALL_ROOMS.length} kamar lengkap (A-101 sampai E-503)...`);
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
