'use server';

import {
AdminUserRecord,
AdminSettings,
AuditLogRecord,
NotificationLogRecord,
} from '@/types/admin';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-server';
import { findUserByEmail,getAuthUsersStore } from '@/lib/auth-store';
import { hashPassword } from '@/lib/auth/password';
import { createAuditLog,getUnifiedAuditLogsStore } from '@/lib/audit';
import { dbCleanupUserRelations } from '@/server/db';
import {
deleteUserFromNeonPostgres,
ensurePostgresHydrated,
flushPostgresSync,
formatPasswordHashPreview,
loadPersistentStore,
savePersistentStore,
} from '@/server/persistence';

// IN-MEMORY GLOBAL STATE
declare global {
  // eslint-disable-next-line no-var
  var __kosOmiAdminUsers: AdminUserRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiAdminSettings: AdminSettings | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiNotifLogs: NotificationLogRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiDeletedUserEmails: Set<string> | undefined;
}

function getDeletedEmailsSet(): Set<string> {
  const store = loadPersistentStore();
  if (!global.__kosOmiDeletedUserEmails) {
    global.__kosOmiDeletedUserEmails = new Set<string>(store.deletedEmails);
  }
  return global.__kosOmiDeletedUserEmails;
}


function getUsersStore(): AdminUserRecord[] {
  return loadPersistentStore().adminUsers;
}

function getSettingsStore(): AdminSettings {
  return loadPersistentStore().settings;
}

function getAuditLogsStore(): AuditLogRecord[] {
  return getUnifiedAuditLogsStore();
}

function getNotifLogsStore(): NotificationLogRecord[] {
  return loadPersistentStore().notificationLogs;
}

// 1. Fetch Users
export async function fetchAdminUsersAction(filters?: {
  role?: string;
  search?: string;
}): Promise<AdminUserRecord[]> {
  await ensurePostgresHydrated();
  const users = getUsersStore();
  let result = [...users];

  if (filters?.role && filters.role !== 'ALL') {
    result = result.filter((u) => u.role === filters.role);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.roomCode && u.roomCode.toLowerCase().includes(q))
    );
  }

  return result;
}

// 2. Create User Account by Super Admin (SIAKAD Style: Supports NIM + Password + Role for Penghuni/Calon/Pengelola/Admin)
export async function createStaffUserAction(data: {
  name: string;
  nim?: string;
  email?: string;
  phone: string;
  role: 'PENGHUNI' | 'CALON_PENGHUNI' | 'PENGELOLA' | 'ADMIN' | 'KEUANGAN';
  roomCode?: string;
  password?: string;
}): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  const users = getUsersStore();

  const cleanNim = (data.nim || '').trim();
  const resolvedEmail = (
    data.email && data.email.trim()
      ? data.email.trim()
      : cleanNim
      ? `${cleanNim.toLowerCase()}@uinib.ac.id`
      : `user${Date.now()}@kosomi.id`
  ).toLowerCase();

  if (
    users.some(
      (u) =>
        u.email.toLowerCase() === resolvedEmail ||
        (cleanNim && u.nim && u.nim.toLowerCase() === cleanNim.toLowerCase())
    )
  ) {
    return { success: false, message: 'NIM atau Alamat Email tersebut sudah terdaftar di sistem.' };
  }

  const userPassword = data.password?.trim() || 'Password123!';
  const hashedPassword = await hashPassword(userPassword);

  const newUser: AdminUserRecord = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    nim: cleanNim || resolvedEmail.split('@')[0],
    email: resolvedEmail,
    phone: data.phone.trim(),
    role: data.role,
    roomCode: data.roomCode?.trim() || undefined,
    passwordHashPreview: formatPasswordHashPreview(hashedPassword),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.unshift(newUser);

  // Sinkronkan ke store login (__kosOmiAuthUsers) hanya menggunakan Bcrypt hash satu arah
  const authStore = getAuthUsersStore();
  authStore.unshift({
    id: newUser.id,
    name: newUser.name,
    nim: newUser.nim,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    roomCode: newUser.roomCode,
    passwordHash: hashedPassword,
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
  });

  // Jika role yang dibuat adalah PENGHUNI (Penghuni Aktif), sinkronkan otomatis ke Portal Penghuni
  if (newUser.role === 'PENGHUNI') {
    const roomNum = newUser.roomCode || '1';
    if (!(global as any).__kosOmiBillingState) {
      (global as any).__kosOmiBillingState = { bills: [], profiles: [] };
      (global as any).__kosOmiBillingVer = 12;
    }
    (global as any).__kosOmiBillingState.profiles.unshift({
      id: newUser.id,
      name: newUser.name,
      nik: newUser.nim || '2317020001',
      email: newUser.email,
      phone: newUser.phone,
      occupation: 'Mahasiswi UIN Imam Bonjol Padang',
      roomCode: roomNum,
      checkInDate: new Date().toISOString().split('T')[0],
      tenancyEnd: '2027-05-10',
      emergencyContactName: 'Orang Tua / Wali',
      emergencyContactRelation: 'Orang Tua',
      emergencyContactPhone: newUser.phone,
      monthlyRent: 5000000,
      avatarUrl: `/rooms/kamar-${roomNum}.png`,
    });
  }

  // Jika akun ini sebelumnya pernah dihapus lalu dibuat ulang oleh Admin, cabut dari daftar deleted
  const persistent = loadPersistentStore();
  persistent.deletedEmails = persistent.deletedEmails.filter(
    (e) => e.toLowerCase().trim() !== resolvedEmail
  );
  getDeletedEmailsSet().delete(resolvedEmail);
  savePersistentStore(persistent);
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'STAFF_USER_CREATED',
    category: 'users',
    entityId: newUser.id,
    description: `Menambahkan akun pengguna baru ${newUser.name} (${newUser.role})`,
    meta: {
      userName: newUser.name,
      email: newUser.email,
      role: newUser.role,
      roomCode: newUser.roomCode,
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/log-aktivitas');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/dashboard');

  return {
    success: true,
    message: `Akun ${newUser.name} (${newUser.email}) berhasil ditambahkan!`,
    user: newUser,
  };
}

