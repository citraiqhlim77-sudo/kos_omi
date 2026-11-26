import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { Room, RoomStatus } from '@/types/room';
import type { CalonUser, Reservation, PaymentInvoice } from '@/types/reservation';
import type { TenancyRecord, CheckinCandidate } from '@/types/tenancy';
import type { MonthlyBill, TenantProfile } from '@/types/billing';
import type { PaymentTransaction, OverdueBill } from '@/types/finance';
import type {
  AdminUserRecord,
  AdminSettings,
  AuditLogRecord,
  NotificationLogRecord,
} from '@/types/admin';
import { ALL_ROOMS } from '@/data/rooms';
import { SEED_USERS, DEFAULT_PASSWORD_HASH, type SeedUser } from '@/db/seed';

export const SEED_DEFAULT_PASSWORD = 'Password123!';
const STORE_SCHEMA_VERSION = 1;

export interface UserAuthRecord extends SeedUser {
  failedLoginCount: number;
  lockedUntil?: string | null;
  plainPassword?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface ResetTokenRecord {
  tokenHash: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
}

export interface KosOmiPersistentData {
  version: number;
  authUsers: UserAuthRecord[];
  adminUsers: AdminUserRecord[];
  resetTokens: ResetTokenRecord[];
  deletedEmails: string[];
  rooms: Room[];
  calonUsers: CalonUser[];
  reservations: Reservation[];
  payments: PaymentInvoice[];
  tenancies: TenancyRecord[];
  checkinCandidates: CheckinCandidate[];
  bills: MonthlyBill[];
  profiles: TenantProfile[];
  transactions: PaymentTransaction[];
  overdueBills: OverdueBill[];
  auditLogs: AuditLogRecord[];
  notificationLogs: NotificationLogRecord[];
  settings: AdminSettings;
}

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiUnifiedStore: KosOmiPersistentData | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiStoreMtime: number | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiResolvedStorePath: string | undefined;
}

function getStoreFilePath(): string {
  if (process.env.KOS_OMI_STORE_PATH) {
    return process.env.KOS_OMI_STORE_PATH;
  }
  if (global.__kosOmiResolvedStorePath) {
    return global.__kosOmiResolvedStorePath;
  }
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    const workerId = process.env.VITEST_POOL_ID || process.env.VITEST_WORKER_ID || process.pid;
    const testTmp = path.join(os.tmpdir(), `kos-omi-vitest-${workerId}.json`);
    global.__kosOmiResolvedStorePath = testTmp;
    return testTmp;
  }

  const localDir = path.join(process.cwd(), '.data');
  const localFile = path.join(localDir, 'kos-omi-store.json');

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission on .data directory
    fs.accessSync(localDir, fs.constants.W_OK);
    global.__kosOmiResolvedStorePath = localFile;
    return localFile;
  } catch {
    const tmpFile = path.join(os.tmpdir(), 'kos-omi-store.json');
    global.__kosOmiResolvedStorePath = tmpFile;
    return tmpFile;
  }
}

