'use server';

import { createHash, randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { AuthError, CredentialsSignin } from 'next-auth';
import { signIn, signOut } from '@/auth';
import { hashPassword } from '@/lib/auth/password';
import {
  type UserAuthState,
  findUserByEmail,
  getAuthUsersStore,
  getResetTokensStore,
  getRoleDashboardPath,
} from '@/lib/auth-store';
import { dbGetReservationsByUserEmail } from '@/server/db';
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from '@/lib/validations/auth';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString } from '@/lib/security/sanitize';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/security/zod';

// Catatan: file 'use server' hanya boleh mengekspor fungsi async.
// Store pengguna & helper sinkron ada di src/lib/auth-store.ts,
// verifikasi kredensial + lockout ada di src/lib/auth/credentials.ts.

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 menit (PRD Task 2.2)
const MIN_PASSWORD_LENGTH = 8;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * 1. LOGIN (Auth.js v5 Credentials)
 * Proteksi rate limit Upstash Redis (5 percobaan/15 menit), sanitasi input, validasi Zod.
 */
export async function loginAction(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  redirectUrl?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserAuthState['role'];
    phone?: string;
  };
}> {
  // Sanitasi & Normalisasi
  const sanitizedEmail = sanitizeString(email).toLowerCase();

  // Validasi Skema Zod
  const validation = loginSchema.safeParse({ email: sanitizedEmail, password });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  // Rate Limiting Upstash Redis (PRD Task 3.4: 5x per 15 menit)
  const rateLimit = await checkRateLimit('login', sanitizedEmail);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.error || 'Terlalu banyak percobaan masuk. Silakan tunggu 15 menit.',
    };
  }

  try {
    await signIn('credentials', {
      email: sanitizedEmail,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { success: false, message: error.code || 'Email atau kata sandi tidak sesuai.' };
    }
    if (error instanceof AuthError) {
      return { success: false, message: 'Terjadi kendala autentikasi. Silakan coba lagi.' };
    }
    throw error;
  }

  const user = findUserByEmail(sanitizedEmail);

  // Jika pengguna adalah CALON_PENGHUNI yang reservasinya sudah divalidasi LUNAS (PAID)
  // atau sudah masuk daftar Penghuni Aktif (__kosOmiTenancies), promosikan otomatis ke PENGHUNI
  if (user && user.role === 'CALON_PENGHUNI') {
    const userReservations = await dbGetReservationsByUserEmail(sanitizedEmail);
    const hasPaidReservation = userReservations.some((r) => r.status === 'PAID');
    const tenancies = ((global as any).__kosOmiTenancies as any[] | undefined) || [];
    const hasActiveTenancy = tenancies.some(
      (t) => t.userEmail?.toLowerCase().trim() === sanitizedEmail && t.status === 'AKTIF'
    );
    if (hasPaidReservation || hasActiveTenancy) {
      user.role = 'PENGHUNI';
    }
  }

  return {
    success: true,
    message: 'Login berhasil.',
    redirectUrl: user ? getRoleDashboardPath(user.role) : '/',
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        }
      : undefined,
  };
}

/**
 * 2. REGISTRASI CALON PENGHUNI
 * Proteksi rate limit Upstash Redis (5 pendaftaran/10 menit), sanitasi input, validasi Zod.
 */