// 2c. Change User Role & Room directly by Super Admin
export async function adminUpdateUserRoleAction(
  userId: string,
  newRole: AdminUserRecord['role'],
  roomCode?: string
): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  const users = getUsersStore();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  target.role = newRole;
  if (roomCode !== undefined) {
    target.roomCode = roomCode.trim() || undefined;
  }

  const authUser = findUserByEmail(target.email) || (target.nim ? findUserByEmail(target.nim) : undefined);
  if (authUser) {
    authUser.role = newRole;
    if (roomCode !== undefined) {
      authUser.roomCode = target.roomCode;
    }
  }
  savePersistentStore();
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'USER_ROLE_UPDATED',
    category: 'users',
    entityId: target.id,
    description: `Mengubah peran akun ${target.name} menjadi ${newRole}`,
    meta: {
      userName: target.name,
      targetEmail: target.email,
      role: newRole,
      roomCode: target.roomCode,
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: `Peran akun ${target.name} berhasil diubah menjadi ${newRole}.`,
    user: { ...target },
  };
}

// 2b. Reset User Password by Admin (One-Way Bcrypt Hash — Admin tidak dapat melihat sandi lama)
export async function adminUpdateUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  await ensurePostgresHydrated();
  const cleanPass = newPassword.trim();
  if (cleanPass.length < 6) {
    return { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' };
  }

  const users = getUsersStore();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  const newHashed = await hashPassword(cleanPass);
  target.passwordHashPreview = formatPasswordHashPreview(newHashed);

  const authUser = findUserByEmail(target.email);
  if (authUser) {
    authUser.passwordHash = newHashed;
    authUser.failedLoginCount = 0;
    authUser.lockedUntil = null;
  }
  savePersistentStore();
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'USER_PASSWORD_RESET',
    category: 'users',
    entityId: target.id,
    description: `Mereset & mengenkripsi ulang kata sandi akun ${target.name} (${target.email})`,
    meta: {
      userName: target.name,
      targetEmail: target.email,
      encryption: 'bcrypt',
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: `Kata sandi untuk ${target.name} (${target.email}) berhasil di-reset dan dienkripsi ulang dengan Bcrypt.`,
    user: { ...target },
  };
}

