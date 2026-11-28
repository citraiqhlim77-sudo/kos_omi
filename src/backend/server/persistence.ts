import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import bcrypt from 'bcryptjs';
import { desc,eq,or } from 'drizzle-orm';
import type { Room,RoomStatus } from '@/types/room';
import type { CalonUser,Reservation,PaymentInvoice } from '@/types/reservation';
import type { TenancyRecord,CheckinCandidate } from '@/types/tenancy';
import type { MonthlyBill,TenantProfile } from '@/types/billing';
import type { PaymentTransaction,OverdueBill } from '@/types/finance';
import type {
AdminUserRecord,
AdminSettings,
AuditLogRecord,
NotificationLogRecord,
} from '@/types/admin';
import { ALL_ROOMS } from '@/data/rooms';
import { buildRealTenants2026 } from '@/data/real-tenants-2026';
import { STAFF_SEED_USERS,DEFAULT_PASSWORD_HASH,type SeedUser } from '@/db/seed';
import { getNeonDb,schema } from '@/db';

export const SEED_DEFAULT_PASSWORD = 'Password123!';
const STORE_SCHEMA_VERSION = 2;

export function formatPasswordHashPreview(hash?: string): string {
  if (!hash || !hash.startsWith('$2')) {
    return '$2a$10$••••••••••••';
  }
  return `${hash.slice(0, 13)}...${hash.slice(-5)}`;
}

export interface UserAuthRecord extends SeedUser {
  failedLoginCount: number;
  lockedUntil?: string | null;
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
  // eslint-disable-next-line no-var
  var __kosOmiPgHydratePromise: Promise<KosOmiPersistentData> | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiPgLastHydratedAt: number | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiPgRowHashes: Map<string, string> | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiPgSyncChain: Promise<void> | undefined;
}

function getRowHashes(): Map<string, string> {
  if (!global.__kosOmiPgRowHashes) {
    global.__kosOmiPgRowHashes = new Map<string, string>();
  }
  return global.__kosOmiPgRowHashes;
}

function getFallbackFilePath(): string {
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
  const tmpFile = path.join(os.tmpdir(), 'kos-omi-local-fallback.json');
  global.__kosOmiResolvedStorePath = tmpFile;
  return tmpFile;
}

function createDefaultSettings(): AdminSettings {
  return {
    kosName: 'Kos Omi Sungai Bangek, Padang',
    kosAddress:
      'Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol)',
    adminPhone: '0813-7432-9562 (Ibu Yulastri) / 0813-7432-9562',
    dueDay: 5,
    depositPercentage: 0,
    bookingWindowHours: 24,
    timezone: 'Asia/Jakarta (WIB)',
    lateFeeEnabled: false,
    lateFeeDailyAmount: 0,
    semesterPrice: 5000000,
    depositPolicy: 'Tanpa Biaya Jaminan (Rp 0)',
    latePolicy: 'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)',
  };
}

function createInitialData(): KosOmiPersistentData {
  const nowIso = new Date().toISOString();
  const realSeedHash = bcrypt.hashSync(SEED_DEFAULT_PASSWORD, 10);
  const realBundle = buildRealTenants2026(realSeedHash);
  const allSeedUsers: SeedUser[] = [...STAFF_SEED_USERS, ...realBundle.users];

  const authUsers: UserAuthRecord[] = allSeedUsers.map((u) => ({
    ...u,
    passwordHash: realSeedHash,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  }));

  const adminUsers: AdminUserRecord[] = allSeedUsers.map((u) => ({
    id: u.id,
    name: u.name,
    nim: u.nim || u.email.split('@')[0],
    email: u.email,
    phone: u.phone,
    role: u.role,
    roomCode: u.roomCode,
    passwordHashPreview: formatPasswordHashPreview(realSeedHash),
    isActive: u.isActive,
    createdAt: nowIso,
    lastLoginAt: nowIso,
  }));

  const initialRooms: Room[] = JSON.parse(JSON.stringify(ALL_ROOMS)).map((r: Room) => ({
    ...r,
    status: (realBundle.occupiedRoomCodes.has(r.code) ? 'TERISI' : 'TERSEDIA') as RoomStatus,
  }));

  return {
    version: STORE_SCHEMA_VERSION,
    authUsers,
    adminUsers,
    resetTokens: [],
    deletedEmails: [],
    rooms: initialRooms,
    calonUsers: [],
    reservations: [],
    payments: [],
    tenancies: JSON.parse(JSON.stringify(realBundle.tenancies)),
    checkinCandidates: [],
    bills: [],
    profiles: JSON.parse(JSON.stringify(realBundle.profiles)),
    transactions: [],
    overdueBills: [],
    auditLogs: [],
    notificationLogs: [],
    settings: createDefaultSettings(),
  };
}

export function syncAllStores(data: KosOmiPersistentData): void {
  const deletedSet = new Set(data.deletedEmails.map((e) => e.toLowerCase().trim()));

  data.authUsers = data.authUsers.filter(
    (u) => u?.email && !deletedSet.has(u.email.toLowerCase().trim())
  );
  data.adminUsers = data.adminUsers.filter(
    (u) => u?.email && !deletedSet.has(u.email.toLowerCase().trim())
  );

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
        passwordHashPreview: formatPasswordHashPreview(au.passwordHash),
        isActive: au.isActive !== false,
        createdAt: au.createdAt || new Date().toISOString(),
        lastLoginAt: au.lastLoginAt,
      });
    } else {
      existingAdmin.id = au.id || existingAdmin.id;
      if (au.name) existingAdmin.name = au.name;
      if (au.phone && existingAdmin.phone === '-') existingAdmin.phone = au.phone;
      existingAdmin.passwordHashPreview = formatPasswordHashPreview(au.passwordHash);
      if (au.nim && !existingAdmin.nim) existingAdmin.nim = au.nim;
      existingAdmin.role = au.role;
      existingAdmin.isActive = au.isActive;
      if (au.roomCode !== undefined) {
        existingAdmin.roomCode = au.roomCode;
      }
    }
  }

  for (const adm of data.adminUsers) {
    const emailNorm = adm.email.toLowerCase().trim();
    const existingAuth = data.authUsers.find(
      (u) => u.email.toLowerCase().trim() === emailNorm
    );
    if (!existingAuth) {
      const seedHash = bcrypt.hashSync(SEED_DEFAULT_PASSWORD, 10);
      adm.passwordHashPreview = formatPasswordHashPreview(seedHash);
      data.authUsers.unshift({
        id: adm.id,
        name: adm.name,
        nim: adm.nim,
        email: adm.email,
        phone: adm.phone,
        role: adm.role,
        roomCode: adm.roomCode,
        passwordHash: seedHash,
        isActive: adm.isActive,
        failedLoginCount: 0,
        lockedUntil: null,
        createdAt: adm.createdAt,
        lastLoginAt: adm.lastLoginAt,
      });
    }
  }

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