export async function registerAction(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
  const name = sanitizeString(data.name);
  const email = sanitizeString(data.email).toLowerCase();
  const phone = sanitizeString(data.phone).replace(/[\s-]/g, '');

  // Validasi Skema Zod
  const validation = registerSchema.safeParse({
    name,
    email,
    phone,
    password: data.password,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  // Rate Limiting Upstash Redis (PRD Task 3.4: 5x per 10 menit)
  const rateLimit = await checkRateLimit('register', email);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.error || 'Batas pendaftaran tercapai. Silakan coba beberapa saat lagi.',
    };
  }

  if (findUserByEmail(email)) {
    return {
      success: false,
      message: 'Alamat email ini sudah terdaftar. Silakan masuk ke akun Anda.',
    };
  }

  const newUser: UserAuthState = {
    id: `usr-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`,
    name,
    email,
    passwordHash: await hashPassword(data.password),
    phone: phone.replace(/^0/, '62').replace(/^\+/, ''),
    role: 'CALON_PENGHUNI',
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
  };
  getAuthUsersStore().push(newUser);

  // Sinkronkan otomatis ke Daftar Pengguna Admin Kos (/admin/pengguna)
  const nowIso = new Date().toISOString();
  if ((global as any).__kosOmiAdminUsers && Array.isArray((global as any).__kosOmiAdminUsers)) {
    const existsInAdmin = (global as any).__kosOmiAdminUsers.some(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!existsInAdmin) {
      (global as any).__kosOmiAdminUsers.unshift({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: data.phone.trim(),
        role: 'CALON_PENGHUNI',
        isActive: true,
        createdAt: nowIso,
        lastLoginAt: nowIso,
      });
    }
  }

  // Catat ke Log Notifikasi & Audit Log
  if (!(global as any).__kosOmiNotifLogs || (global as any).__kosOmiNotifVer !== 8) {
    (global as any).__kosOmiNotifLogs = [];
    (global as any).__kosOmiNotifVer = 8;
  }
  (global as any).__kosOmiNotifLogs.unshift({
    id: `ntf-reg-${Date.now()}`,
    recipient: newUser.email,
    recipientName: newUser.name,
    channel: 'EMAIL',
    template: `registrasi_akun_calon_penghuni_${newUser.name}`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');

  // Auto-login setelah registrasi melalui Auth.js
  try {
    await signIn('credentials', { email, password: data.password, redirect: false });
  } catch {
    return {
      success: true,
      message: 'Pendaftaran berhasil. Silakan masuk dengan akun baru Anda.',
      redirectUrl: '/login',
    };
  }

  return {
    success: true,
    message: 'Pendaftaran berhasil! Akun Calon Penghuni Anda siap digunakan.',
    redirectUrl: getRoleDashboardPath('CALON_PENGHUNI'),
  };
}

/**
 * 3. LUPA PASSWORD
 * Proteksi rate limit Upstash Redis (3 permintaan/15 menit), sanitasi input, validasi Zod.
 * Token acak 32 byte, sekali pakai, berumur 30 menit. Yang disimpan hanya hash SHA-256-nya.
 */
export async function forgotPasswordAction(
  email: string
): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const genericMessage =
    'Jika alamat email terdaftar, tautan reset kata sandi telah dikirim. Tautan berlaku 30 menit.';

  // Validasi Skema Zod
  const validation = forgotPasswordSchema.safeParse({ email: sanitizedEmail });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  // Rate Limiting Upstash Redis (PRD Task 3.4: 3x per 15 menit)
  const rateLimit = await checkRateLimit('forgot_password', sanitizedEmail);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.error || 'Terlalu banyak permintaan reset kata sandi. Silakan tunggu.',
    };
  }

  const user = findUserByEmail(sanitizedEmail);
  // Respons tetap sama agar keberadaan email tidak bocor.
  if (!user || !user.isActive) {
    return { success: true, message: genericMessage };
  }

  const tokens = getResetTokensStore();
  const now = Date.now();

  // Batalkan token lama milik email ini: hanya token terbaru yang berlaku.
  for (const record of tokens) {
    if (record.email === sanitizedEmail && !record.usedAt) {
      record.usedAt = new Date(now).toISOString();
    }
  }

  const rawToken = randomBytes(32).toString('hex');
  tokens.push({
    tokenHash: sha256(rawToken),
    email: sanitizedEmail,
    expiresAt: new Date(now + RESET_TOKEN_TTL_MS).toISOString(),
    usedAt: null,
  });

  return {
    success: true,
    message: genericMessage,
    resetToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
  };
}

/**
 * 4. RESET PASSWORD dengan token sekali pakai.
 * Validasi Zod dan proteksi kedaluwarsa 30 menit.
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  // Validasi Skema Zod
  const validation = resetPasswordSchema.safeParse({
    token: sanitizeString(token),
    password: newPassword,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  const tokenHash = sha256(token.trim());
  const record = getResetTokensStore().find((t) => t.tokenHash === tokenHash);

  if (!record || record.usedAt) {
    return { success: false, message: 'Tautan pemulihan tidak valid atau sudah pernah digunakan.' };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      message: 'Tautan pemulihan sudah kedaluwarsa (lebih dari 30 menit). Silakan ajukan ulang.',
    };
  }

  const user = findUserByEmail(record.email);
  if (!user) {
    return { success: false, message: 'Akun tidak ditemukan.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  user.failedLoginCount = 0;
  user.lockedUntil = null;
  record.usedAt = new Date().toISOString();

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.',
  };
}

/**
 * 5. LOGOUT — menghapus cookie sesi Auth.js.
 */
export async function logoutAction(): Promise<{ success: boolean; redirectUrl: string }> {
  await signOut({ redirect: false });
  return { success: true, redirectUrl: '/login' };
}
