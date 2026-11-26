'use server';

import { createHash, randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { AuthError, CredentialsSignin } from 'next-auth';
import { signIn, signOut } from '@/auth';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  type UserAuthState,
  findUserByEmail,
  getResetTokensStore,
  getRoleDashboardPath,
} from '@/lib/auth-store';
import { getCurrentUser } from '@/lib/auth-server';
import { loadPersistentStore, savePersistentStore } from '@/server/persistence';
import { createAuditLog } from '@/lib/audit';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString } from '@/lib/security/sanitize';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/security/zod';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 menit (PRD Task 2.2)

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
    roomCode?: string;
  };
}> {
  const sanitizedEmail = sanitizeString(email).toLowerCase();

  const validation = loginSchema.safeParse({ email: sanitizedEmail, password });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

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

  const store = loadPersistentStore();
  const user = findUserByEmail(sanitizedEmail);
  const nowIso = new Date().toISOString();

  if (user) {
    user.lastLoginAt = nowIso;

    // Promosikan otomatis ke PENGHUNI HANYA apabila sudah memiliki kontrak hunian AKTIF (sudah Check-in resmi oleh Pengelola)
    const activeTenancy = store.tenancies.find(
      (t) =>
        t.status === 'AKTIF' &&
        (t.userId === user.id || t.userEmail?.toLowerCase().trim() === user.email.toLowerCase())
    );
    if (activeTenancy && user.role === 'CALON_PENGHUNI') {
      user.role = 'PENGHUNI';
      user.roomCode = activeTenancy.roomCode;
    }

    const adminMatch = store.adminUsers.find(
      (u) => u.email.toLowerCase().trim() === user.email.toLowerCase()
    );
    if (adminMatch) {
      adminMatch.lastLoginAt = nowIso;
      adminMatch.role = user.role;
      if (user.roomCode) adminMatch.roomCode = user.roomCode;
    }

    savePersistentStore(store);
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
          roomCode: user.roomCode,
        }
      : undefined,
  };
}

/**
 * 2. REGISTRASI CALON PENGHUNI
 * Menyimpan akun secara persisten ke pusat database sehingga langsung tampil
 * di Admin (/admin/pengguna & /admin/dashboard) dan Pengelola (/pengelola/penghuni & /pengelola/dashboard).
 */