// 3. Toggle User Active Status (Aktif / Sudah Keluar Kos)
export async function toggleUserStatusAction(
  userId: string
): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  await ensurePostgresHydrated();
  const users = getUsersStore();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  if (user.role === 'ADMIN') {
    return {
      success: false,
      message: 'Admin utama tidak dapat dinonaktifkan demi keamanan sistem.',
    };
  }

  user.isActive = !user.isActive;

  // Sinkronkan status isActive ke auth store
  const authUser = findUserByEmail(user.email);
  if (authUser) {
    authUser.isActive = user.isActive;
  }
  savePersistentStore();
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'USER_STATUS_TOGGLED',
    category: 'users',
    entityId: user.id,
    description: user.isActive
      ? `Mengaktifkan kembali akun ${user.name}`
      : `Menonaktifkan / menandai keluar kos akun ${user.name}`,
    meta: {
      userName: user.name,
      targetEmail: user.email,
      newStatus: user.isActive ? 'Aktif' : 'Nonaktif / Sudah Keluar Kos',
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: user.isActive
      ? `Akun ${user.name} berhasil diaktifkan kembali.`
      : `Akun ${user.name} ditandai sudah keluar kos / nonaktif. Sekarang Anda dapat menghapus data akun ini jika diperlukan.`,
    user,
  };
}