function createInitialData(): KosOmiPersistentData {
  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const authUsers: UserAuthRecord[] = SEED_USERS.map((u) => ({
    ...u,
    failedLoginCount: 0,
    lockedUntil: null,
    plainPassword: SEED_DEFAULT_PASSWORD,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  }));

  const adminUsers: AdminUserRecord[] = [
    {
      id: 'usr-admin-01',
      name: 'Ibu Yulastri (Pemilik Kos & Super Admin)',
      nim: 'admin',
      email: 'admin@kosomi.id',
      phone: '0822-8714-6763',
      role: 'ADMIN',
      plainPassword: SEED_DEFAULT_PASSWORD,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      lastLoginAt: nowIso,
    },
    {
      id: 'usr-pengelola-01',
      name: 'Yanti Susanti (Pengelola Operasional Kos)',
      nim: 'pengelola',
      email: 'pengelola@kosomi.id',
      phone: '0813-7432-9562',
      role: 'PENGELOLA',
      plainPassword: SEED_DEFAULT_PASSWORD,
      isActive: true,
      createdAt: '2026-01-02T10:00:00Z',
      lastLoginAt: nowIso,
    },
    {
      id: 'usr-keuangan-01',
      name: 'Aisyah Fitriani (Staf Keuangan)',
      nim: 'keuangan',
      email: 'keuangan@kosomi.id',
      phone: '0822-8714-6763',
      role: 'KEUANGAN',
      plainPassword: SEED_DEFAULT_PASSWORD,
      isActive: true,
      createdAt: '2026-01-02T10:30:00Z',
      lastLoginAt: nowIso,
    },
    {
      id: 'usr-calon-zahra',
      name: 'Zahra Aulia Putri',
      nim: '2214010045',
      email: 'zahra.aulia@uinib.ac.id',
      phone: '081234567890',
      role: 'CALON_PENGHUNI',
      roomCode: '1',
      plainPassword: SEED_DEFAULT_PASSWORD,
      isActive: true,
      createdAt: nowIso,
      lastLoginAt: nowIso,
    },
  ];

  const initialRooms: Room[] = JSON.parse(JSON.stringify(ALL_ROOMS)).map((r: Room) => ({
    ...r,
    status: (r.code === '1' ? 'DIPESAN' : 'TERSEDIA') as RoomStatus,
  }));

  const caseStudyReservation: Reservation = {
    id: 'rsv-studi-kasus-1',
    code: 'RSV-202611-1',
    roomId: 'room-1',
    roomCode: '1',
    userId: 'usr-calon-zahra',
    userName: 'Zahra Aulia Putri',
    userEmail: 'zahra.aulia@uinib.ac.id',
    userPhone: '081234567890',
    userNik: '2214010045',
    userOccupation: 'FEBI - UIN Imam Bonjol Padang [Sewa Sendiri 1 Kamar Penuh - Rp 5.000.000]',
    emergencyContactName: 'Hj. Rahmawati (Ibu Kandung)',
    emergencyContactPhone: '081363459988',
    emergencyContactRelation: 'Orang Tua',
    ktpUrl: '/rooms/kamar-1.png',
    checkInDate: '2026-11-10',
    durationMonths: 6,
    monthlyPrice: 5000000,
    depositAmount: 0,
    totalInitialPayment: 5000000,
    status: 'PENDING_REVIEW',
    adminNotes:
      'Pengajuan reservasi Kamar No. 1 menunggu verifikasi berkas KTM/KRS oleh Pengelola Kos Omi.',
    expiresAt: expiresIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return {
    version: STORE_SCHEMA_VERSION,
    authUsers,
    adminUsers,
    resetTokens: [],
    deletedEmails: [],
    rooms: initialRooms,
    calonUsers: [
      {
        id: 'usr-calon-zahra',
        name: 'Zahra Aulia Putri',
        email: 'zahra.aulia@uinib.ac.id',
        phone: '081234567890',
        nik: '2214010045',
        occupation: 'FEBI - UIN Imam Bonjol Padang',
        emergencyContactName: 'Hj. Rahmawati',
        emergencyContactPhone: '081363459988',
        emergencyContactRelation: 'Orang Tua',
        ktpUrl: '/rooms/kamar-1.png',
        createdAt: nowIso,
      },
    ],
    reservations: [caseStudyReservation],
    payments: [],
    tenancies: [],
    checkinCandidates: [],
    bills: [],
    profiles: [],
    transactions: [],
    overdueBills: [],
    auditLogs: [
      {
        id: 'aud-init-1',
        actorId: 'usr-calon-zahra',
        actorName: 'Zahra Aulia Putri',
        actorRole: 'CALON_PENGHUNI',
        action: 'CREATE_RESERVATION',
        entity: 'reservations',
        entityId: 'RSV-202611-1',
        meta: {
          description: 'Mengajukan reservasi Kamar No. 1 untuk sewa 1 semester (6 bulan)',
          roomCode: '1',
          tenantName: 'Zahra Aulia Putri',
          durationMonths: 6,
          amount: 5000000,
        },
        createdAt: nowIso,
      },
    ],
    notificationLogs: [
      {
        id: 'ntf-studi-kasus-1',
        recipient: '081234567890',
        recipientName: 'Zahra Aulia Putri (Kamar 1)',
        channel: 'WHATSAPP',
        template: 'bukti_pengajuan_reservasi_RSV-202611-1_kamar_1',
        status: 'SENT',
        attempts: 1,
        sentAt: nowIso,
        createdAt: nowIso,
      },
    ],
    settings: {
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
      semesterPrice: 5000000,
      depositPolicy: 'Tanpa Biaya Jaminan (Rp 0)',
      latePolicy: 'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)',
    },
  };
}

/**
 * Menjaga keselarasan penuh 1:1 antara authUsers, adminUsers, reservations, dan tenancies.
 * Setiap akun yang mendaftar di /daftar maupun ditambahkan Admin otomatis sinkron di semua modul.
 */
export function syncAllStores(data: KosOmiPersistentData): void {
  const deletedSet = new Set(data.deletedEmails.map((e) => e.toLowerCase().trim()));

  // 1. Bersihkan akun yang sudah dihapus permanen
  data.authUsers = data.authUsers.filter(
    (u) => u?.email && !deletedSet.has(u.email.toLowerCase().trim())
  );
  data.adminUsers = data.adminUsers.filter(
    (u) => u?.email && !deletedSet.has(u.email.toLowerCase().trim())
  );

  // 2. Sinkronkan authUsers -> adminUsers
  for (const au of data.authUsers) {
    const emailNorm = au.email.toLowerCase().trim();
    const existingAdmin = data.adminUsers.find(
      (u) => u.email.toLowerCase().trim() === emailNorm
    );
    if (!existingAdmin) {
      data.adminUsers.unshift({
        id: au.id,
        name: au.name,
        nim: au.nim || emailNorm.split('@')[0],
        email: au.email,
        phone: au.phone || '-',
        role: au.role || 'CALON_PENGHUNI',
        roomCode: au.roomCode,
        plainPassword: au.plainPassword || SEED_DEFAULT_PASSWORD,
        isActive: au.isActive !== false,
        createdAt: au.createdAt || new Date().toISOString(),
        lastLoginAt: au.lastLoginAt,
      });
    } else {
      existingAdmin.id = au.id || existingAdmin.id;
      if (au.name) existingAdmin.name = au.name;
      if (au.phone && existingAdmin.phone === '-') existingAdmin.phone = au.phone;
      if (au.plainPassword) existingAdmin.plainPassword = au.plainPassword;
      if (au.nim && !existingAdmin.nim) existingAdmin.nim = au.nim;
      existingAdmin.role = au.role;
      existingAdmin.isActive = au.isActive;
      if (au.roomCode !== undefined) {
        existingAdmin.roomCode = au.roomCode;
      }
    }
  }

  // 3. Sinkronkan adminUsers -> authUsers (misal akun dibuat oleh Admin)
  for (const adm of data.adminUsers) {
    const emailNorm = adm.email.toLowerCase().trim();
    const existingAuth = data.authUsers.find(
      (u) => u.email.toLowerCase().trim() === emailNorm
    );
    if (!existingAuth) {
      data.authUsers.unshift({
        id: adm.id,
        name: adm.name,
        nim: adm.nim,
        email: adm.email,
        phone: adm.phone,
        role: adm.role,
        roomCode: adm.roomCode,
        passwordHash: DEFAULT_PASSWORD_HASH,
        plainPassword: adm.plainPassword || SEED_DEFAULT_PASSWORD,
        isActive: adm.isActive,
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: adm.createdAt,
        lastLoginAt: adm.lastLoginAt,
      });
    }
  }

  // 4. Sinkronkan status kamar & peran berdasarkan reservasi aktif dan kontrak tenancies aktif
  for (const adm of data.adminUsers) {
    if (adm.role === 'ADMIN' || adm.role === 'PENGELOLA' || adm.role === 'KEUANGAN') {
      continue;
    }
    const emailNorm = adm.email.toLowerCase().trim();
    const authMatch = data.authUsers.find((u) => u.email.toLowerCase().trim() === emailNorm);

    const activeTenancy = data.tenancies.find(
      (t) =>
        t.status === 'AKTIF' &&
        (t.userId === adm.id || t.userEmail.toLowerCase().trim() === emailNorm)
    );

    if (activeTenancy) {
      adm.role = 'PENGHUNI';
      adm.roomCode = activeTenancy.roomCode;
      if (authMatch) {
        authMatch.role = 'PENGHUNI';
        authMatch.roomCode = activeTenancy.roomCode;
      }
      continue;
    }

    const activeRes = data.reservations.find(
      (r) =>
        r.userEmail.toLowerCase().trim() === emailNorm &&
        (r.status === 'PENDING_REVIEW' ||
          r.status === 'APPROVED' ||
          r.status === 'PAID' ||
          r.status === 'CHECKED_IN')
    );

    if (activeRes) {
      adm.roomCode = activeRes.roomCode;
      if (activeRes.userNik && (!adm.nim || adm.nim === emailNorm.split('@')[0])) {
        adm.nim = activeRes.userNik;
      }
      if (authMatch) {
        authMatch.roomCode = activeRes.roomCode;
      }
    } else if (adm.role === 'CALON_PENGHUNI') {
      // Jika tidak ada reservasi aktif (misal baru daftar, dibatalkan, atau ditolak), kosongkan roomCode
      adm.roomCode = undefined;
      if (authMatch) {
        authMatch.roomCode = undefined;
      }
    }
  }
}

function bindGlobals(data: KosOmiPersistentData): void {
  global.__kosOmiUnifiedStore = data;
  (global as any).__kosOmiAuthUsers = data.authUsers;
  (global as any).__kosOmiResetTokens = data.resetTokens;
  (global as any).__kosOmiAdminUsers = data.adminUsers;
  (global as any).__kosOmiAdminSettings = data.settings;
  (global as any).__kosOmiAuditLogs = data.auditLogs;
  (global as any).__kosOmiNotifLogs = data.notificationLogs;
  (global as any).__kosOmiDeletedUserEmails = new Set(data.deletedEmails);
  (global as any).__kosOmiDbState = {
    rooms: data.rooms,
    users: data.calonUsers,
    reservations: data.reservations,
    payments: data.payments,
    auditLogs: [],
    isInitialized: true,
  };
  (global as any).__kosOmiTenancies = data.tenancies;
  (global as any).__kosOmiCheckinCandidates = data.checkinCandidates;
  (global as any).__kosOmiBillingState = {
    bills: data.bills,
    profiles: data.profiles,
  };
  (global as any).__kosOmiTransactions = data.transactions;
  (global as any).__kosOmiOverdueBills = data.overdueBills;
}

/**
 * Membaca state database persisten Kos Omi dari file JSON di disk.
 * Jika ada perubahan di disk dari worker/proses lain, memori otomatis disegarkan.
 */
export function loadPersistentStore(): KosOmiPersistentData {
  const filePath = getStoreFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      if (!global.__kosOmiUnifiedStore || global.__kosOmiStoreMtime !== stat.mtimeMs) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        if (raw.trim().length > 0) {
          const parsed = JSON.parse(raw) as Partial<KosOmiPersistentData>;
          const defaults = createInitialData();
          const hydrated: KosOmiPersistentData = {
            version: parsed.version || STORE_SCHEMA_VERSION,
            authUsers: Array.isArray(parsed.authUsers) ? parsed.authUsers : defaults.authUsers,
            adminUsers: Array.isArray(parsed.adminUsers) ? parsed.adminUsers : defaults.adminUsers,
            resetTokens: Array.isArray(parsed.resetTokens) ? parsed.resetTokens : [],
            deletedEmails: Array.isArray(parsed.deletedEmails) ? parsed.deletedEmails : [],
            rooms: Array.isArray(parsed.rooms) && parsed.rooms.length > 0 ? parsed.rooms : defaults.rooms,
            calonUsers: Array.isArray(parsed.calonUsers) ? parsed.calonUsers : defaults.calonUsers,
            reservations: Array.isArray(parsed.reservations) ? parsed.reservations : defaults.reservations,
            payments: Array.isArray(parsed.payments) ? parsed.payments : [],
            tenancies: Array.isArray(parsed.tenancies) ? parsed.tenancies : [],
            checkinCandidates: Array.isArray(parsed.checkinCandidates) ? parsed.checkinCandidates : [],
            bills: Array.isArray(parsed.bills) ? parsed.bills : [],
            profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            overdueBills: Array.isArray(parsed.overdueBills) ? parsed.overdueBills : [],
            auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : defaults.auditLogs,
            notificationLogs: Array.isArray(parsed.notificationLogs)
              ? parsed.notificationLogs
              : defaults.notificationLogs,
            settings: parsed.settings ? { ...defaults.settings, ...parsed.settings } : defaults.settings,
          };
          syncAllStores(hydrated);
          bindGlobals(hydrated);
          global.__kosOmiStoreMtime = stat.mtimeMs;
          return hydrated;
        }
      } else if (global.__kosOmiUnifiedStore) {
        bindGlobals(global.__kosOmiUnifiedStore);
        return global.__kosOmiUnifiedStore;
      }
    }
  } catch (err) {
    console.warn('[Persistence] Gagal membaca store dari disk, menggunakan state memori:', err);
    if (global.__kosOmiUnifiedStore) {
      bindGlobals(global.__kosOmiUnifiedStore);
      return global.__kosOmiUnifiedStore;
    }
  }

  const initial = createInitialData();
  syncAllStores(initial);
  bindGlobals(initial);
  savePersistentStore(initial);
  return initial;
}