function serializeSettingsToMap(settings: AdminSettings, deletedEmails: string[]): Record<string, string> {
  return {
    kosName: settings.kosName,
    kosAddress: settings.kosAddress,
    adminPhone: settings.adminPhone,
    dueDay: String(settings.dueDay),
    depositPercentage: String(settings.depositPercentage),
    bookingWindowHours: String(settings.bookingWindowHours),
    timezone: settings.timezone,
    lateFeeEnabled: String(settings.lateFeeEnabled),
    lateFeeDailyAmount: String(settings.lateFeeDailyAmount),
    semesterPrice: String(settings.semesterPrice ?? 5000000),
    depositPolicy: settings.depositPolicy || 'Tanpa Biaya Jaminan (Rp 0)',
    latePolicy:
      settings.latePolicy ||
      'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)',
    deleted_user_emails: JSON.stringify(deletedEmails),
    initial_seed_completed: 'true',
  };
}

function parseSettingsFromRows(
  rows: Array<{ key: string; value: string }>
): { settings: AdminSettings; deletedEmails: string[] } {
  const defaults = createDefaultSettings();
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(r.key, r.value);
  }

  let deletedEmails: string[] = [];
  const rawDeleted = map.get('deleted_user_emails');
  if (rawDeleted) {
    try {
      const parsed = JSON.parse(rawDeleted);
      if (Array.isArray(parsed)) deletedEmails = parsed;
    } catch {
      // ignore
    }
  }

  return {
    deletedEmails,
    settings: {
      kosName: map.get('kosName') || defaults.kosName,
      kosAddress: map.get('kosAddress') || defaults.kosAddress,
      adminPhone: map.get('adminPhone') || defaults.adminPhone,
      dueDay: Number(map.get('dueDay') ?? defaults.dueDay),
      depositPercentage: Number(map.get('depositPercentage') ?? defaults.depositPercentage),
      bookingWindowHours: Number(map.get('bookingWindowHours') ?? defaults.bookingWindowHours),
      timezone: map.get('timezone') || defaults.timezone,
      lateFeeEnabled: map.get('lateFeeEnabled') === 'true',
      lateFeeDailyAmount: Number(map.get('lateFeeDailyAmount') ?? defaults.lateFeeDailyAmount),
      semesterPrice: Number(map.get('semesterPrice') ?? defaults.semesterPrice),
      depositPolicy: map.get('depositPolicy') || defaults.depositPolicy,
      latePolicy: map.get('latePolicy') || defaults.latePolicy,
    },
  };
}

/**
 * Menulis perubahan baris ke Neon PostgreSQL secara berurutan (tanpa db.transaction() agar 100% aman di neon-http).
 */
