'use server';

import {
  AdminUserRecord,
  AdminSettings,
  AuditLogRecord,
  NotificationLogRecord,
  UserRole,
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
    name: 'Omi Pratama',
    email: 'admin@kosomi.id',
    phone: '081234567890',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    lastLoginAt: '2025-06-07T08:30:00Z',
  },
  {
    id: 'usr-pengelola-1',
    name: 'Yanti Susanti',
    email: 'pengelola@kosomi.id',
    phone: '081288990011',
    role: 'PENGELOLA',
    isActive: true,
    createdAt: '2025-01-02T10:00:00Z',
    lastLoginAt: '2025-06-07T09:15:00Z',
  },
  {
    id: 'usr-keuangan-1',
    name: 'Arif Hidayat',
    email: 'keuangan@kosomi.id',
    phone: '081399001122',
    role: 'KEUANGAN',
    isActive: true,
    createdAt: '2025-01-02T10:30:00Z',
    lastLoginAt: '2025-06-06T16:45:00Z',
  },
  {
    id: 'usr-penghuni-1',
    name: 'Rina Wulandari',
    email: 'rina.wulandari@gmail.com',
    phone: '081234567890',
    role: 'PENGHUNI',
    isActive: true,
    roomCode: 'A-101',
    createdAt: '2025-01-03T11:00:00Z',
    lastLoginAt: '2025-06-05T14:10:00Z',
  },
  {
    id: 'usr-penghuni-2',
    name: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@gmail.com',
    phone: '081398765432',
    role: 'PENGHUNI',
    isActive: true,
    roomCode: 'B-205',
    createdAt: '2025-02-15T09:00:00Z',
    lastLoginAt: '2025-06-01T19:30:00Z',
  },
  {
    id: 'usr-penghuni-3',
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@gmail.com',
    phone: '081987654321',
    role: 'PENGHUNI',
    isActive: true,
    roomCode: 'C-310',
    createdAt: '2025-03-01T13:20:00Z',
    lastLoginAt: '2025-06-04T11:00:00Z',
  },
  {
    id: 'usr-calon-1',
    name: 'Bagas Kurniawan',
    email: 'bagas.kurniawan@gmail.com',
    phone: '085712349988',
    role: 'CALON_PENGHUNI',
    isActive: true,
    createdAt: '2025-05-28T10:00:00Z',
    lastLoginAt: '2025-05-30T14:20:00Z',
  },
];

const initialSettings: AdminSettings = {
  kosName: 'Kos Omi Sungai Bangek, Padang',
  kosAddress: 'Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)',
  adminPhone: '081234567890',
  dueDay: 5,
  depositPercentage: 100,
  bookingWindowHours: 24,
  timezone: 'Asia/Jakarta (WIB)',
  lateFeeEnabled: false,
  lateFeeDailyAmount: 25000,
};

const initialAuditLogs: AuditLogRecord[] = [
  {
    id: 'aud-001',
    actorId: 'usr-pengelola-1',
    actorName: 'Yanti Susanti',
    actorRole: 'PENGELOLA',
    action: 'CHECKIN_PROCESSED',
    entity: 'tenancies',
    entityId: 'room-a101',
    meta: { roomCode: 'A-101', tenant: 'Rina Wulandari' },
    createdAt: '2025-06-07T09:30:00Z',
  },
  {
    id: 'aud-002',
    actorId: 'usr-keuangan-1',
    actorName: 'Arif Hidayat',
    actorRole: 'KEUANGAN',
    action: 'PAYMENT_RECONCILED',
    entity: 'payments',
    entityId: 'KOS-202506-00012',
    meta: { amount: 1100000, status: 'settlement' },
    createdAt: '2025-06-06T15:20:00Z',
  },
  {
    id: 'aud-003',
    actorId: 'usr-pengelola-1',
    actorName: 'Yanti Susanti',
    actorRole: 'PENGELOLA',
    action: 'RESERVATION_APPROVED',
    entity: 'reservations',
    entityId: 'RSV-250601-0007',
    meta: { roomCode: 'D-404', applicant: 'Bagas Kurniawan' },
    createdAt: '2025-05-30T10:15:00Z',
  },
  {
    id: 'aud-004',
    actorId: 'usr-admin-1',
    actorName: 'Omi Pratama',
    actorRole: 'ADMIN',
    action: 'ROOM_PRICE_UPDATED',
    entity: 'rooms',
    entityId: 'C-310',
    meta: { oldPrice: 1400000, newPrice: 1450000 },
    createdAt: '2025-05-25T11:00:00Z',
  },
  {
    id: 'aud-005',
    actorId: 'usr-admin-1',
    actorName: 'Omi Pratama',
    actorRole: 'ADMIN',
    action: 'SETTINGS_UPDATED',
    entity: 'settings',
    entityId: 'global',
    meta: { depositPercentage: 100, dueDay: 5 },
    createdAt: '2025-05-20T14:00:00Z',
  },
];