/**
 * Menyimpan seluruh perubahan data ke file JSON secara persisten dan menyelaraskan semua store.
 */
export function savePersistentStore(customData?: KosOmiPersistentData): void {
  const data = customData || global.__kosOmiUnifiedStore;
  if (!data) return;

  // Jika dipanggil tanpa argumen (mutasi langsung via variabel global), tarik referensi global terbaru ke data
  if (!customData) {
    if (Array.isArray((global as any).__kosOmiTransactions)) {
      data.transactions = (global as any).__kosOmiTransactions;
    }
    if ((global as any).__kosOmiBillingState) {
      if (Array.isArray((global as any).__kosOmiBillingState.bills)) {
        data.bills = (global as any).__kosOmiBillingState.bills;
      }
      if (Array.isArray((global as any).__kosOmiBillingState.profiles)) {
        data.profiles = (global as any).__kosOmiBillingState.profiles;
      }
    }
    if (Array.isArray((global as any).__kosOmiTenancies)) {
      data.tenancies = (global as any).__kosOmiTenancies;
    }
    if (Array.isArray((global as any).__kosOmiCheckinCandidates)) {
      data.checkinCandidates = (global as any).__kosOmiCheckinCandidates;
    }
    if ((global as any).__kosOmiDeletedUserEmails instanceof Set) {
      data.deletedEmails = Array.from((global as any).__kosOmiDeletedUserEmails);
    }
  }

  syncAllStores(data);
  bindGlobals(data);

  const filePath = getStoreFilePath();
  const serialized = JSON.stringify(data, null, 2);

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
    try {
      fs.writeFileSync(tmpPath, serialized, 'utf-8');
      fs.renameSync(tmpPath, filePath);
    } catch {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {
        // ignore
      }
      fs.writeFileSync(filePath, serialized, 'utf-8');
    }
    const stat = fs.statSync(filePath);
    global.__kosOmiStoreMtime = stat.mtimeMs;
  } catch (err) {
    console.warn('[Persistence] Peringatan saat menyimpan store ke disk:', err);
  }
}
