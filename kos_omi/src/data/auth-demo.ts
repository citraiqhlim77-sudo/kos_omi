import { DemoAccount, UserRole } from '@/types/auth';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'ADMIN',
    roleLabel: 'Admin Sistem',
    roleDescription: 'Akses penuh akun pengguna, master kamar, konfigurasi harga & audit log',
    email: 'admin@kosomi.id',
    password: 'Password123!',
    name: 'Budi Santoso (Admin)',
    dashboardPath: '/admin/dashboard',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    role: 'PENGELOLA',
    roleLabel: 'Pengelola Kos',
    roleDescription: 'Kelola 67 kamar, verifikasi KTP reservasi, check-in & check-out',
    email: 'pengelola@kosomi.id',
    password: 'Password123!',
    name: 'Ahmad Fauzi (Pengelola)',
    dashboardPath: '/pengelola/dashboard',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: 'KEUANGAN',
    roleLabel: 'Staf Keuangan',
    roleDescription: 'Rekapitulasi transaksi Midtrans, pantau tagihan & unduh laporan CSV',
    email: 'keuangan@kosomi.id',
    password: 'Password123!',
    name: 'Siti Rahmawati (Keuangan)',
    dashboardPath: '/keuangan/dashboard',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    role: 'CALON_PENGHUNI',
    roleLabel: 'Calon Penghuni',
    roleDescription: 'Status reservasi aktif, verifikasi dokumen & portal bayar Midtrans',
    email: 'calon@example.com',
    password: 'Password123!',
    name: 'Anisa Permata',
    dashboardPath: '/calon/dashboard',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    role: 'PENGHUNI',
    roleLabel: 'Penghuni Aktif',
    roleDescription: 'Bayar sewa bulanan, kartu kamar, rincian jatuh tempo & riwayat invoice',
    email: 'penghuni@example.com',
    password: 'Password123!',
    name: 'Rina Kusuma',
    dashboardPath: '/penghuni/dashboard',
    roomCode: 'A-101',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
];

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'PENGELOLA':
      return '/pengelola/dashboard';
    case 'KEUANGAN':
      return '/keuangan/dashboard';
    case 'PENGHUNI':
      return '/penghuni/dashboard';
    case 'CALON_PENGHUNI':
    default:
      return '/calon/dashboard';
  }
}