const initialNotificationLogs: NotificationLogRecord[] = [
  {
    id: 'notif-001',
    recipient: '081234567890',
    recipientName: 'Rina Wulandari',
    channel: 'WHATSAPP',
    template: 'tagihan_terbit_h7',
    status: 'SENT',
    attempts: 1,
    sentAt: '2025-05-29T08:00:00Z',
    createdAt: '2025-05-29T08:00:00Z',
  },
  {
    id: 'notif-002',
    recipient: 'rina.wulandari@gmail.com',
    recipientName: 'Rina Wulandari',
    channel: 'EMAIL',
    template: 'kuitansi_pembayaran_lunas',
    status: 'SENT',
    attempts: 1,
    sentAt: '2025-06-03T10:16:00Z',
    createdAt: '2025-06-03T10:15:30Z',
  },
  {
    id: 'notif-003',
    recipient: '081398765432',
    recipientName: 'Dimas Prasetyo',
    channel: 'WHATSAPP',
    template: 'pengingat_tagihan_terlambat',
    status: 'FAILED',
    attempts: 2,
    errorMessage: 'Nomor WhatsApp tidak dapat menerima pesan (Connection Timeout)',
    sentAt: null,
    createdAt: '2025-06-06T09:00:00Z',
  },
  {
    id: 'notif-004',
    recipient: 'bagas.kurniawan@gmail.com',
    recipientName: 'Bagas Kurniawan',
    channel: 'EMAIL',
    template: 'reservasi_disetujui_snap_bayar',
    status: 'SENT',
    attempts: 1,
    sentAt: '2025-05-30T10:16:00Z',
    createdAt: '2025-05-30T10:15:00Z',
  },
];

function getUsersStore(): AdminUserRecord[] {
  if (!global.__kosOmiAdminUsers) {
    global.__kosOmiAdminUsers = [...initialUsers];
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
  if (!global.__kosOmiAuditLogs) {
    global.__kosOmiAuditLogs = [...initialAuditLogs];
  }
  return global.__kosOmiAuditLogs;
}

function getNotifLogsStore(): NotificationLogRecord[] {
  if (!global.__kosOmiNotifLogs) {
    global.__kosOmiNotifLogs = [...initialNotificationLogs];
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
  const currentAdmin = await requireRole(['ADMIN']);
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

  // Add audit log
  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Omi Pratama',
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

// 3. Toggle User Active Status
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
    message: `Akun ${user.name} berhasil ${user.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`,
    user,
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
  const currentAdmin = await requireRole(['ADMIN']);
  const store = getSettingsStore();
  global.__kosOmiAdminSettings = {
    ...store,
    ...newSettings,
  };

  // Add audit log
  const auditLogs = getAuditLogsStore();
  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    actorId: 'usr-admin-1',
    actorName: 'Omi Pratama',
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
      template: (log.template as any) || 'reservasi_dibuat',
      subject: `[KOS OMI] Notifikasi Pengiriman Ulang: ${(log.template || 'Notifikasi').replace(/_/g, ' ').toUpperCase()}`,
      html: `<div style="font-family:sans-serif;padding:24px;color:#1f1f1f;line-height:1.6;"><h2 style="color:#0b57d0;margin-top:0;">Pengiriman Ulang Notifikasi Kos Omi</h2><p>Halo <strong>${log.recipientName || log.recipient}</strong>,</p><p>Ini adalah pengiriman ulang otomatis notifikasi untuk aktivitas Anda di Kos Omi.</p><div style="background-color:#f1f5f9;padding:16px;border-radius:8px;margin:20px 0;"><p style="margin:4px 0;"><strong>Jenis Notifikasi:</strong> ${log.template}</p><p style="margin:4px 0;"><strong>Waktu Kirim Ulang:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p></div><p>Jika Anda memerlukan bantuan lebih lanjut, silakan hubungi WhatsApp Pengelola di +62 812-3456-7890.</p></div>`,
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
      template: log.template,
      recipientName: log.recipientName,
      message: `*KOS OMI - Pengiriman Ulang Notifikasi*\n\nHalo *${log.recipientName || log.recipient}*,\nIni adalah pengiriman ulang notifikasi otomatis untuk aktivitas Anda di Kos Omi.\n\nJenis: *${log.template}*\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\nJika ada pertanyaan, silakan hubungi pengelola di nomor ini.\n_Kos Omi Sungai Bangek, Padang_`,
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
