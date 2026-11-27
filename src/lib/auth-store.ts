import type { UserRole } from '@/types/auth';
import { DEFAULT_PASSWORD_HASH, type SeedUser } from '@/db/seed';
import { hashPassword } from '@/lib/auth/password';
import {
  loadPersistentStore,
  savePersistentStore,
  SEED_DEFAULT_PASSWORD,
  type UserAuthRecord,
  type ResetTokenRecord,
} from '@/server/persistence';

export { SEED_DEFAULT_PASSWORD };
export type { ResetTokenRecord };
export type UserAuthState = UserAuthRecord;

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiSeedHashReady: Promise<void> | undefined;
}

export function getAuthUsersStore(): UserAuthState[] {
  return loadPersistentStore().authUsers;
}

/**
 * Akun seed atau akun yang baru dibuat Admin membawa placeholder hash.
 * Saat dibutuhkan untuk verifikasi login, placeholder diganti hash bcrypt asli
 * dari SEED_DEFAULT_PASSWORD lalu disimpan secara persisten.
 */
export async function ensureSeedPasswordHashes(): Promise<void> {
  const data = loadPersistentStore();
  let changed = false;
  for (const user of data.authUsers) {
    if (user.passwordHash === DEFAULT_PASSWORD_HASH || !user.passwordHash.startsWith('$2')) {
      user.passwordHash = await hashPassword(SEED_DEFAULT_PASSWORD);
      changed = true;
    }
  }
  if (changed) {
    savePersistentStore(data);
  }
}

export function getResetTokensStore(): ResetTokenRecord[] {
  return loadPersistentStore().resetTokens;
}

// Helper penentu rute dasbor berdasarkan peran pengguna (PRD Bab 3 & Bab 5)
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

export function findUserById(id: string): UserAuthState | undefined {
  return getAuthUsersStore().find((u) => u.id === id);
}

export function findUserByEmail(identifier: string): UserAuthState | undefined {
  const normalized = identifier.toLowerCase().trim();
  if (!normalized) return undefined;
  const store = getAuthUsersStore();

  // Cari berdasarkan Email, NIM / Username SIAKAD, atau prefix email
  return store.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      (u.nim && u.nim.toLowerCase() === normalized) ||
      u.email.split('@')[0].toLowerCase() === normalized
  );
}
