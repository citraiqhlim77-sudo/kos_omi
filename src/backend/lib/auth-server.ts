import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/auth';
import { auth } from '@/auth';
import { findUserById, findUserByEmail } from '@/lib/auth-store';
import { ensurePostgresHydrated } from '@/server/persistence';

export interface CurrentServerUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
}

/**
 * Mendapatkan pengguna yang sedang login dari sesi JWT Auth.js dan memverifikasinya
 * langsung terhadap data pengguna terbaru di Neon PostgreSQL.
 */
export async function getCurrentUser(): Promise<CurrentServerUser | null> {
  await ensurePostgresHydrated();

  const session = await auth();
  const sessionUser = session?.user;
  if (!sessionUser?.id && !sessionUser?.email) {
    return null;
  }

  const user =
    (sessionUser.id ? findUserById(sessionUser.id) : undefined) ||
    (sessionUser.email ? findUserByEmail(sessionUser.email) : undefined);

  if (user) {
    if (!user.isActive) {
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

  if (sessionUser.email && sessionUser.isActive !== false) {
    return {
      id: (sessionUser.id as string) || `usr-${Date.now()}`,
      name: sessionUser.name || sessionUser.email.split('@')[0],
      email: sessionUser.email,
      role: (sessionUser.role as UserRole) || 'CALON_PENGHUNI',
      isActive: true,
    };
  }

  return null;
}

/**
 * Helper otorisasi ketat peran pengguna di Server Action, Layout, & Route Handler.
 * - Belum login / akun nonaktif -> langsung arahkan ke /login.
 * - Sudah login tetapi peran tidak diizinkan -> langsung arahkan ke /403.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options?: { strictExactRole?: boolean }
): Promise<CurrentServerUser> {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect('/login');
  }

  const isAllowed = options?.strictExactRole
    ? allowedRoles.includes(user.role)
    : user.role === 'ADMIN' || allowedRoles.includes(user.role);

  if (!isAllowed) {
    redirect('/403');
  }

  return user;
}

/**
 * Proteksi ketat level halaman portal agar setiap role hanya dapat membuka portalnya sendiri.
 */
export async function requireStrictPortalRole(role: UserRole): Promise<CurrentServerUser> {
  return requireRole([role], { strictExactRole: true });
}

export async function requireAuth(): Promise<CurrentServerUser> {
  return requireRole(['ADMIN', 'PENGELOLA', 'KEUANGAN', 'PENGHUNI', 'CALON_PENGHUNI']);
}