async function syncDataToNeonPostgres(data: KosOmiPersistentData): Promise<void> {
  const neonDb = getNeonDb();
  if (!neonDb || process.env.VITEST || process.env.NODE_ENV === 'test') return;

  const hashes = getRowHashes();

  // 1. Settings
  const settingsMap = serializeSettingsToMap(data.settings, data.deletedEmails);
  for (const [key, value] of Object.entries(settingsMap)) {
    const hKey = `setting:${key}`;
    if (hashes.get(hKey) !== value) {
      await neonDb
        .insert(schema.settings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: schema.settings.key,
          set: { value, updatedAt: new Date() },
        });
      hashes.set(hKey, value);
    }
  }

  // 2. Rooms
  const roomIdsByCode = new Map<string, string>();
  for (const r of data.rooms) {
    roomIdsByCode.set(r.code, r.id);
    const sig = JSON.stringify([r.status, r.monthlyPrice, r.depositAmount, r.areaSqm, r.type, r.description, r.facilities]);
    const hKey = `room:${r.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.rooms)
        .values({
          id: r.id,
          code: r.code,
          floor: r.floor,
          type: r.type,
          status: r.status,
          areaSqm: r.areaSqm,
          monthlyPrice: r.monthlyPrice,
          depositAmount: r.depositAmount,
          facilities: r.facilities,
          description: r.description,
          photoUrls: r.photoUrls,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.rooms.id,
          set: {
            status: r.status,
            monthlyPrice: r.monthlyPrice,
            depositAmount: r.depositAmount,
            areaSqm: r.areaSqm,
            type: r.type,
            facilities: r.facilities,
            description: r.description,
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 3. Users
  const validUserIds = new Set<string>();
  const userIdsByEmail = new Map<string, string>();
  for (const u of data.authUsers) {
    validUserIds.add(u.id);
    userIdsByEmail.set(u.email.toLowerCase().trim(), u.id);
    const adm = data.adminUsers.find(
      (a) => a.email.toLowerCase().trim() === u.email.toLowerCase().trim()
    );
    const resolvedPhone = adm?.phone || u.phone || '-';
    const resolvedHash =
      u.passwordHash === DEFAULT_PASSWORD_HASH || !u.passwordHash.startsWith('$2')
        ? bcrypt.hashSync(SEED_DEFAULT_PASSWORD, 10)
        : u.passwordHash;
    u.passwordHash = resolvedHash;

    const sig = JSON.stringify([
      u.name,
      u.nim,
      u.email,
      resolvedHash,
      resolvedPhone,
      u.role,
      u.roomCode,
      u.isActive,
      u.failedLoginCount,
      u.lockedUntil,
      u.lastLoginAt,
    ]);
    const hKey = `user:${u.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.users)
        .values({
          id: u.id,
          name: u.name,
          nim: u.nim || u.email.split('@')[0],
          email: u.email.toLowerCase().trim(),
          passwordHash: resolvedHash,
          phone: resolvedPhone,
          role: u.role,
          roomCode: u.roomCode || null,
          isActive: u.isActive,
          failedLoginCount: u.failedLoginCount || 0,
          lockedUntil: u.lockedUntil ? new Date(u.lockedUntil) : null,
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : new Date(),
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.users.id,
          set: {
            name: u.name,
            nim: u.nim || u.email.split('@')[0],
            email: u.email.toLowerCase().trim(),
            passwordHash: resolvedHash,
            phone: resolvedPhone,
            role: u.role,
            roomCode: u.roomCode || null,
            isActive: u.isActive,
            failedLoginCount: u.failedLoginCount || 0,
            lockedUntil: u.lockedUntil ? new Date(u.lockedUntil) : null,
            lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : new Date(),
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  const fallbackAdminId = data.authUsers[0]?.id || 'usr-admin-01';

  // 4. Reservations
  const validReservationIds = new Set<string>();
  const reservationByCode = new Map<string, Reservation>();
  for (const rsv of data.reservations) {
    const resolvedUserId = validUserIds.has(rsv.userId)
      ? rsv.userId
      : userIdsByEmail.get(rsv.userEmail.toLowerCase().trim()) || fallbackAdminId;
    const resolvedRoomId = roomIdsByCode.get(rsv.roomCode) || rsv.roomId || 'room-1';
    validReservationIds.add(rsv.id);
    reservationByCode.set(rsv.code, rsv);

    const sig = JSON.stringify([
      rsv.status,
      rsv.adminNotes,
      rsv.rejectionReason,
      rsv.expiresAt,
      rsv.userName,
      rsv.userPhone,
    ]);
    const hKey = `rsv:${rsv.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.reservations)
        .values({
          id: rsv.id,
          code: rsv.code,
          userId: resolvedUserId,
          roomId: resolvedRoomId,
          roomCode: rsv.roomCode,
          userName: rsv.userName,
          userEmail: rsv.userEmail,
          userPhone: rsv.userPhone,
          userNik: rsv.userNik,
          userOccupation: rsv.userOccupation || null,
          emergencyContactName: rsv.emergencyContactName || null,
          emergencyContactPhone: rsv.emergencyContactPhone || null,
          emergencyContactRelation: rsv.emergencyContactRelation || null,
          startDate: rsv.checkInDate,
          durationMonths: rsv.durationMonths || 6,
          monthlyPrice: rsv.monthlyPrice,
          depositAmount: rsv.depositAmount || 0,
          totalInitialPayment: rsv.totalInitialPayment,
          status: rsv.status,
          idCardUrl: rsv.ktpUrl || '/rooms/kamar-1.png',
          notes: rsv.adminNotes || null,
          rejectReason: rsv.rejectionReason || null,
          paymentDeadline: rsv.expiresAt ? new Date(rsv.expiresAt) : null,
          createdAt: rsv.createdAt ? new Date(rsv.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.reservations.id,
          set: {
            status: rsv.status,
            notes: rsv.adminNotes || null,
            rejectReason: rsv.rejectionReason || null,
            paymentDeadline: rsv.expiresAt ? new Date(rsv.expiresAt) : null,
            userName: rsv.userName,
            userPhone: rsv.userPhone,
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 5. Tenancies
  const validTenancyIds = new Set<string>();
  for (const ten of data.tenancies) {
    const resolvedUserId = validUserIds.has(ten.userId)
      ? ten.userId
      : userIdsByEmail.get(ten.userEmail.toLowerCase().trim()) || fallbackAdminId;
    const resolvedRoomId = roomIdsByCode.get(ten.roomCode) || ten.roomId || 'room-1';
    validTenancyIds.add(ten.id);

    const sig = JSON.stringify([ten.status, ten.checkInDate, ten.checkOutDate, ten.contractEndDate, ten.userName, ten.userPhone]);
    const hKey = `ten:${ten.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.tenancies)
        .values({
          id: ten.id,
          userId: resolvedUserId,
          roomId: resolvedRoomId,
          roomCode: ten.roomCode,
          reservationId: validReservationIds.has(ten.id) ? ten.id : null,
          userName: ten.userName,
          userEmail: ten.userEmail,
          userPhone: ten.userPhone,
          userNik: ten.userNik || null,
          idCardUrl: ten.idCardUrl || null,
          checkInDate: ten.checkInDate,
          checkOutDate: ten.checkOutDate || null,
          contractEndDate: ten.contractEndDate,
          monthlyPrice: ten.monthlyPrice,
          depositAmount: ten.depositAmount || 0,
          dueDay: ten.dueDay || 5,
          depositRefunded: ten.depositRefunded || false,
          status: ten.status,
          emergencyContact: ten.emergencyContact || null,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.tenancies.id,
          set: {
            status: ten.status,
            checkInDate: ten.checkInDate,
            checkOutDate: ten.checkOutDate || null,
            contractEndDate: ten.contractEndDate,
            userName: ten.userName,
            userPhone: ten.userPhone,
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 6. Invoices (Booking Invoices + Sewa Semesteran/Bulanan Bills)
  const validInvoiceIds = new Map<string, string>(); // invoiceCode -> invoiceId
  for (const pay of data.payments) {
    const matchedRsv = reservationByCode.get(pay.reservationCode);
    const resolvedUserId = matchedRsv
      ? validUserIds.has(matchedRsv.userId)
        ? matchedRsv.userId
        : userIdsByEmail.get(matchedRsv.userEmail.toLowerCase().trim()) || fallbackAdminId
      : fallbackAdminId;
    validInvoiceIds.set(pay.invoiceCode.toUpperCase(), pay.id);

    const sig = JSON.stringify([pay.status, pay.paymentMethod, pay.paidAt, pay.snapToken]);
    const hKey = `inv:${pay.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.invoices)
        .values({
          id: pay.id,
          invoiceNumber: pay.invoiceCode,
          userId: resolvedUserId,
          reservationId: matchedRsv && validReservationIds.has(matchedRsv.id) ? matchedRsv.id : null,
          reservationCode: pay.reservationCode,
          tenancyId: null,
          roomCode: pay.roomCode,
          tenantName: matchedRsv?.userName || null,
          tenantEmail: matchedRsv?.userEmail || null,
          tenantPhone: matchedRsv?.userPhone || null,
          type: 'BOOKING',
          periodMonth: 'Sewa Semester Pertama (6 Bulan)',
          periodKey: (pay.createdAt || new Date().toISOString()).slice(0, 7),
          amount: pay.amount,
          dueDate: matchedRsv?.checkInDate || new Date().toISOString().slice(0, 10),
          status: pay.status,
          paymentMethod: pay.paymentMethod || 'QRIS',
          midtransOrderId: pay.midtransOrderId || pay.invoiceCode,
          snapToken: pay.snapToken || null,
          snapRedirectUrl: pay.snapRedirectUrl || null,
          paidAt: pay.paidAt ? new Date(pay.paidAt) : null,
          expiresAt: pay.expiresAt ? new Date(pay.expiresAt) : null,
          createdAt: pay.createdAt ? new Date(pay.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.invoices.id,
          set: {
            status: pay.status,
            paymentMethod: pay.paymentMethod || 'QRIS',
            snapToken: pay.snapToken || null,
            snapRedirectUrl: pay.snapRedirectUrl || null,
            paidAt: pay.paidAt ? new Date(pay.paidAt) : null,
            expiresAt: pay.expiresAt ? new Date(pay.expiresAt) : null,
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  for (const bill of data.bills) {
    if (validInvoiceIds.has(bill.invoiceCode.toUpperCase())) continue;
    const resolvedUserId =
      userIdsByEmail.get(bill.tenantEmail.toLowerCase().trim()) || fallbackAdminId;
    const matchedTen = data.tenancies.find(
      (t) => t.roomCode === bill.roomCode && t.userEmail.toLowerCase() === bill.tenantEmail.toLowerCase()
    );
    validInvoiceIds.set(bill.invoiceCode.toUpperCase(), bill.id);

    const sig = JSON.stringify([bill.status, bill.paymentMethod, bill.paidAt]);
    const hKey = `inv:${bill.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.invoices)
        .values({
          id: bill.id,
          invoiceNumber: bill.invoiceCode,
          userId: resolvedUserId,
          reservationId: null,
          reservationCode: null,
          tenancyId: matchedTen && validTenancyIds.has(matchedTen.id) ? matchedTen.id : null,
          roomCode: bill.roomCode,
          tenantName: bill.tenantName,
          tenantEmail: bill.tenantEmail,
          tenantPhone: bill.tenantPhone,
          type: 'SEWA_BULANAN',
          periodMonth: bill.periodMonth,
          periodKey: bill.periodKey,
          amount: bill.totalAmount || bill.rentAmount,
          dueDate: bill.dueDate,
          status: bill.status,
          paymentMethod: bill.paymentMethod || 'QRIS',
          midtransOrderId: `KOS-${bill.invoiceCode}`,
          notes: bill.notes || null,
          paidAt: bill.paidAt ? new Date(bill.paidAt) : null,
          createdAt: bill.createdAt ? new Date(bill.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.invoices.id,
          set: {
            status: bill.status,
            paymentMethod: bill.paymentMethod || 'QRIS',
            paidAt: bill.paidAt ? new Date(bill.paidAt) : null,
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 7. Payments (Transaksi Kas Keuangan)
  for (const tx of data.transactions) {
    const matchedInvoiceId =
      validInvoiceIds.get(tx.invoiceNumber.toUpperCase()) ||
      validInvoiceIds.get(tx.orderId.toUpperCase());
    if (!matchedInvoiceId) continue;

    const sig = JSON.stringify([tx.transactionStatus, tx.settlementTime, tx.grossAmount]);
    const hKey = `pay:${tx.id}`;
    if (hashes.get(hKey) !== sig) {
      await neonDb
        .insert(schema.payments)
        .values({
          id: tx.id,
          invoiceId: matchedInvoiceId,
          invoiceNumber: tx.invoiceNumber,
          midtransOrderId: tx.orderId,
          midtransTransactionId: tx.midtransTransactionId,
          userName: tx.userName,
          userEmail: tx.userEmail,
          userPhone: tx.userPhone,
          roomCode: tx.roomCode,
          category: tx.category,
          paymentType: tx.paymentType,
          bank: tx.bank || null,
          grossAmount: tx.grossAmount,
          transactionStatus: tx.transactionStatus,
          fraudStatus: tx.fraudStatus || 'accept',
          settlementTime: tx.settlementTime ? new Date(tx.settlementTime) : null,
          createdAt: tx.createdAt ? new Date(tx.createdAt) : new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.payments.id,
          set: {
            transactionStatus: tx.transactionStatus,
            settlementTime: tx.settlementTime ? new Date(tx.settlementTime) : null,
            updatedAt: new Date(),
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 8. Notification Logs
  for (const ntf of data.notificationLogs) {
    const sig = JSON.stringify([ntf.status, ntf.attempts, ntf.sentAt]);
    const hKey = `ntf:${ntf.id}`;
    if (hashes.get(hKey) !== sig) {
      const matchedUid = userIdsByEmail.get(ntf.recipient.toLowerCase().trim()) || null;
      await neonDb
        .insert(schema.notificationLogs)
        .values({
          id: ntf.id,
          userId: matchedUid,
          recipientName: ntf.recipientName,
          channel: ntf.channel,
          template: ntf.template.slice(0, 160),
          recipient: ntf.recipient,
          status: ntf.status,
          attempts: ntf.attempts || 1,
          errorMessage: ntf.errorMessage || null,
          sentAt: ntf.sentAt ? new Date(ntf.sentAt) : null,
          createdAt: ntf.createdAt ? new Date(ntf.createdAt) : new Date(),
        })
        .onConflictDoUpdate({
          target: schema.notificationLogs.id,
          set: {
            status: ntf.status,
            attempts: ntf.attempts || 1,
            errorMessage: ntf.errorMessage || null,
            sentAt: ntf.sentAt ? new Date(ntf.sentAt) : null,
          },
        });
      hashes.set(hKey, sig);
    }
  }

  // 9. Audit Logs
  for (const aud of data.auditLogs) {
    const hKey = `aud:${aud.id}`;
    if (!hashes.has(hKey)) {
      const safeActorId = validUserIds.has(aud.actorId) ? aud.actorId : null;
      await neonDb
        .insert(schema.auditLogs)
        .values({
          id: aud.id,
          actorId: safeActorId,
          actorName: aud.actorName,
          actorRole: aud.actorRole,
          action: aud.action.slice(0, 80),
          entity: aud.entity.slice(0, 60),
          entityId: aud.entityId.slice(0, 80),
          meta: aud.meta,
          createdAt: aud.createdAt ? new Date(aud.createdAt) : new Date(),
        })
        .onConflictDoNothing();
      hashes.set(hKey, '1');
    }
  }
}

/**
 * Menghapus relasi Foreign Key pengguna secara berurutan di Neon PostgreSQL tanpa db.transaction().
 */
export async function deleteUserFromNeonPostgres(params: {
  userId: string;
  email: string;
  phone?: string;
  releasedRooms: string[];
}): Promise<void> {
  const neonDb = getNeonDb();
  if (!neonDb || process.env.VITEST || process.env.NODE_ENV === 'test') return;

  const emailNorm = params.email.toLowerCase().trim();
  const hashes = getRowHashes();

  // 1) Hapus notification_logs milik user
  await neonDb
    .delete(schema.notificationLogs)
    .where(
      or(
        eq(schema.notificationLogs.userId, params.userId),
        eq(schema.notificationLogs.recipient, emailNorm)
      )
    );

  // 2) Set actor_id = null pada audit_logs milik user
  await neonDb
    .update(schema.auditLogs)
    .set({ actorId: null })
    .where(eq(schema.auditLogs.actorId, params.userId));

  // 3) Hapus payments milik user / invoice terkait
  const userInvs = await neonDb
    .select({ id: schema.invoices.id })
    .from(schema.invoices)
    .where(
      or(
        eq(schema.invoices.userId, params.userId),
        eq(schema.invoices.tenantEmail, emailNorm)
      )
    );
  for (const inv of userInvs) {
    await neonDb.delete(schema.payments).where(eq(schema.payments.invoiceId, inv.id));
    hashes.delete(`inv:${inv.id}`);
  }
  await neonDb.delete(schema.payments).where(eq(schema.payments.userEmail, emailNorm));

  // 4) Hapus invoices, tenancies, dan reservations milik user
  await neonDb
    .delete(schema.invoices)
    .where(
      or(
        eq(schema.invoices.userId, params.userId),
        eq(schema.invoices.tenantEmail, emailNorm)
      )
    );

  await neonDb
    .delete(schema.tenancies)
    .where(
      or(
        eq(schema.tenancies.userId, params.userId),
        eq(schema.tenancies.userEmail, emailNorm)
      )
    );

  await neonDb
    .delete(schema.reservations)
    .where(
      or(
        eq(schema.reservations.userId, params.userId),
        eq(schema.reservations.userEmail, emailNorm)
      )
    );

  // 5) Kembalikan status kamar terkait menjadi TERSEDIA
  for (const rCode of params.releasedRooms) {
    await neonDb
      .update(schema.rooms)
      .set({ status: 'TERSEDIA', updatedAt: new Date() })
      .where(eq(schema.rooms.code, rCode));
  }

  // 6) Hapus record dari tabel users
  await neonDb
    .delete(schema.users)
    .where(
      or(eq(schema.users.id, params.userId), eq(schema.users.email, emailNorm))
    );
  hashes.delete(`user:${params.userId}`);
}

/**
 * Menghidrasi data langsung dari Neon PostgreSQL.
 * Seeding awal HANYA dijalankan satu kali apabila tabel `rooms` masih kosong (0 baris).
 */
export async function ensurePostgresHydrated(force = false): Promise<KosOmiPersistentData> {
  const neonDb = getNeonDb();
  if (!neonDb || process.env.VITEST || process.env.NODE_ENV === 'test') {
    return loadPersistentStore();
  }

  // Tunggu antrean penulisan sebelumnya selesai agar pembacaan selalu konsisten
  if (global.__kosOmiPgSyncChain) {
    try {
      await global.__kosOmiPgSyncChain;
    } catch {
      // ignore
    }
  }

  const now = Date.now();
  if (
    !force &&
    global.__kosOmiUnifiedStore &&
    global.__kosOmiPgLastHydratedAt &&
    now - global.__kosOmiPgLastHydratedAt < 250
  ) {
    return global.__kosOmiUnifiedStore;
  }

  if (global.__kosOmiPgHydratePromise) {
    return global.__kosOmiPgHydratePromise;
  }

  global.__kosOmiPgHydratePromise = (async () => {
    try {
      const [existingRooms, existingSettings] = await Promise.all([
        neonDb.select().from(schema.rooms),
        neonDb.select().from(schema.settings),
      ]);

      const seedCompleted = existingSettings.some(
        (s) => s.key === 'initial_seed_completed' && s.value === 'true'
      );

      // ONE-TIME INITIAL SEED: hanya apabila tabel rooms kosong (0 baris) atau proses seed pertama sempat terputus sebelum selesai
      if (existingRooms.length === 0 || !seedCompleted) {
        const existingUsersCheck =
          existingRooms.length > 0 ? await neonDb.select().from(schema.users) : [];

        if (existingRooms.length === 0 || existingUsersCheck.length === 0) {
          const initial = createInitialData();
          syncAllStores(initial);
          bindGlobals(initial);
          getRowHashes().clear();

          // 1. Batch insert 67 kamar sekaligus
          await neonDb
            .insert(schema.rooms)
            .values(
              initial.rooms.map((r) => ({
                id: r.id,
                code: r.code,
                floor: r.floor,
                type: r.type,
                status: r.status,
                areaSqm: r.areaSqm,
                monthlyPrice: r.monthlyPrice,
                depositAmount: r.depositAmount,
                facilities: r.facilities,
                description: r.description,
                photoUrls: r.photoUrls,
              }))
            )
            .onConflictDoNothing();

          // 2. Batch insert 5 akun role utama sekaligus
          await neonDb
            .insert(schema.users)
            .values(
              initial.authUsers.map((u) => ({
                id: u.id,
                name: u.name,
                nim: u.nim || u.email.split('@')[0],
                email: u.email.toLowerCase().trim(),
                passwordHash: u.passwordHash,
                phone: u.phone || '-',
                role: u.role,
                roomCode: u.roomCode || null,
                isActive: u.isActive,
                failedLoginCount: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
            )
            .onConflictDoNothing();

          // 3. Batch insert seluruh kontrak hunian aktif real Kos Omi 2026
          if (initial.tenancies.length > 0) {
            await neonDb
              .insert(schema.tenancies)
              .values(
                initial.tenancies.map((ten) => ({
                  id: ten.id,
                  userId: ten.userId,
                  roomId: ten.roomId || `room-${ten.roomCode}`,
                  roomCode: ten.roomCode,
                  reservationId: null,
                  userName: ten.userName,
                  userEmail: ten.userEmail,
                  userPhone: ten.userPhone || '-',
                  userNik: ten.userNik || '-',
                  idCardUrl: ten.idCardUrl || `/rooms/kamar-${ten.roomCode}.png`,
                  checkInDate: ten.checkInDate,
                  checkOutDate: ten.checkOutDate || null,
                  contractEndDate: ten.contractEndDate,
                  monthlyPrice: ten.monthlyPrice,
                  depositAmount: ten.depositAmount || 0,
                  dueDay: ten.dueDay || 5,
                  depositRefunded: Boolean(ten.depositRefunded),
                  status: ten.status,
                  emergencyContact: ten.emergencyContact || null,
                  createdAt: new Date(),
                }))
              )
              .onConflictDoNothing();
          }

          // 4. Batch insert seluruh pengaturan kos + penanda initial_seed_completed = true (paling akhir)
          const settingsEntries = Object.entries(
            serializeSettingsToMap(initial.settings, initial.deletedEmails)
          );
          await neonDb
            .insert(schema.settings)
            .values(
              settingsEntries.map(([key, value]) => ({
                key,
                value,
                updatedAt: new Date(),
              }))
            )
            .onConflictDoUpdate({
              target: schema.settings.key,
              set: { updatedAt: new Date() },
            });

          await syncDataToNeonPostgres(initial);
          global.__kosOmiPgLastHydratedAt = Date.now();
          return initial;
        }
      }

      // Tabel sudah berisi data -> BACA MURNI DARI POSTGRESQL (TIDAK PERNAH AUTO-SEED ULANG)
      const [
        dbUsers,
        dbReservations,
        dbTenancies,
        dbInvoices,
        dbPayments,
        dbNotifications,
        dbAudits,
      ] = await Promise.all([
        neonDb.select().from(schema.users).orderBy(desc(schema.users.createdAt)),
        neonDb.select().from(schema.reservations).orderBy(desc(schema.reservations.createdAt)),
        neonDb.select().from(schema.tenancies).orderBy(desc(schema.tenancies.createdAt)),
        neonDb.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt)),
        neonDb.select().from(schema.payments).orderBy(desc(schema.payments.createdAt)),
        neonDb
          .select()
          .from(schema.notificationLogs)
          .orderBy(desc(schema.notificationLogs.createdAt)),
        neonDb.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)),
      ]);
      const dbSettings = existingSettings;

      const { settings, deletedEmails } = parseSettingsFromRows(dbSettings);
      const hashes = getRowHashes();
      hashes.clear();

      for (const s of dbSettings) {
        hashes.set(`setting:${s.key}`, s.value);
      }

      const rooms: Room[] = existingRooms
        .map((r) => {
          const mapped: Room = {
            id: r.id,
            code: r.code,
            floor: r.floor,
            type: r.type,
            status: r.status,
            areaSqm: r.areaSqm,
            monthlyPrice: r.monthlyPrice,
            depositAmount: r.depositAmount,
            facilities: Array.isArray(r.facilities) ? r.facilities : [],
            description: r.description || '',
            photoUrls:
              Array.isArray(r.photoUrls) && r.photoUrls.length > 0
                ? r.photoUrls
                : [`/rooms/kamar-${r.code}.png`],
          };
          hashes.set(
            `room:${mapped.id}`,
            JSON.stringify([
              mapped.status,
              mapped.monthlyPrice,
              mapped.depositAmount,
              mapped.areaSqm,
              mapped.type,
              mapped.description,
              mapped.facilities,
            ])
          );
          return mapped;
        })
        .sort((a, b) => a.floor - b.floor || (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));

      const authUsers: UserAuthRecord[] = dbUsers.map((u) => {
        const rec: UserAuthRecord = {
          id: u.id,
          name: u.name,
          nim: u.nim || u.email.split('@')[0],
          email: u.email,
          passwordHash: u.passwordHash,
          phone: u.phone,
          role: u.role,
          roomCode: u.roomCode || undefined,
          isActive: u.isActive,
          whatsappNotifEnabled: u.whatsappNotifEnabled,
          failedLoginCount: u.failedLoginCount,
          lockedUntil: u.lockedUntil ? u.lockedUntil.toISOString() : null,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : u.createdAt.toISOString(),
        };
        hashes.set(
          `user:${u.id}`,
          JSON.stringify([
            rec.name,
            rec.nim,
            rec.email,
            rec.passwordHash,
            rec.phone,
            rec.role,
            rec.roomCode,
            rec.isActive,
            rec.failedLoginCount,
            rec.lockedUntil,
            rec.lastLoginAt,
          ])
        );
        return rec;
      });

      const adminUsers: AdminUserRecord[] = authUsers.map((u) => ({
        id: u.id,
        name: u.name,
        nim: u.nim,
        email: u.email,
        phone: u.phone,
        role: u.role,
        roomCode: u.roomCode,
        passwordHashPreview: formatPasswordHashPreview(u.passwordHash),
        isActive: u.isActive,
        createdAt: u.createdAt || new Date().toISOString(),
        lastLoginAt: u.lastLoginAt,
      }));

      const payments: PaymentInvoice[] = [];
      const bills: MonthlyBill[] = [];

      for (const inv of dbInvoices) {
        if (inv.type === 'BOOKING') {
          const p: PaymentInvoice = {
            id: inv.id,
            invoiceCode: inv.invoiceNumber,
            reservationId: inv.reservationId || '',
            reservationCode: inv.reservationCode || '',
            roomCode: inv.roomCode,
            amount: inv.amount,
            status: (inv.status as PaymentInvoice['status']) || 'UNPAID',
            paymentMethod: inv.paymentMethod || 'QRIS',
            midtransOrderId: inv.midtransOrderId || inv.invoiceNumber,
            snapToken: inv.snapToken || undefined,
            snapRedirectUrl: inv.snapRedirectUrl || undefined,
            paidAt: inv.paidAt ? inv.paidAt.toISOString() : undefined,
            expiresAt: inv.expiresAt
              ? inv.expiresAt.toISOString()
              : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            createdAt: inv.createdAt.toISOString(),
          };
          payments.push(p);
          hashes.set(
            `inv:${p.id}`,
            JSON.stringify([p.status, p.paymentMethod, p.paidAt, p.snapToken])
          );
        } else {
          const b: MonthlyBill = {
            id: inv.id,
            invoiceCode: inv.invoiceNumber,
            periodMonth: inv.periodMonth || 'Sewa Semesteran (6 Bulan)',
            periodKey: inv.periodKey || inv.createdAt.toISOString().slice(0, 7),
            year: Number((inv.periodKey || '2026').slice(0, 4)) || 2026,
            roomCode: inv.roomCode,
            tenantName: inv.tenantName || 'Penghuni Kos',
            tenantEmail: inv.tenantEmail || '',
            tenantPhone: inv.tenantPhone || '-',
            dueDate: inv.dueDate,
            rentAmount: inv.amount,
            amount: inv.amount,
            totalAmount: inv.amount,
            status: (inv.status as MonthlyBill['status']) || 'BELUM_BAYAR',
            paymentMethod: inv.paymentMethod || 'QRIS',
            paidAt: inv.paidAt ? inv.paidAt.toISOString() : undefined,
            createdAt: inv.createdAt.toISOString(),
            notes: inv.notes || undefined,
          };
          bills.push(b);
          hashes.set(`inv:${b.id}`, JSON.stringify([b.status, b.paymentMethod, b.paidAt]));
        }
      }

      const reservations: Reservation[] = dbReservations.map((r) => {
        const mapped: Reservation = {
          id: r.id,
          code: r.code,
          roomId: r.roomId,
          roomCode: r.roomCode,
          userId: r.userId,
          userName: r.userName,
          userEmail: r.userEmail,
          userPhone: r.userPhone,
          userNik: r.userNik,
          userOccupation: r.userOccupation || '',
          emergencyContactName: r.emergencyContactName || '',
          emergencyContactPhone: r.emergencyContactPhone || '',
          emergencyContactRelation: r.emergencyContactRelation || '',
          ktpUrl: r.idCardUrl,
          checkInDate: r.startDate,
          durationMonths: r.durationMonths,
          monthlyPrice: r.monthlyPrice,
          depositAmount: r.depositAmount,
          totalInitialPayment: r.totalInitialPayment,
          status: r.status as Reservation['status'],
          adminNotes: r.notes || undefined,
          rejectionReason: r.rejectReason || undefined,
          expiresAt: r.paymentDeadline ? r.paymentDeadline.toISOString() : undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
        hashes.set(
          `rsv:${mapped.id}`,
          JSON.stringify([
            mapped.status,
            mapped.adminNotes,
            mapped.rejectionReason,
            mapped.expiresAt,
            mapped.userName,
            mapped.userPhone,
          ])
        );
        return mapped;
      });

      const tenancies: TenancyRecord[] = dbTenancies.map((t) => {
        const roomFloor = parseInt(t.roomCode, 10) <= 33 ? 1 : 2;
        const tenantBills = bills.filter(
          (b) => b.roomCode === t.roomCode && b.tenantEmail.toLowerCase() === t.userEmail.toLowerCase()
        );
        const unpaidInvs = tenantBills
          .filter((b) => b.status === 'BELUM_BAYAR' || b.status === 'TERLAMBAT')
          .map((b) => ({
            id: b.id,
            invoiceNumber: b.invoiceCode,
            periodMonth: b.periodMonth,
            amount: b.totalAmount || b.rentAmount,
            dueDate: b.dueDate,
            status: b.status as 'BELUM_BAYAR' | 'TERLAMBAT',
            description: b.notes || `Sewa Kamar ${t.roomCode}`,
          }));
        const paidBooking = payments.find(
          (p) =>
            p.roomCode === t.roomCode &&
            p.status === 'SETTLEMENT' &&
            reservations.some(
              (r) =>
                r.code === p.reservationCode &&
                r.userEmail.toLowerCase() === t.userEmail.toLowerCase()
            )
        );
        const pastInvs = [
          ...tenantBills
            .filter((b) => b.status === 'LUNAS')
            .map((b) => ({
              id: b.id,
              invoiceNumber: b.invoiceCode,
              periodMonth: b.periodMonth,
              amount: b.totalAmount || b.rentAmount,
              paidAt: b.paidAt || t.createdAt.toISOString(),
              paymentMethod: b.paymentMethod || 'QRIS',
              status: 'LUNAS' as const,
            })),
          ...(paidBooking &&
          !tenantBills.some((b) => b.invoiceCode === paidBooking.invoiceCode)
            ? [
                {
                  id: paidBooking.id,
                  invoiceNumber: paidBooking.invoiceCode,
                  periodMonth: 'Sewa Semester Pertama (6 Bulan)',
                  amount: paidBooking.amount,
                  paidAt: paidBooking.paidAt || t.createdAt.toISOString(),
                  paymentMethod: paidBooking.paymentMethod || 'QRIS',
                  status: 'LUNAS' as const,
                },
              ]
            : []),
        ];

        const mapped: TenancyRecord = {
          id: t.id,
          userId: t.userId,
          userName: t.userName,
          userEmail: t.userEmail,
          userPhone: t.userPhone,
          userNik: t.userNik || '-',
          idCardUrl: t.idCardUrl || `/rooms/kamar-${t.roomCode}.png`,
          roomId: t.roomId,
          roomCode: t.roomCode,
          roomFloor,
          roomType: 'STANDAR_AC',
          monthlyPrice: t.monthlyPrice,
          depositAmount: t.depositAmount,
          checkInDate: t.checkInDate,
          contractEndDate: t.contractEndDate,
          checkOutDate: t.checkOutDate || null,
          dueDay: t.dueDay,
          status: t.status,
          depositRefunded: t.depositRefunded,
          unpaidBillsCount: unpaidInvs.length,
          totalUnpaidAmount: unpaidInvs.reduce((s, i) => s + i.amount, 0),
          unpaidInvoices: unpaidInvs,
          pastInvoices: pastInvs,
          emergencyContact: t.emergencyContact || {
            name: 'Orang Tua / Wali',
            relation: 'Keluarga',
            phone: t.userPhone,
          },
        };
        hashes.set(
          `ten:${mapped.id}`,
          JSON.stringify([
            mapped.status,
            mapped.checkInDate,
            mapped.checkOutDate,
            mapped.contractEndDate,
            mapped.userName,
            mapped.userPhone,
          ])
        );
        return mapped;
      });

      const profiles: TenantProfile[] = tenancies
        .filter((t) => t.status === 'AKTIF')
        .map((t) => ({
          id: t.userId,
          name: t.userName,
          email: t.userEmail,
          phone: t.userPhone,
          nik: t.userNik,
          occupation: 'Mahasiswi UIN Imam Bonjol Padang',
          roomCode: t.roomCode,
          checkInDate: t.checkInDate,
          tenancyEnd: t.contractEndDate,
          emergencyContactName: t.emergencyContact.name,
          emergencyContactPhone: t.emergencyContact.phone,
          emergencyContactRelation: t.emergencyContact.relation,
          monthlyRent: t.monthlyPrice,
          avatarUrl: t.idCardUrl,
        }));

      const transactions: PaymentTransaction[] = dbPayments.map((p) => {
        const tx: PaymentTransaction = {
          id: p.id,
          orderId: p.midtransOrderId,
          invoiceNumber: p.invoiceNumber || p.midtransOrderId,
          midtransTransactionId: p.midtransTransactionId || `MID-${p.midtransOrderId}`,
          userName: p.userName || 'Penghuni Kos',
          userEmail: p.userEmail || '-',
          userPhone: p.userPhone || '-',
          roomCode: p.roomCode || '1',
          category: (p.category as PaymentTransaction['category']) || 'BOOKING',
          paymentType: (p.paymentType as PaymentTransaction['paymentType']) || 'qris',
          bank: (p.bank as PaymentTransaction['bank']) || undefined,
          grossAmount: p.grossAmount,
          transactionStatus: p.transactionStatus as PaymentTransaction['transactionStatus'],
          fraudStatus: (p.fraudStatus as PaymentTransaction['fraudStatus']) || 'accept',
          settlementTime: p.settlementTime ? p.settlementTime.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
        };
        hashes.set(
          `pay:${tx.id}`,
          JSON.stringify([tx.transactionStatus, tx.settlementTime, tx.grossAmount])
        );
        return tx;
      });

      const notificationLogs: NotificationLogRecord[] = dbNotifications.map((n) => {
        const mapped: NotificationLogRecord = {
          id: n.id,
          recipient: n.recipient,
          recipientName: n.recipientName || n.recipient,
          channel: n.channel,
          template: n.template,
          status: n.status,
          attempts: n.attempts,
          errorMessage: n.errorMessage || null,
          sentAt: n.sentAt ? n.sentAt.toISOString() : null,
          createdAt: n.createdAt.toISOString(),
        };
        hashes.set(`ntf:${mapped.id}`, JSON.stringify([mapped.status, mapped.attempts, mapped.sentAt]));
        return mapped;
      });

      const auditLogs: AuditLogRecord[] = dbAudits.map((a) => {
        hashes.set(`aud:${a.id}`, '1');
        return {
          id: a.id,
          actorId: a.actorId || 'system',
          actorName: a.actorName || 'Sistem Kos Omi',
          actorRole: (a.actorRole as AuditLogRecord['actorRole']) || 'ADMIN',
          action: a.action,
          entity: a.entity,
          entityId: a.entityId,
          meta: (a.meta as Record<string, unknown>) || {},
          createdAt: a.createdAt.toISOString(),
        };
      });

      const calonUsers: CalonUser[] = reservations.map((r) => ({
        id: r.userId,
        name: r.userName,
        email: r.userEmail,
        phone: r.userPhone,
        nik: r.userNik,
        occupation: r.userOccupation || '-',
        emergencyContactName: r.emergencyContactName || '-',
        emergencyContactPhone: r.emergencyContactPhone || r.userPhone,
        emergencyContactRelation: r.emergencyContactRelation || 'Keluarga',
        ktpUrl: r.ktpUrl || '/rooms/kamar-1.png',
        createdAt: r.createdAt,
      }));

      const hydrated: KosOmiPersistentData = {
        version: STORE_SCHEMA_VERSION,
        authUsers,
        adminUsers,
        resetTokens: global.__kosOmiUnifiedStore?.resetTokens || [],
        deletedEmails,
        rooms,
        calonUsers,
        reservations,
        payments,
        tenancies,
        checkinCandidates: [],
        bills,
        profiles,
        transactions,
        overdueBills: [],
        auditLogs,
        notificationLogs,
        settings,
      };

      syncAllStores(hydrated);
      bindGlobals(hydrated);
      global.__kosOmiPgLastHydratedAt = Date.now();
      return hydrated;
    } catch (err) {
      console.error('[NeonDB] Gagal menghidrasi data dari Neon PostgreSQL:', err);
      return loadPersistentStore();
    } finally {
      global.__kosOmiPgHydratePromise = undefined;
    }
  })();

  return global.__kosOmiPgHydratePromise;
}

/**
 * Menunggu antrean penulisan ke Neon PostgreSQL selesai sepenuhnya.
 */
export async function flushPostgresSync(): Promise<void> {
  if (global.__kosOmiPgSyncChain) {
    await global.__kosOmiPgSyncChain;
  }
}

export function loadPersistentStore(): KosOmiPersistentData {
  // Jika Neon PostgreSQL aktif dan memori sudah terhidrasi dari PostgreSQL, kembalikan langsung
  if (getNeonDb() && !process.env.VITEST && process.env.NODE_ENV !== 'test') {
    if (global.__kosOmiUnifiedStore) {
      bindGlobals(global.__kosOmiUnifiedStore);
      return global.__kosOmiUnifiedStore;
    }
    const placeholder = createInitialData();
    syncAllStores(placeholder);
    bindGlobals(placeholder);
    return placeholder;
  }

  // Fallback untuk unit test Vitest atau ketika DATABASE_URL belum diisi
  const filePath = getFallbackFilePath();
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
  } catch {
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

export function savePersistentStore(customData?: KosOmiPersistentData): void {
  const data = customData || global.__kosOmiUnifiedStore;
  if (!data) return;

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
  global.__kosOmiPgLastHydratedAt = Date.now();

  // Jika Neon PostgreSQL aktif, antrekan penulisan langsung ke tabel PostgreSQL
  if (getNeonDb() && !process.env.VITEST && process.env.NODE_ENV !== 'test') {
    const prev = global.__kosOmiPgSyncChain || Promise.resolve();
    global.__kosOmiPgSyncChain = prev
      .then(() => syncDataToNeonPostgres(data))
      .catch((err) => {
        console.error('[NeonDB] Gagal menyinkronkan perubahan ke PostgreSQL:', err);
      });
    return;
  }

  // Fallback simpan ke file sementara saat unit test atau DATABASE_URL belum dikonfigurasi
  const filePath = getFallbackFilePath();
  const serialized = JSON.stringify(data, null, 2);
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, serialized, 'utf-8');
    global.__kosOmiStoreMtime = fs.statSync(filePath).mtimeMs;
  } catch {
    // ignore
  }
}
