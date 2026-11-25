'use server';

import {
  AdminUserRecord,
  AdminSettings,
  AuditLogRecord,
  NotificationLogRecord,
} from '@/types/admin';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-server';
import { sendEmailWithRetry } from '@/lib/notify/email';
import { sendWhatsAppWithRetry } from '@/lib/notify/whatsapp';
import { findUserByEmail, getAuthUsersStore } from '@/lib/auth-store';
import { hashPassword } from '@/lib/auth/password';

// IN-MEMORY GLOBAL STATE
declare global {
  // eslint-disable-next-line no-var
  var __kosOmiAdminUsers: AdminUserRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiAdminSettings: AdminSettings | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiAuditLogs: AuditLogRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiNotifLogs: NotificationLogRecord[] | undefined;
}

const initialUsers: AdminUserRecord[] = [
  {
    id: 'usr-admin-1',
    name: 'Ibu Yulastri (Pemilik Kos & Super Admin)',
    nim: 'admin',
    email: 'admin@kosomi.id',
    phone: '0822-8714-6763',
    role: 'ADMIN',
    plainPassword: 'Password123!',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-11-02T08:30:00Z',
  },
  {
    id: 'usr-pengelola-1',
    name: 'Yanti Susanti (Pengelola Operasional Kos)',
    nim: 'pengelola',
    email: 'pengelola@kosomi.id',
    phone: '0813-7432-9562',
    role: 'PENGELOLA',
    plainPassword: 'Password123!',
    isActive: true,
    createdAt: '2026-01-02T10:00:00Z',
    lastLoginAt: '2026-11-02T09:15:00Z',
  },
  {
    id: 'usr-keuangan-1',
    name: 'Aisyah Fitriani (Staf Keuangan)',
    nim: 'keuangan',
    email: 'keuangan@kosomi.id',
    phone: '0822-8714-6763',
    role: 'KEUANGAN',
    plainPassword: 'Password123!',
    isActive: true,
    createdAt: '2026-01-02T10:30:00Z',
    lastLoginAt: '2026-11-02T09:30:00Z',
  },
  {
    id: 'usr-calon-zahra',
    name: 'Zahra Aulia Putri (Kamar 1)',
    nim: '2214010045',
    email: 'zahra.aulia@uinib.ac.id',
    phone: '081234567890',
    role: 'CALON_PENGHUNI',
    roomCode: '1',
    plainPassword: 'Password123!',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

const initialSettings: AdminSettings = {
  kosName: 'Kos Omi Sungai Bangek, Padang',
  kosAddress:
    'Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol)',
  adminPhone: '0822-8714-6763 (Ibu Yulastri) / 0813-7432-9562',
  dueDay: 5,
  depositPercentage: 0,
  bookingWindowHours: 24,
  timezone: 'Asia/Jakarta (WIB)',
  lateFeeEnabled: false,
  lateFeeDailyAmount: 0,
};

const initialAuditLogs: AuditLogRecord[] = [
  {
    id: 'aud-studi-kasus-1',
    actorId: 'usr-pengelola-1',
    actorName: 'Yanti Susanti (Pengelola)',
    actorRole: 'PENGELOLA',
    action: 'APPROVE_RESERVATION',
    entity: 'reservations',
    entityId: 'RSV-202611-1',
    meta: {
      roomCode: '1',
      tenantName: 'Zahra Aulia Putri',
      nim: '2214010045',
      invoiceCode: 'INV-202611-1',
      amount: 5000000,
    },
    createdAt: new Date().toISOString(),
  },
];

const initialNotificationLogs: NotificationLogRecord[] = [
  {
    id: 'ntf-studi-kasus-1',
    recipient: '081234567890',
    recipientName: 'Zahra Aulia Putri (Kamar 1)',
    channel: 'WHATSAPP',
    template: 'reservasi_disetujui_invoice_INV-202611-1_kamar_1',
    status: 'SENT',
    attempts: 1,
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

function getUsersStore(): AdminUserRecord[] {
  if (!global.__kosOmiAdminUsers || (global as any).__kosOmiUsersVer !== 14) {
    global.__kosOmiAdminUsers = [...initialUsers];
    (global as any).__kosOmiUsersVer = 14;
  }

  const store = global.__kosOmiAdminUsers;

  // 1. Sinkronkan otomatis akun yang baru didaftarkan di /daftar (__kosOmiAuthUsers) beserta NIM & kata sandinya
  const authUsers = getAuthUsersStore();
  if (Array.isArray(authUsers)) {
    for (const au of authUsers) {
      if (!au?.email) continue;
      const existing = store.find((u) => u.email.toLowerCase() === au.email.toLowerCase());
      if (!existing) {
        store.unshift({
          id: au.id || `usr-${Date.now()}`,
          name: au.name || au.email.split('@')[0],
          nim: au.nim || au.email.split('@')[0],
          email: au.email,
          phone: au.phone || '-',
          role: au.role || 'CALON_PENGHUNI',
          roomCode: au.roomCode,
          plainPassword: au.plainPassword || 'Password123!',
          isActive: au.isActive !== false,
          createdAt: new Date().toISOString(),
        });
      } else {
        if (au.plainPassword) {
          existing.plainPassword = au.plainPassword;
        } else if (!existing.plainPassword) {
          existing.plainPassword = 'Password123!';
        }
        if (au.nim && !existing.nim) {
          existing.nim = au.nim;
        }
        if (au.role) {
          existing.role = au.role;
        }
      }
    }
  }

  // 2. Sinkronkan otomatis calon penghuni yang mengajukan reservasi (__kosOmiDbState.reservations)
  const dbReservations = (global as any).__kosOmiDbState?.reservations as any[] | undefined;
  if (Array.isArray(dbReservations)) {
    for (const rsv of dbReservations) {
      if (!rsv?.userEmail) continue;
      const existing = store.find((u) => u.email.toLowerCase() === rsv.userEmail.toLowerCase());
      if (!existing) {
        store.unshift({
          id: rsv.userId || `usr-rsv-${Date.now()}`,
          name: rsv.userName || rsv.userEmail,
          nim: rsv.userNik || rsv.userEmail.split('@')[0],
          email: rsv.userEmail,
          phone: rsv.userPhone || '-',
          role: 'CALON_PENGHUNI',
          roomCode: rsv.roomCode,
          plainPassword: 'Password123!',
          isActive: true,
          createdAt: rsv.createdAt || new Date().toISOString(),
        });
      } else {
        if (!existing.roomCode && rsv.roomCode) {
          existing.roomCode = rsv.roomCode;
        }
        if (rsv.userNik && !existing.nim) {
          existing.nim = rsv.userNik;
        }
        if (rsv.userName && existing.name.startsWith('Akun Demo')) {
          existing.name = rsv.userName;
        }
      }
    }
  }

  // 3. Sinkronkan otomatis penghuni aktif yang sudah check-in (__kosOmiTenancies)
  const activeTenants = (global as any).__kosOmiTenancies as any[] | undefined;
  if (Array.isArray(activeTenants)) {
    for (const ten of activeTenants) {
      const tEmail = ten?.userEmail || ten?.tenantEmail;
      if (!tEmail) continue;
      const existing = store.find((u) => u.email.toLowerCase() === tEmail.toLowerCase());
      if (!existing) {
        store.unshift({
          id: ten.id || `usr-ten-${Date.now()}`,
          name: ten.userName || ten.tenantName || tEmail,
          email: tEmail,
          phone: ten.userPhone || ten.tenantPhone || '-',
          role: 'PENGHUNI',
          roomCode: ten.roomCode,
          isActive: true,
          createdAt: ten.checkInDate || ten.createdAt || new Date().toISOString(),
        });
      } else if (ten.status === 'AKTIF' && existing.role !== 'CALON_PENGHUNI') {
        existing.roomCode = ten.roomCode;
      }
    }
  }

  return store;
}

function getSettingsStore(): AdminSettings {
  if (!global.__kosOmiAdminSettings) {
    global.__kosOmiAdminSettings = { ...initialSettings };
  }
  return global.__kosOmiAdminSettings;
}

function getAuditLogsStore(): AuditLogRecord[] {
  if (!global.__kosOmiAuditLogs || (global as any).__kosOmiAuditVer !== 12) {
    global.__kosOmiAuditLogs = [...initialAuditLogs];
    (global as any).__kosOmiAuditVer = 12;
  }
  return global.__kosOmiAuditLogs;
}

function getNotifLogsStore(): NotificationLogRecord[] {
  if (!global.__kosOmiNotifLogs || (global as any).__kosOmiNotifVer !== 12) {
    global.__kosOmiNotifLogs = [...initialNotificationLogs];
    (global as any).__kosOmiNotifVer = 12;
  }
  return global.__kosOmiNotifLogs;
}

// 1. Fetch Users
export async function fetchAdminUsersAction(filters?: {
  role?: string;
  search?: string;
}): Promise<AdminUserRecord[]> {
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

  const newUser: AdminUserRecord = {
    id: `usr-${Date.now()}`,
    name: data.name.trim(),
    nim: cleanNim || resolvedEmail.split('@')[0],
    email: resolvedEmail,
    phone: data.phone.trim(),
    role: data.role,
    roomCode: data.roomCode?.trim() || undefined,
    plainPassword: userPassword,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.unshift(newUser);

  // Sinkronkan ke store login (__kosOmiAuthUsers) agar bisa langsung login pakai NIM atau Email
  const authStore = getAuthUsersStore();
  authStore.unshift({
    id: newUser.id,
    name: newUser.name,
    nim: newUser.nim,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    roomCode: newUser.roomCode,
    passwordHash: await hashPassword(userPassword),
    plainPassword: userPassword,
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

  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Ibu Omi (Super Admin)',
    actorRole: 'ADMIN',
    action: 'USER_ACCOUNT_CREATED_SIAKAD',
    entity: 'users',
    entityId: newUser.id,
    meta: {
      name: newUser.name,
      nim: newUser.nim,
      role: newUser.role,
      email: newUser.email,
      roomCode: newUser.roomCode,
    },
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');

  return {
    success: true,
    message: `Akun ${newUser.name} (Login NIM: ${newUser.nim} | Sandi: ${userPassword} | Role: ${newUser.role}) berhasil dibuat!`,
    user: newUser,
  };
}

// 2c. Change User Role & Room directly by Super Admin (SIAKAD Role Management)
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

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');

  return {
    success: true,
    message: `Role akun ${target.name} (NIM/ID: ${target.nim || target.email}) berhasil diubah menjadi ${newRole}! Saat login berikutnya, pengguna akan langsung masuk ke portal ${newRole}.`,
    user: { ...target },
  };
}

// 2b. Reset / Update User Password by Admin
export async function adminUpdateUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  const cleanPass = newPassword.trim();
  if (cleanPass.length < 6) {
    return { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' };
  }

  const users = getUsersStore();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  target.plainPassword = cleanPass;

  const authUser = findUserByEmail(target.email);
  if (authUser) {
    authUser.plainPassword = cleanPass;
    authUser.passwordHash = await hashPassword(cleanPass);
    authUser.failedLoginCount = 0;
    authUser.lockedUntil = null;
  }

  revalidatePath('/admin/pengguna');

  return {
    success: true,
    message: `Kata sandi untuk ${target.name} (${target.email}) berhasil diperbarui menjadi: ${cleanPass}`,
    user: { ...target },
  };
}

// 3. Toggle User Active Status (Aktif / Sudah Keluar Kos)
export async function toggleUserStatusAction(
  userId: string
): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
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

  revalidatePath('/admin/pengguna');

  return {
    success: true,
    message: user.isActive
      ? `Akun ${user.name} berhasil diaktifkan kembali.`
      : `Akun ${user.name} ditandai sudah keluar kos / nonaktif. Sekarang Anda dapat menghapus data akun ini jika diperlukan.`,
    user,
  };
}

// 3b. Delete User Account (Khusus Penghuni / Pengguna yang Sudah Keluar dari Kos / Nonaktif)
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

  users.splice(index, 1);

  // Catat ke Log Audit
  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Ibu Omi',
    actorRole: 'ADMIN',
    action: 'USER_DELETED',
    entity: 'users',
    entityId: targetUser.id,
    meta: {
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      roomCode: targetUser.roomCode || '-',
      status: 'Sudah Keluar dari Kos / Dihapus Permanen',
    },
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: `Data akun ${targetUser.name} (yang sudah keluar dari kos) berhasil dihapus permanen dari sistem.`,
    deletedId: targetUser.id,
  };
}

// 4. Fetch Settings
export async function fetchAdminSettingsAction(): Promise<AdminSettings> {
  return { ...getSettingsStore() };
}

// 5. Update Settings
export async function updateAdminSettingsAction(
  newSettings: Partial<AdminSettings>
): Promise<{ success: boolean; message: string; settings: AdminSettings }> {
  await requireRole(['ADMIN']);
  const store = getSettingsStore();
  global.__kosOmiAdminSettings = {
    ...store,
    ...newSettings,
  };

  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Ibu Omi',
    actorRole: 'ADMIN',
    action: 'SETTINGS_UPDATED',
    entity: 'settings',
    entityId: 'global',
    meta: { ...newSettings },
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/admin/pengaturan');

  return {
    success: true,
    message: 'Pengaturan operasional Kos Omi berhasil disimpan!',
    settings: { ...global.__kosOmiAdminSettings },
  };
}

// 6. Fetch Audit Logs
export async function fetchAuditLogsAction(filters?: {
  action?: string;
  search?: string;
}): Promise<AuditLogRecord[]> {
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

  if (log.channel === 'EMAIL') {
    const emailResult = await sendEmailWithRetry({
      to: log.recipient,
      template: log.template as any,
      subject: `[Kirim Ulang] Notifikasi Kos Omi (${log.template})`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;"><h2 style="color:#0f172a;">Pengiriman Ulang Notifikasi Kos Omi</h2><p>Halo <strong>${log.recipientName || log.recipient}</strong>,</p><p>Berikut adalah pengiriman ulang notifikasi resmi dari Sistem Manajemen Kos Omi Sungai Bangek, Padang:</p><div style="background:#f8fafc;padding:14px;border-radius:8px;margin:16px 0;"><p style="margin:4px 0;"><strong>Jenis Notifikasi:</strong> ${log.template}</p><p style="margin:4px 0;"><strong>Waktu Kirim Ulang:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p></div><p>Jika Anda memerlukan bantuan lebih lanjut, silakan hubungi WhatsApp Ibu Kos di +62 813-7432-9562.</p></div>`,
      recipientName: log.recipientName,
    });

    log.attempts += 1;
    if (emailResult.success) {
      log.status = 'SENT';
      log.errorMessage = null;
      log.sentAt = new Date().toISOString();
    } else {
      log.status = 'FAILED';
      log.errorMessage = emailResult.error || 'Gagal mengirim ulang email.';
      revalidatePath('/admin/notifikasi');
      return {
        success: false,
        message: `Gagal mengirim ulang email ke ${log.recipient}: ${emailResult.error}`,
        log,
      };
    }
  } else if (log.channel === 'WHATSAPP') {
    const waResult = await sendWhatsAppWithRetry({
      to: log.recipient,
      template: log.template as any,
      recipientName: log.recipientName,
      message: `*KOS OMI - Pengiriman Ulang Notifikasi*\n\nHalo *${log.recipientName || log.recipient}*,\nIni adalah pengiriman ulang notifikasi otomatis untuk aktivitas Anda di Kos Omi.\n\nJenis: *${log.template}*\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\nJika ada pertanyaan, silakan hubungi Ibu Kos di +62 813-7432-9562.\n_Kos Omi Sungai Bangek, Padang_`,
    });

    log.attempts += 1;
    if (waResult.success) {
      log.status = 'SENT';
      log.errorMessage = null;
      log.sentAt = new Date().toISOString();
    } else {
      log.status = 'FAILED';
      log.errorMessage = waResult.error || 'Gagal mengirim ulang pesan WhatsApp.';
      revalidatePath('/admin/notifikasi');
      return {
        success: false,
        message: `Gagal mengirim ulang WhatsApp ke ${log.recipient}: ${waResult.error}`,
        log,
      };
    }
  } else {
    log.attempts += 1;
    log.status = 'SENT';
    log.errorMessage = null;
    log.sentAt = new Date().toISOString();
  }

  revalidatePath('/admin/notifikasi');

  return {
    success: true,
    message: `Notifikasi ke ${log.recipient} (${log.channel}) berhasil dikirim ulang!`,
    log,
  };
}