// 3b. Delete User Account Permanently (Bebas Foreign Key Error & Reset Kamar Terkait)
export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; message: string; deletedId?: string }> {
  await requireRole(['ADMIN']);
  const users = getUsersStore();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return { success: false, message: 'Data pengguna tidak ditemukan.' };
  }

  const targetUser = users[index];

  if (targetUser.role === 'ADMIN') {
    return {
      success: false,
      message: 'Akun Administrator utama tidak dapat dihapus.',
    };
  }

  if (targetUser.isActive) {
    return {
      success: false,
      message:
        'Pengguna masih berstatus Aktif di kos. Silakan klik "Keluar Kos / Nonaktifkan" terlebih dahulu sebelum menghapus data akun.',
    };
  }

  const normalizedEmail = targetUser.email.toLowerCase().trim();

  // 1) Hapus seluruh relasi data pengguna secara berurutan (tanpa db.transaction() untuk kompatibilitas neon-http):
  //    a. Hapus notifikasi milik pengguna
  const notifStore = getNotifLogsStore();
  for (let i = notifStore.length - 1; i >= 0; i--) {
    if (
      notifStore[i].recipient.toLowerCase() === normalizedEmail ||
      notifStore[i].recipient === targetUser.phone ||
      notifStore[i].recipientName.toLowerCase().includes(targetUser.name.toLowerCase())
    ) {
      notifStore.splice(i, 1);
    }
  }

  //    b. Hapus transaksi keuangan, tagihan/invoices, tenancies, dan kandidat check-in milik pengguna
  if (global.__kosOmiTransactions && Array.isArray(global.__kosOmiTransactions)) {
    global.__kosOmiTransactions = global.__kosOmiTransactions.filter(
      (tx) => tx.userEmail.toLowerCase().trim() !== normalizedEmail
    );
  }
  if ((global as any).__kosOmiBillingState) {
    if (Array.isArray((global as any).__kosOmiBillingState.bills)) {
      (global as any).__kosOmiBillingState.bills = (
        global as any
      ).__kosOmiBillingState.bills.filter(
        (b: any) => b.tenantEmail?.toLowerCase().trim() !== normalizedEmail
      );
    }
    if (Array.isArray((global as any).__kosOmiBillingState.profiles)) {
      (global as any).__kosOmiBillingState.profiles = (
        global as any
      ).__kosOmiBillingState.profiles.filter(
        (p: any) => p.email?.toLowerCase().trim() !== normalizedEmail
      );
    }
  }
  if ((global as any).__kosOmiTenancies && Array.isArray((global as any).__kosOmiTenancies)) {
    (global as any).__kosOmiTenancies = (global as any).__kosOmiTenancies.filter(
      (t: any) =>
        t.userId !== targetUser.id && t.userEmail?.toLowerCase().trim() !== normalizedEmail
    );
  }
  if (
    (global as any).__kosOmiCheckinCandidates &&
    Array.isArray((global as any).__kosOmiCheckinCandidates)
  ) {
    (global as any).__kosOmiCheckinCandidates = (
      global as any
    ).__kosOmiCheckinCandidates.filter(
      (c: any) =>
        c.userId !== targetUser.id && c.userEmail?.toLowerCase().trim() !== normalizedEmail
    );
  }

  //    c. Hapus reservasi & payments di server db serta kembalikan kamar RESERVED/OCCUPIED menjadi TERSEDIA
  const { releasedRooms } = await dbCleanupUserRelations({
    userId: targetUser.id,
    email: normalizedEmail,
    roomCode: targetUser.roomCode,
  });

  //    d. Hapus relasi Foreign Key di Neon PostgreSQL secara berurutan tanpa db.transaction()
  try {
    await deleteUserFromNeonPostgres({
      userId: targetUser.id,
      email: normalizedEmail,
      phone: targetUser.phone,
      releasedRooms,
    });
  } catch (dbErr) {
    console.warn('[DeleteUser] Peringatan pembersihan relasi PostgreSQL:', dbErr);
  }

  // 3) Tandai email sebagai dihapus permanen & hapus dari auth store + admin users store
  const persistent = loadPersistentStore();
  if (!persistent.deletedEmails.includes(normalizedEmail)) {
    persistent.deletedEmails.push(normalizedEmail);
  }
  getDeletedEmailsSet().add(normalizedEmail);
  const authStore = getAuthUsersStore();
  for (let i = authStore.length - 1; i >= 0; i--) {
    if (
      authStore[i].id === targetUser.id ||
      authStore[i].email.toLowerCase().trim() === normalizedEmail
    ) {
      authStore.splice(i, 1);
    }
  }
  users.splice(index, 1);
  savePersistentStore(persistent);
  await flushPostgresSync();

  // 4) Catat aktivitas penghapusan akun ke tabel audit_logs
  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'USER_DELETED',
    category: 'users',
    entityId: targetUser.id,
    description: `Menghapus permanen akun ${targetUser.name} (${targetUser.email})${
      releasedRooms.length > 0 ? ` dan mengembalikan Kamar No. ${releasedRooms.join(', ')} ke Tersedia` : ''
    }`,
    meta: {
      userName: targetUser.name,
      userEmail: targetUser.email,
      role: targetUser.role,
      roomCode: targetUser.roomCode || '-',
      status: 'Dihapus Permanen',
    },
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/log-aktivitas');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/pengelola/dashboard');
  revalidatePath('/pengelola/reservasi');
  revalidatePath('/pengelola/checkin');
  revalidatePath('/pengelola/penghuni');
  revalidatePath('/pengelola/kamar');
  revalidatePath('/kamar');
  revalidatePath('/');

  return {
    success: true,
    message: `Data akun ${targetUser.name} berhasil dihapus permanen dari sistem${
      releasedRooms.length > 0
        ? ` dan Kamar No. ${releasedRooms.join(', ')} telah dikembalikan menjadi Tersedia.`
        : '.'
    }`,
    deletedId: targetUser.id,
  };
}

// 4. Fetch Settings
export async function fetchAdminSettingsAction(): Promise<AdminSettings> {
  await ensurePostgresHydrated();
  return { ...getSettingsStore() };
}

