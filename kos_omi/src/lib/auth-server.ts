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

  if (!user) {
    redirect('/login?from=unauthorized');
  }

  if (!user.isActive) {
    redirect('/login?error=Akun+Anda+telah+dinonaktifkan.+Silakan+hubungi+admin.');
  }

  // Admin selalu memiliki akses penuh atau peran yang diminta harus cocok
  if (user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
    redirect('/403');
  }

  return user;
}

/**
 * Helper otorisasi untuk memastikan pengguna sudah login dengan peran apapun yang aktif.
 */
export async function requireAuth(): Promise<CurrentServerUser> {
  return requireRole(['ADMIN', 'PENGELOLA', 'KEUANGAN', 'PENGHUNI', 'CALON_PENGHUNI']);
}