export async function registerAction(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  redirectUrl?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'CALON_PENGHUNI';
  };
}> {
  const name = sanitizeString(data.name).trim();
  const email = sanitizeString(data.email).toLowerCase().trim();
  const phone = sanitizeString(data.phone).replace(/[\s-]/g, '');

  const validation = registerSchema.safeParse({
    name,
    email,
    phone,
    password: data.password,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  const rateLimit = await checkRateLimit('register', email);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.error || 'Batas pendaftaran tercapai. Silakan coba beberapa saat lagi.',
    };
  }

  const store = loadPersistentStore();

  if (store.authUsers.some((u) => u.email.toLowerCase().trim() === email)) {
    return {
      success: false,
      message: 'Alamat email ini sudah terdaftar. Silakan masuk ke akun Anda.',
    };
  }

  // Jika email sebelumnya pernah dihapus, cabut dari daftar deletedEmails karena mendaftar ulang secara resmi
  store.deletedEmails = store.deletedEmails.filter((e) => e.toLowerCase().trim() !== email);

  const nowIso = new Date().toISOString();
  const normalizedWaPhone = phone.replace(/^0/, '62').replace(/^\+/, '');
  const displayPhone = phone.startsWith('62') ? `0${phone.slice(2)}` : phone;
  const userId = `usr-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
  const passwordHash = await hashPassword(data.password);

  const newUser: UserAuthState = {
    id: userId,
    name,
    nim: email.split('@')[0],
    email,
    passwordHash,
    plainPassword: data.password,
    phone: normalizedWaPhone,
    role: 'CALON_PENGHUNI',
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };

  store.authUsers.unshift(newUser);

  // Simpan juga ke daftar pengguna Admin & direktori Calon Penghuni Pengelola
  store.adminUsers.unshift({
    id: userId,
    name,
    nim: email.split('@')[0],
    email,
    phone: displayPhone,
    role: 'CALON_PENGHUNI',
    plainPassword: data.password,
    isActive: true,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  });

  if (!store.calonUsers.some((c) => c.email.toLowerCase().trim() === email)) {
    store.calonUsers.unshift({
      id: userId,
      name,
      email,
      phone: displayPhone,
      nik: '-',
      occupation: 'Calon Penghuni Terdaftar',
      emergencyContactName: '-',
      emergencyContactPhone: displayPhone,
      emergencyContactRelation: 'Keluarga',
      ktpUrl: '',
      createdAt: nowIso,
    });
  }

  // Catat ke Riwayat Notifikasi (tanpa me-reset array notifikasi yang sudah ada)
  store.notificationLogs.unshift({
    id: `ntf-reg-${Date.now()}`,
    recipient: email,
    recipientName: name,
    channel: 'EMAIL',
    template: `registrasi_akun_calon_penghuni_${name.toLowerCase().replace(/\s+/g, '_')}`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });

  savePersistentStore(store);

  await createAuditLog({
    userId,
    actorName: name,
    actorRole: 'CALON_PENGHUNI',
    action: 'REGISTER_USER',
    category: 'users',
    entityId: userId,
    description: `Mendaftarkan akun Calon Penghuni baru: ${name} (${email})`,
    meta: {
      userName: name,
      userEmail: email,
      phone: displayPhone,
      role: 'CALON_PENGHUNI',
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');
  revalidatePath('/pengelola/dashboard');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/reservasi');

  try {
    await signIn('credentials', { email, password: data.password, redirect: false });
  } catch {
    return {
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda telah tersimpan di sistem Kos Omi.',
      redirectUrl: '/calon/dashboard',
      user: {
        id: userId,
        name,
        email,
        phone: displayPhone,
        role: 'CALON_PENGHUNI',
      },
    };
  }

  return {
    success: true,
    message: 'Pendaftaran berhasil! Akun Calon Penghuni Anda siap digunakan.',
    redirectUrl: getRoleDashboardPath('CALON_PENGHUNI'),
    user: {
      id: userId,
      name,
      email,
      phone: displayPhone,
      role: 'CALON_PENGHUNI',
    },
  };
}

/**
 * 2b. UPDATE PROFIL AKUN CALON PENGHUNI
 * Menyinkronkan perubahan Nama & Nomor WhatsApp ke seluruh store (Auth, Admin, Pengelola, Reservasi).
 */
export async function updateCalonProfileAction(data: {
  email?: string;
  name: string;
  phone: string;
}): Promise<{
  success: boolean;
  message: string;
  user?: { name: string; email: string; phone: string };
}> {
  const currentUser = await getCurrentUser();
  const targetEmail = sanitizeString(data.email || currentUser?.email || '')
    .toLowerCase()
    .trim();
  const cleanName = sanitizeString(data.name).trim();
  const cleanPhone = sanitizeString(data.phone).replace(/[\s-]/g, '');

  if (!targetEmail) {
    return { success: false, message: 'Sesi email pengguna tidak ditemukan. Silakan masuk ulang.' };
  }
  if (cleanName.length < 2) {
    return { success: false, message: 'Nama lengkap minimal 2 karakter.' };
  }

  const store = loadPersistentStore();
  const authUser = store.authUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);
  const adminUser = store.adminUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);

  if (!authUser && !adminUser) {
    return { success: false, message: 'Akun pengguna tidak ditemukan di sistem.' };
  }

  if (authUser) {
    authUser.name = cleanName;
    if (cleanPhone) authUser.phone = cleanPhone.replace(/^0/, '62').replace(/^\+/, '');
  }
  if (adminUser) {
    adminUser.name = cleanName;
    if (cleanPhone) adminUser.phone = cleanPhone;
  }

  for (const cu of store.calonUsers) {
    if (cu.email.toLowerCase().trim() === targetEmail) {
      cu.name = cleanName;
      if (cleanPhone) cu.phone = cleanPhone;
    }
  }
  for (const rsv of store.reservations) {
    if (rsv.userEmail.toLowerCase().trim() === targetEmail) {
      rsv.userName = cleanName;
      if (cleanPhone) rsv.userPhone = cleanPhone;
    }
  }

  savePersistentStore(store);

  await createAuditLog({
    userId: authUser?.id || adminUser?.id || 'calon',
    actorName: cleanName,
    actorRole: 'CALON_PENGHUNI',
    action: 'PROFILE_UPDATED',
    category: 'users',
    entityId: authUser?.id || targetEmail,
    description: `Memperbarui profil akun Calon Penghuni (${cleanName})`,
    meta: { email: targetEmail, phone: cleanPhone },
  });

  revalidatePath('/calon/profil');
  revalidatePath('/calon/dashboard');
  revalidatePath('/admin/pengguna');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/reservasi');

  return {
    success: true,
    message: 'Informasi profil Anda berhasil disimpan secara permanen di sistem.',
    user: {
      name: cleanName,
      email: targetEmail,
      phone: cleanPhone,
    },
  };
}

/**
 * 2c. UBAH KATA SANDI PENGGUNA (CALON PENGHUNI / PENGHUNI)
 */
export async function changeUserPasswordAction(data: {
  email?: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const currentUser = await getCurrentUser();
  const targetEmail = sanitizeString(data.email || currentUser?.email || '')
    .toLowerCase()
    .trim();

  if (!targetEmail) {
    return { success: false, message: 'Sesi pengguna tidak ditemukan. Silakan masuk ulang.' };
  }
  if (!data.newPassword || data.newPassword.length < 8) {
    return { success: false, message: 'Kata sandi baru minimal harus 8 karakter.' };
  }

  const store = loadPersistentStore();
  const authUser = store.authUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);
  if (!authUser) {
    return { success: false, message: 'Akun tidak ditemukan di database.' };
  }

  if (data.currentPassword && data.currentPassword.trim() !== '') {
    const matchesPlain =
      authUser.plainPassword && authUser.plainPassword === data.currentPassword;
    const matchesHash =
      authUser.passwordHash.startsWith('$2') &&
      (await verifyPassword(data.currentPassword, authUser.passwordHash));
    if (!matchesPlain && !matchesHash) {
      return { success: false, message: 'Kata sandi saat ini tidak sesuai.' };
    }
  }

  const newHash = await hashPassword(data.newPassword);
  authUser.passwordHash = newHash;
  authUser.plainPassword = data.newPassword;
  authUser.failedLoginCount = 0;
  authUser.lockedUntil = null;

  const adminUser = store.adminUsers.find((u) => u.email.toLowerCase().trim() === targetEmail);
  if (adminUser) {
    adminUser.plainPassword = data.newPassword;
  }

  savePersistentStore(store);

  revalidatePath('/admin/pengguna');
  return { success: true, message: 'Kata sandi akun Anda berhasil diperbarui.' };
}

/**
 * 3. LUPA PASSWORD
 */
export async function forgotPasswordAction(
  email: string
): Promise<{ success: boolean; message: string; resetToken?: string }> {
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const genericMessage =
    'Jika alamat email terdaftar, tautan reset kata sandi telah dikirim. Tautan berlaku 30 menit.';

  const validation = forgotPasswordSchema.safeParse({ email: sanitizedEmail });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  const rateLimit = await checkRateLimit('forgot_password', sanitizedEmail);
  if (!rateLimit.success) {
    return {
      success: false,
      message: rateLimit.error || 'Terlalu banyak permintaan reset kata sandi. Silakan tunggu.',
    };
  }

  const store = loadPersistentStore();
  const user = findUserByEmail(sanitizedEmail);
  if (!user || !user.isActive) {
    return { success: true, message: genericMessage };
  }

  const tokens = getResetTokensStore();
  const now = Date.now();

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

  savePersistentStore(store);

  return {
    success: true,
    message: genericMessage,
    resetToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
  };
}

/**
 * 4. RESET PASSWORD dengan token sekali pakai.
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const validation = resetPasswordSchema.safeParse({
    token: sanitizeString(token),
    password: newPassword,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.message };
  }

  const store = loadPersistentStore();
  const tokenHash = sha256(token.trim());
  const record = store.resetTokens.find((t) => t.tokenHash === tokenHash);

  if (!record || record.usedAt) {
    return { success: false, message: 'Tautan pemulihan tidak valid atau sudah pernah digunakan.' };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      message: 'Tautan pemulihan sudah kedaluwarsa (lebih dari 30 menit). Silakan ajukan ulang.',
    };
  }

  const user = store.authUsers.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
  if (!user) {
    return { success: false, message: 'Akun tidak ditemukan.' };
  }

  user.passwordHash = await hashPassword(newPassword);
  user.plainPassword = newPassword;
  user.failedLoginCount = 0;
  user.lockedUntil = null;
  record.usedAt = new Date().toISOString();

  const adminUser = store.adminUsers.find(
    (u) => u.email.toLowerCase() === record.email.toLowerCase()
  );
  if (adminUser) {
    adminUser.plainPassword = newPassword;
  }

  savePersistentStore(store);

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
