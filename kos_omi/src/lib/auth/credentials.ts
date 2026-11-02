import type { UserRole } from '@/types/auth';
import { verifyPassword } from '@/lib/auth/password';
import { ensureSeedPasswordHashes, findUserByEmail } from '@/lib/auth-store';

// PRD Task 2.2: maksimal 5 kali gagal, lalu akun dikunci 15 menit.
export const MAX_FAILED_LOGIN = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export type CredentialsFailure =
  | { ok: false; reason: 'INVALID'; remainingAttempts: number | null }
  | { ok: false; reason: 'LOCKED'; minutesLeft: number }
  | { ok: false; reason: 'INACTIVE' };

export type CredentialsResult =
  | { ok: true; user: { id: string; name: string; email: string; role: UserRole; isActive: boolean } }
  | CredentialsFailure;

/**
 * Memverifikasi email + kata sandi, sekaligus menjalankan pembatasan
 * login gagal (`failed_login_count`, `locked_until`).
 */
export async function verifyCredentials(email: string, password: string): Promise<CredentialsResult> {
  await ensureSeedPasswordHashes();

  const user = findUserByEmail(email);

  // Email tidak terdaftar: tetap jalankan bcrypt agar waktu respons setara
  // dan keberadaan akun tidak bisa ditebak dari lamanya proses.
  if (!user) {
    await verifyPassword(password, '$2a$12$' + 'x'.repeat(53));
    return { ok: false, reason: 'INVALID', remainingAttempts: null };
  }

  if (!user.isActive) {
    return { ok: false, reason: 'INACTIVE' };
  }

  const now = Date.now();
  if (user.lockedUntil) {
    const lockEnd = new Date(user.lockedUntil).getTime();
    if (now < lockEnd) {
      return { ok: false, reason: 'LOCKED', minutesLeft: Math.ceil((lockEnd - now) / 60000) };
    }
    // Masa kunci habis: mulai hitungan baru.
    user.lockedUntil = null;
    user.failedLoginCount = 0;
  }

  const isMatch = await verifyPassword(password, user.passwordHash);

  if (!isMatch) {
    user.failedLoginCount += 1;
    if (user.failedLoginCount >= MAX_FAILED_LOGIN) {
      user.lockedUntil = new Date(now + LOCK_DURATION_MS).toISOString();
      return { ok: false, reason: 'LOCKED', minutesLeft: LOCK_DURATION_MS / 60000 };
    }
    return {
      ok: false,
      reason: 'INVALID',
      remainingAttempts: MAX_FAILED_LOGIN - user.failedLoginCount,
    };
  }

  user.failedLoginCount = 0;
  user.lockedUntil = null;

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
  };
}

/** Pesan Bahasa Indonesia untuk setiap jenis kegagalan login. */
export function describeCredentialsFailure(failure: CredentialsFailure): string {
  switch (failure.reason) {
    case 'INACTIVE':
      return 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi pengelola.';
    case 'LOCKED':
      return `Akun dikunci sementara karena ${MAX_FAILED_LOGIN} kali salah kata sandi. Coba lagi dalam ${failure.minutesLeft} menit.`;
    case 'INVALID':
    default:
      if (failure.remainingAttempts !== null && failure.remainingAttempts <= 2) {
        return `Email atau kata sandi tidak sesuai. Sisa ${failure.remainingAttempts} percobaan sebelum akun dikunci 15 menit.`;
      }
      return 'Email atau kata sandi tidak sesuai.';
  }
}
