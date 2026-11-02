import { DemoAccount, UserRole } from '@/types/auth';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'ADMIN',
    roleLabel: 'Admin Utama',
    roleDescription: 'Dasbor Administrator Utama',
    email: 'admin@kosomi.id',
    password: 'Password123!',
    name: 'Ibu Omi (Admin)',
    dashboardPath: '/admin/dashboard',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    role: 'PENGELOLA',
    roleLabel: 'Pengelola Kos',
    roleDescription: 'Dasbor Pengelola Operasional',
    email: 'pengelola@kosomi.id',
    password: 'Password123!',
    name: 'Yanti Susanti (Pengelola)',
    dashboardPath: '/pengelola/dashboard',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    role: 'KEUANGAN',
    roleLabel: 'Staf Keuangan',
    roleDescription: 'Dasbor Staf Keuangan',
    email: 'keuangan@kosomi.id',
    password: 'Password123!',
    name: 'Aisyah Fitriani (Keuangan)',
    dashboardPath: '/keuangan/dashboard',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    role: 'CALON_PENGHUNI',
    roleLabel: 'Calon Penghuni',
    roleDescription: 'Portal Calon Penghuni',
    email: 'calon@example.com',
    password: 'Password123!',
    name: 'Zahra Aulia Putri',
    dashboardPath: '/calon/dashboard',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    role: 'PENGHUNI',
    roleLabel: 'Penghuni Aktif',
    roleDescription: 'Portal Penghuni Aktif',
    email: 'penghuni@example.com',
    password: 'Password123!',
    name: 'Rina Kusuma',
    dashboardPath: '/penghuni/dashboard',
    roomCode: '1',
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
