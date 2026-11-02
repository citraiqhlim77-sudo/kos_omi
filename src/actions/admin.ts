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
    name: 'Ibu Omi (Pemilik Kos Omi)',
    email: 'admin@kosomi.id',
    phone: '+62 813-7432-9562',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    lastLoginAt: '2026-11-02T08:30:00Z',
  },
  {
    id: 'usr-pengelola-1',
    name: 'Yanti Susanti (Pengelola)',
    email: 'pengelola@kosomi.id',
    phone: '081288990011',
    role: 'PENGELOLA',
    isActive: true,
    createdAt: '2026-01-02T10:00:00Z',
    lastLoginAt: '2026-11-02T09:15:00Z',
  },
  {
    id: 'usr-keuangan-1',
    name: 'Aisyah Fitriani (Keuangan)',
    email: 'keuangan@kosomi.id',
    phone: '081399001122',
    role: 'KEUANGAN',
    isActive: true,
    createdAt: '2026-01-02T10:30:00Z',
    lastLoginAt: '2026-11-02T09:45:00Z',
  },
  {
    id: 'usr-penghuni-1',
    name: 'Akun Demo Penghuni',
    email: 'penghuni@example.com',
    phone: '081234567890',
    role: 'PENGHUNI',
    isActive: true,
    createdAt: '2026-01-03T11:00:00Z',
    lastLoginAt: undefined,
  },
  {
    id: 'usr-calon-1',
    name: 'Akun Demo Calon Penghuni',
    email: 'calon@example.com',
    phone: '085712349988',
    role: 'CALON_PENGHUNI',
    isActive: true,
    createdAt: '2026-01-03T10:00:00Z',
    lastLoginAt: undefined,
  },
];

const initialSettings: AdminSettings = {
  kosName: 'Kos Omi Sungai Bangek, Padang',
  kosAddress:
    'Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol)',
  adminPhone: '+62 813-7432-9562',
  dueDay: 5,
  depositPercentage: 100,
  bookingWindowHours: 24,
  timezone: 'Asia/Jakarta (WIB)',
  lateFeeEnabled: false,
  lateFeeDailyAmount: 25000,
};

const initialAuditLogs: AuditLogRecord[] = [];

const initialNotificationLogs: NotificationLogRecord[] = [];

function getUsersStore(): AdminUserRecord[] {
  if (!global.__kosOmiAdminUsers || (global as any).__kosOmiUsersVer !== 8) {
    global.__kosOmiAdminUsers = [...initialUsers];
    (global as any).__kosOmiUsersVer = 8;
  }
  return global.__kosOmiAdminUsers;
}

function getSettingsStore(): AdminSettings {
  if (!global.__kosOmiAdminSettings) {
    global.__kosOmiAdminSettings = { ...initialSettings };
  }
  return global.__kosOmiAdminSettings;
}

function getAuditLogsStore(): AuditLogRecord[] {
  if (!global.__kosOmiAuditLogs || (global as any).__kosOmiAuditVer !== 8) {
    global.__kosOmiAuditLogs = [...initialAuditLogs];
    (global as any).__kosOmiAuditVer = 8;
  }
  return global.__kosOmiAuditLogs;
}

function getNotifLogsStore(): NotificationLogRecord[] {
  if (!global.__kosOmiNotifLogs || (global as any).__kosOmiNotifVer !== 8) {
    global.__kosOmiNotifLogs = [...initialNotificationLogs];
    (global as any).__kosOmiNotifVer = 8;
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

// 2. Create Staff User (Pengelola or Keuangan)
export async function createStaffUserAction(data: {
  name: string;
  email: string;
  phone: string;
  role: 'PENGELOLA' | 'KEUANGAN';
}): Promise<{ success: boolean; message: string; user?: AdminUserRecord }> {
  await requireRole(['ADMIN']);
  const users = getUsersStore();

  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, message: 'Alamat email sudah terdaftar.' };
  }

  const newUser: AdminUserRecord = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  users.unshift(newUser);

  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Ibu Omi',
    actorRole: 'ADMIN',
    action: 'STAFF_USER_CREATED',
    entity: 'users',
    entityId: newUser.id,
    meta: { name: newUser.name, role: newUser.role, email: newUser.email },
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/admin/pengguna');
  revalidatePath('/admin/dashboard');

  return {
    success: true,
    message: `Akun staf ${data.name} (${data.role}) berhasil ditambahkan!`,
    user: newUser,
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


