import type { UserRole } from '@/types/auth';
import { SEED_USERS, DEFAULT_PASSWORD_HASH, type SeedUser } from '@/db/seed';
import { hashPassword } from '@/lib/auth/password';

// State in-memory pengguna & proteksi brute force login.
// Field `failedLoginCount` / `lockedUntil` dipetakan 1:1 ke kolom
// `failed_login_count` / `locked_until` pada tabel users (PRD Bab 10).
// Sengaja dipisah dari src/actions/auth.ts karena file 'use server'
// hanya boleh mengekspor fungsi async.
export interface UserAuthState extends SeedUser {
  failedLoginCount: number;
  lockedUntil?: string | null;
}

export interface ResetTokenRecord {
  /** SHA-256 dari token mentah. Token mentah tidak pernah disimpan. */
  tokenHash: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
}

/** Kata sandi akun seed untuk pengembangan lokal. */
export const SEED_DEFAULT_PASSWORD = 'Password123!';

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiAuthUsers: UserAuthState[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiResetTokens: ResetTokenRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiSeedHashReady: Promise<void> | undefined;
}

export function getAuthUsersStore(): UserAuthState[] {
  if (!global.__kosOmiAuthUsers) {
    global.__kosOmiAuthUsers = SEED_USERS.map((u) => ({
      ...u,
      failedLoginCount: 0,
      lockedUntil: null,
    }));
  }
  return global.__kosOmiAuthUsers;
}

/**
 * Akun seed membawa placeholder hash. Saat pertama dibutuhkan, placeholder
 * diganti hash bcrypt cost 12 yang asli dari SEED_DEFAULT_PASSWORD.
 * Dijalankan sekali per proses server.
 */
export function ensureSeedPasswordHashes(): Promise<void> {
  if (!global.__kosOmiSeedHashReady) {
    global.__kosOmiSeedHashReady = (async () => {
      const realHash = await hashPassword(SEED_DEFAULT_PASSWORD);
      for (const user of getAuthUsersStore()) {
        if (user.passwordHash === DEFAULT_PASSWORD_HASH) {
          user.passwordHash = realHash;
        }
      }
    })();
  }
  return global.__kosOmiSeedHashReady;
}

export function getResetTokensStore(): ResetTokenRecord[] {
  if (!global.__kosOmiResetTokens) {
    global.__kosOmiResetTokens = [];
  }
  return global.__kosOmiResetTokens;
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

export function findUserByEmail(email: string): UserAuthState | undefined {
  const normalized = email.toLowerCase().trim();
  return getAuthUsersStore().find((u) => u.email.toLowerCase() === normalized);
}
