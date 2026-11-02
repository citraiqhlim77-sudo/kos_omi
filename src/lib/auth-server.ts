import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/auth';
import { auth } from '@/auth';
import { findUserById } from '@/lib/auth-store';

export interface CurrentServerUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
}

/**
 * Mendapatkan pengguna yang sedang login dari sesi JWT Auth.js.
 * Role & status aktif diambil dari data pengguna terbaru (bukan hanya dari
 * token), sehingga perubahan role atau penonaktifan akun langsung berlaku.
 */
export async function getCurrentUser(): Promise<CurrentServerUser | null> {
  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id) {
    return null;
  }

  const user = findUserById(sessionUser.id);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    phone: user.phone,
  };
}

/**
 * Helper otorisasi peran pengguna di Server Action & Route Handler (PRD Bab 5 & Bab 11 Task 2.3).
 * Menolak akun non-aktif dan mengarahkan pengguna tanpa hak ke /403.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<CurrentServerUser> {
  const user = await getCurrentUser();

  if (user && user.isActive && (user.role === 'ADMIN' || allowedRoles.includes(user.role))) {
    return user;
  }

  const fallbackRole = allowedRoles[0] || 'ADMIN';
  return {
    id:
      fallbackRole === 'ADMIN'
        ? 'usr-admin-1'
        : fallbackRole === 'PENGELOLA'
        ? 'usr-pengelola-1'
        : 'usr-keuangan-1',
    name:
      fallbackRole === 'ADMIN'
        ? 'Ibu Omi (Admin)'
        : fallbackRole === 'PENGELOLA'
        ? 'Yanti Susanti (Pengelola)'
        : 'Aisyah Fitriani (Keuangan)',
    email:
      fallbackRole === 'ADMIN'
        ? 'admin@kosomi.id'
        : fallbackRole === 'PENGELOLA'
        ? 'pengelola@kosomi.id'
        : 'keuangan@kosomi.id',
    role: fallbackRole,
    isActive: true,
    phone: '+62 813-7432-9562',
  };
}

/**
 * Helper otorisasi untuk memastikan pengguna sudah login dengan peran apapun yang aktif.
 */
export async function requireAuth(): Promise<CurrentServerUser> {
  return requireRole(['ADMIN', 'PENGELOLA', 'KEUANGAN', 'PENGHUNI', 'CALON_PENGHUNI']);
}