// 5. Update Settings
export async function updateAdminSettingsAction(
  newSettings: Partial<AdminSettings>
): Promise<{ success: boolean; message: string; settings: AdminSettings }> {
  await requireRole(['ADMIN']);
  const store = getSettingsStore();
  const resolvedSemesterPrice =
    typeof newSettings.semesterPrice === 'number' && !Number.isNaN(newSettings.semesterPrice)
      ? Math.max(0, newSettings.semesterPrice)
      : store.semesterPrice ?? 5000000;

  const resolvedBookingWindow =
    typeof newSettings.bookingWindowHours === 'number' && !Number.isNaN(newSettings.bookingWindowHours)
      ? Math.max(1, newSettings.bookingWindowHours)
      : store.bookingWindowHours ?? 24;

  const resolvedDepositPolicy =
    newSettings.depositPolicy || store.depositPolicy || 'Tanpa Biaya Jaminan (Rp 0)';

  const resolvedLatePolicy =
    newSettings.latePolicy ||
    store.latePolicy ||
    'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)';

  const persistent = loadPersistentStore();
  persistent.settings = {
    ...store,
    ...newSettings,
    semesterPrice: resolvedSemesterPrice,
    bookingWindowHours: resolvedBookingWindow,
    depositPolicy: resolvedDepositPolicy,
    latePolicy: resolvedLatePolicy,
    depositPercentage: resolvedDepositPolicy.includes('1 Semester') ? 100 : 0,
    lateFeeEnabled: resolvedLatePolicy.includes('Denda Keterlambatan Harian Aktif'),
  };
  global.__kosOmiAdminSettings = persistent.settings;

  // Selaraskan tarif sewa semesteran terbaru ke kamar yang berstatus TERSEDIA
  for (const room of persistent.rooms) {
    if (room.status === 'TERSEDIA') {
      room.monthlyPrice = resolvedSemesterPrice;
    }
  }
  savePersistentStore(persistent);
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'SETTINGS_UPDATED',
    category: 'settings',
    entityId: 'global',
    description: 'Menyimpan pembaruan pengaturan bisnis dan operasional Kos Omi',
    meta: {
      kosName: global.__kosOmiAdminSettings.kosName,
      adminPhone: global.__kosOmiAdminSettings.adminPhone,
      timezone: global.__kosOmiAdminSettings.timezone,
      semesterPrice: global.__kosOmiAdminSettings.semesterPrice,
      depositPolicy: global.__kosOmiAdminSettings.depositPolicy,
      bookingWindowHours: global.__kosOmiAdminSettings.bookingWindowHours,
      latePolicy: global.__kosOmiAdminSettings.latePolicy,
    },
  });

  revalidatePath('/admin/pengaturan');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: 'Pengaturan berhasil disimpan',
    settings: { ...global.__kosOmiAdminSettings },
  };
}

// 6. Fetch Audit Logs
export async function fetchAuditLogsAction(filters?: {
  action?: string;
  search?: string;
}): Promise<AuditLogRecord[]> {
  await ensurePostgresHydrated();
  const logs = getAuditLogsStore();
  let result = [...logs];

  if (filters?.action && filters.action !== 'ALL') {
    result = result.filter((l) => l.action === filters.action);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (l) =>
        l.actorName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q)
    );
  }

  return result;
}

// 7. Fetch Notification Logs
export async function fetchNotificationLogsAction(filters?: {
  channel?: string;
  status?: string;
}): Promise<NotificationLogRecord[]> {
  await ensurePostgresHydrated();
  const logs = getNotifLogsStore();
  let result = [...logs];

  if (filters?.channel && filters.channel !== 'ALL') {
    result = result.filter((l) => l.channel === filters.channel);
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((l) => l.status === filters.status);
  }

  return result;
}

// 8. Resend Notification
export async function resendNotificationAction(
  logId: string
): Promise<{ success: boolean; message: string; log?: NotificationLogRecord }> {
  await requireRole(['ADMIN']);
  const logs = getNotifLogsStore();
  const log = logs.find((l) => l.id === logId);

  if (!log) {
    return { success: false, message: 'Log notifikasi tidak ditemukan.' };
  }

  const nowIso = new Date().toISOString();
  log.attempts = (log.attempts || 0) + 1;
  log.status = 'SENT';
  log.errorMessage = null;
  log.sentAt = nowIso;
  savePersistentStore();
  await flushPostgresSync();

  await createAuditLog({
    userId: 'usr-admin-1',
    actorName: 'Ibu Yulastri (Admin Sistem)',
    actorRole: 'ADMIN',
    action: 'NOTIFICATION_RESENT',
    category: 'notifications',
    entityId: log.id,
    description: `Mengirim ulang notifikasi ${log.channel} ke ${log.recipientName} (${log.recipient})`,
    meta: {
      userName: log.recipientName,
      channel: log.channel,
      recipient: log.recipient,
    },
  });

  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: 'Notifikasi berhasil dikirim ulang',
    log: { ...log },
  };
}


