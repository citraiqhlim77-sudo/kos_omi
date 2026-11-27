import type { Room, RoomFilterOptions, RoomStatus } from '@/types/room';
import type { CalonUser, Reservation, PaymentInvoice, CreateReservationInput } from '@/types/reservation';
import type { PaymentMethodType } from '@/types/finance';
import { ALL_ROOMS } from '@/data/rooms';
import { createAuditLog } from '@/lib/audit';
import {
  ensurePostgresHydrated,
  flushPostgresSync,
  loadPersistentStore,
  savePersistentStore,
} from '@/server/persistence';

function toPaymentMethodType(methodOrType?: string): PaymentMethodType {
  const lower = (methodOrType || 'qris').toLowerCase();
  if (lower.includes('bank') || lower.includes('va') || lower.includes('bca') || lower.includes('mandiri') || lower.includes('bni') || lower.includes('bri') || lower.includes('permata')) {
    return 'bank_transfer';
  }
  if (lower.includes('gopay')) return 'gopay';
  if (lower.includes('shopee')) return 'shopeepay';
  return 'qris';
}

function toBankType(bank?: string): 'bca' | 'mandiri' | 'bni' | 'bri' | 'permata' | undefined {
  if (!bank) return undefined;
  const b = bank.toLowerCase();
  if (b.includes('bca')) return 'bca';
  if (b.includes('mandiri')) return 'mandiri';
  if (b.includes('bni')) return 'bni';
  if (b.includes('bri')) return 'bri';
  if (b.includes('permata')) return 'permata';
  return undefined;
}

function toFraudStatus(status?: string | null): 'accept' | 'challenge' | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === 'accept') return 'accept';
  if (s === 'challenge') return 'challenge';
  return null;
}

export interface ServerAuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  payloadBefore?: any;
  payloadAfter?: any;
  createdAt: string;
}

// Interface state database in-memory dengan singleton global (awet di hot reload dev Next.js)
interface DatabaseState {
  rooms: Room[];
  users: CalonUser[];
  reservations: Reservation[];
  payments: PaymentInvoice[];
  auditLogs: ServerAuditLog[];
  isInitialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiDbState: DatabaseState | undefined;
}

function initializeState(): DatabaseState {
  const initialRooms: Room[] = JSON.parse(JSON.stringify(ALL_ROOMS)).map((r: Room) => ({
    ...r,
    status: 'TERSEDIA' as RoomStatus,
  }));

  return {
    rooms: initialRooms,
    users: [],
    reservations: [],
    payments: [],
    auditLogs: [],
    isInitialized: true,
  };
}

// Dapatkan instance database terpadu yang tersimpan secara persisten di disk
function getDb(): DatabaseState {
  const store = loadPersistentStore();
  return {
    rooms: store.rooms,
    users: store.calonUsers,
    reservations: store.reservations,
    payments: store.payments,
    auditLogs: [],
    isInitialized: true,
  };
}

async function getHydratedDb(): Promise<DatabaseState> {
  await ensurePostgresHydrated();
  return getDb();
}

// ==========================================
// ROOMS REPOSITORY
// ==========================================

export async function dbGetRooms(filter?: RoomFilterOptions): Promise<Room[]> {
  const db = await getHydratedDb();
  let result = [...db.rooms].sort(
    (a, b) => a.floor - b.floor || (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0)
  );

  if (!filter) return result;

  if (filter.floor && filter.floor !== 'ALL') {
    result = result.filter((r) => r.floor === Number(filter.floor));
  }

  if (filter.type && filter.type !== 'ALL') {
    result = result.filter((r) => r.type === filter.type);
  }

  if (filter.status && filter.status !== 'ALL') {
    result = result.filter((r) => r.status === filter.status);
  }

  if (filter.search && filter.search.trim() !== '') {
    const q = filter.search.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        `lantai ${r.floor}`.includes(q)
    );
  }

  if (filter.sortBy) {
    if (filter.sortBy === 'price-asc') {
      result.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (filter.sortBy === 'price-desc') {
      result.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    } else if (filter.sortBy === 'floor-asc') {
      result.sort((a, b) => a.floor - b.floor || (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
    } else {
      result.sort((a, b) => a.floor - b.floor || (parseInt(a.code, 10) || 0) - (parseInt(b.code, 10) || 0));
    }
  }

  return result;
}

const LEGACY_DB_ROOM_MAP: Record<string, string> = {
  'A-101': '1',
  'A-105': '5',
  'A-112': '12',
  'B-201': '15',
  'B-202': '16',
  'B-203': '17',
  'B-204': '18',
  'D-402': '20',
  'D-404': '22',
  'B-205': '35',
  'B-214': '44',
  'C-302': '45',
  'C-305': '48',
  'C-310': '45',
  'D-416': '60',
};

function resolveRoomCode(codeOrId: string): string {
  const cleaned = codeOrId.toUpperCase().trim().replace(/^(KAMAR\s*)?(NO\.?\s*)?/i, '');
  return LEGACY_DB_ROOM_MAP[cleaned] || cleaned;
}

export async function dbGetRoomByCode(codeOrId: string): Promise<Room | null> {
  const db = await getHydratedDb();
  const normalized = resolveRoomCode(codeOrId);
  const room = db.rooms.find((r) => r.code === normalized || r.id === codeOrId);
  return room ? { ...room } : null;
}

export async function dbUpdateRoomStatus(
  codeOrId: string,
  status: RoomStatus
): Promise<boolean> {
  if (!global.__kosOmiUnifiedStore) {
    await ensurePostgresHydrated();
  }
  const db = getDb();
  const normalized = resolveRoomCode(codeOrId);
  const index = db.rooms.findIndex((r) => r.code === normalized || r.id === codeOrId);
  if (index === -1) return false;
  db.rooms[index].status = status;
  savePersistentStore();
  await flushPostgresSync();
  return true;
}

export async function dbUpdateRoomDetail(
  codeOrId: string,
  data: {
    monthlyPrice?: number;
    depositAmount?: number;
    areaSqm?: number;
    type?: Room['type'];
    facilities?: string[];
    description?: string;
  }
): Promise<Room | null> {
  const db = await getHydratedDb();
  const normalized = resolveRoomCode(codeOrId);
  const index = db.rooms.findIndex((r) => r.code === normalized || r.id === codeOrId);
  if (index === -1) return null;

  db.rooms[index] = {
    ...db.rooms[index],
    ...data,
  };
  savePersistentStore();
  await flushPostgresSync();
  await flushPostgresSync();
  return { ...db.rooms[index] };
}

export async function dbGetRoomTenantHistory(code: string): Promise<any[]> {
  const normalized = code.toUpperCase().trim();
  const db = await getHydratedDb();
  const room = db.rooms.find((r) => r.code === normalized);

  if (!room) return [];

  const histories: any[] = [];

  // 1. Ambil dari penghuni nyata (__kosOmiTenancies) untuk kamar ini
  const realTenants = ((global as any).__kosOmiTenancies as any[] | undefined) || [];
  for (const ten of realTenants) {
    if (ten.roomCode === normalized) {
      histories.push({
        id: ten.id,
        roomCode: normalized,
        tenantName: ten.userName || ten.tenantName,
        tenantPhone: ten.userPhone || ten.tenantPhone,
        tenantEmail: ten.userEmail || ten.tenantEmail,
        startDate: ten.checkInDate,
        endDate: ten.contractEndDate || ten.endDate,
        status: ten.status === 'AKTIF' ? 'AKTIF' : 'SELESAI',
        monthlyRent: ten.monthlyPrice || ten.monthlyRent || room.monthlyPrice,
        depositStatus: 'DIKEMBALIKAN',
        notes: ten.notes || 'Penghuni terdaftar di sistem Kos Omi (1 Semester).',
      });
    }
  }

  // 2. Ambil dari reservasi nyata yang sedang berjalan di kamar ini
  const roomReservations = db.reservations.filter(
    (r) =>
      r.roomCode === normalized &&
      (r.status === 'PENDING_REVIEW' || r.status === 'APPROVED' || r.status === 'PAID')
  );
  for (const rsv of roomReservations) {
    const alreadyInTenants = histories.some(
      (h) => h.tenantEmail?.toLowerCase() === rsv.userEmail.toLowerCase()
    );
    if (!alreadyInTenants) {
      histories.push({
        id: rsv.id,
        roomCode: normalized,
        tenantName: rsv.userName,
        tenantPhone: rsv.userPhone,
        tenantEmail: rsv.userEmail,
        startDate: rsv.checkInDate,
        endDate: `${rsv.durationMonths} Bulan (1 Semester)`,
        status: 'RESERVASI',
        monthlyRent: rsv.monthlyPrice,
        depositStatus: 'MENUNGGU_PEMERIKSAAN',
        notes: `Reservasi ${rsv.code} (${rsv.status}) — ${rsv.userOccupation || 'Mahasiswi'}`,
      });
    }
  }

  return histories;
}

export async function dbGetRoomStats() {
  const db = await getHydratedDb();
  const total = db.rooms.length;
  const available = db.rooms.filter((r) => r.status === 'TERSEDIA').length;
  const booked = db.rooms.filter((r) => r.status === 'DIPESAN').length;
  const occupied = db.rooms.filter((r) => r.status === 'TERISI').length;
  const maintenance = db.rooms.filter((r) => r.status === 'NONAKTIF').length;
  return { total, available, booked, occupied, maintenance };
}

// ==========================================
// RESERVATIONS REPOSITORY
// ==========================================

export async function dbGetReservations(): Promise<Reservation[]> {
  const db = await getHydratedDb();
  return db.reservations.map((res) => {
    const room = db.rooms.find((r) => r.code === res.roomCode);
    const payment = db.payments.find((p) => p.reservationCode === res.code);
    return { ...res, room, payment };
  });
}

export async function dbGetReservationByCode(code: string): Promise<Reservation | null> {
  const db = await getHydratedDb();
  const normalized = code.toUpperCase().trim();
  const res = db.reservations.find((r) => r.code === normalized);
  if (!res) return null;

  const room = db.rooms.find((r) => r.code === res.roomCode);
  const payment = db.payments.find((p) => p.reservationCode === res.code);
  return { ...res, room, payment };
}

export async function dbGetReservationsByUserEmail(email: string): Promise<Reservation[]> {
  const db = await getHydratedDb();
  const normalized = email.toLowerCase().trim();
  if (!normalized) return [];

  let matched = db.reservations.filter((r) => r.userEmail.toLowerCase() === normalized);
  const isDemoCalon =
    normalized === 'calon@example.com' ||
    normalized === 'calon@kosomi.id';

  if (matched.length === 0 && isDemoCalon && db.reservations.length > 0) {
    matched = db.reservations.filter(
      (r) =>
        r.userEmail.toLowerCase() === 'calon@example.com' ||
        r.userEmail.toLowerCase() === 'calon@kosomi.id'
    );
  }

  return matched.map((res) => {
    const room = db.rooms.find((r) => r.code === res.roomCode);
    const payment = db.payments.find((p) => p.reservationCode === res.code);
    return { ...res, room, payment };
  });
}

export async function dbCreateReservation(input: CreateReservationInput): Promise<Reservation> {
  const db = getDb();
  const room = await dbGetRoomByCode(input.roomCode);
  if (!room) {
    throw new Error(`Kamar ${input.roomCode} tidak ditemukan`);
  }

  // Hitung berapa slot yang sudah terpakai di kamar ini
  const activeRoomReservations = db.reservations.filter(
    (r) =>
      r.roomCode === room.code &&
      (r.status === 'PENDING_REVIEW' || r.status === 'APPROVED' || r.status === 'PAID')
  );
  const usedSlots = activeRoomReservations.reduce((sum, r) => {
    const isOneSlot = (r.userOccupation ?? '').includes('1 Slot Sendiri');
    return sum + (isOneSlot ? 1 : 2);
  }, 0);

  if (room.status === 'NONAKTIF' || usedSlots >= 2) {
    throw new Error(`Kamar ${input.roomCode} saat ini sudah penuh (2/2) atau sedang ${room.status}`);
  }

  // Buat kode reservasi unik: RSV-YYYYMM-KODE
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const cleanCode = room.code.replace('-', '');
  const countSameRoom = db.reservations.filter((r) => r.roomCode === room.code).length + 1;
  const reservationCode = `RSV-${dateStr}-${cleanCode}${countSameRoom > 1 ? `-${countSameRoom}` : ''}`;

  const store = loadPersistentStore();
  const normalizedEmail = input.email.toLowerCase().trim();
  const registeredUser =
    store.authUsers.find((u) => u.email.toLowerCase().trim() === normalizedEmail) ||
    store.adminUsers.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

  const isSingleSlotBooking = (input.occupation ?? '').includes('1 Slot Sendiri');
  const baseRoomPrice = store.settings?.semesterPrice || room.monthlyPrice;
  const monthlyPrice = isSingleSlotBooking ? Math.round(baseRoomPrice / 2) : baseRoomPrice;
  const depositAmount = 0;
  const totalInitialPayment = monthlyPrice;

  const newReservation: Reservation = {
    id: `rsv-${Date.now()}`,
    code: reservationCode,
    roomId: room.id,
    roomCode: room.code,
    userId: registeredUser?.id || `usr-${Date.now()}`,
    userName: input.fullName,
    userEmail: normalizedEmail,
    userPhone: input.phone.trim(),
    userNik: input.nik.trim(),
    userOccupation: (input.occupation ?? '').trim(),
    emergencyContactName: (input.emergencyName ?? '').trim(),
    emergencyContactPhone: (input.emergencyPhone ?? '').trim(),
    emergencyContactRelation: (input.emergencyRelation ?? '').trim(),
    ktpUrl: input.ktpUrl || '/rooms/kamar-1.png',
    checkInDate: input.checkInDate,
    durationMonths: input.durationMonths,
    monthlyPrice,
    depositAmount,
    totalInitialPayment,
    status: 'PENDING_REVIEW', // Sesuai PRD: Verifikasi maks 2x24 jam
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.reservations.unshift(newReservation);

  // Kunci kamar menjadi DIPESAN langsung pada store yang sama (tanpa re-hidrasi ulang di tengah mutasi)
  const roomIdx = store.rooms.findIndex((r) => r.code === room.code || r.id === room.id);
  if (roomIdx !== -1) {
    store.rooms[roomIdx].status = 'DIPESAN';
  }

  // Sinkronkan pemohon reservasi ke daftar pengguna Admin & Calon Penghuni
  const existingAdminUser = store.adminUsers.find(
    (u) => u.email.toLowerCase().trim() === normalizedEmail
  );
  if (!existingAdminUser) {
    store.adminUsers.unshift({
      id: newReservation.userId,
      name: newReservation.userName,
      nim: newReservation.userNik || normalizedEmail.split('@')[0],
      email: newReservation.userEmail,
      phone: newReservation.userPhone,
      role: 'CALON_PENGHUNI',
      roomCode: room.code,
      isActive: true,
      createdAt: newReservation.createdAt,
    });
  } else {
    existingAdminUser.roomCode = room.code;
    if (newReservation.userNik) existingAdminUser.nim = newReservation.userNik;
    if (newReservation.userPhone) existingAdminUser.phone = newReservation.userPhone;
  }

  const existingCalonIdx = store.calonUsers.findIndex(
    (c) => c.email.toLowerCase().trim() === normalizedEmail
  );
  const calonData: CalonUser = {
    id: newReservation.userId,
    name: newReservation.userName,
    email: newReservation.userEmail,
    phone: newReservation.userPhone,
    nik: newReservation.userNik,
    occupation: newReservation.userOccupation || '-',
    emergencyContactName: newReservation.emergencyContactName || '-',
    emergencyContactPhone: newReservation.emergencyContactPhone || newReservation.userPhone,
    emergencyContactRelation: newReservation.emergencyContactRelation || 'Keluarga',
    ktpUrl: newReservation.ktpUrl || '/rooms/kamar-1.png',
    createdAt: newReservation.createdAt,
  };
  if (existingCalonIdx === -1) {
    store.calonUsers.unshift(calonData);
  } else {
    store.calonUsers[existingCalonIdx] = calonData;
  }

  store.notificationLogs.unshift(
    {
      id: `ntf-wa-pengelola-${Date.now()}`,
      recipient: '+62 813-7432-9562',
      recipientName: 'Pengelola Kos Omi (Yanti Susanti)',
      channel: 'WHATSAPP',
      template: `reservasi_baru_masuk_kamar_${room.code}_${input.fullName}`,
      status: 'SENT',
      attempts: 1,
      sentAt: newReservation.createdAt,
      createdAt: newReservation.createdAt,
    },
    {
      id: `ntf-wa-calon-${Date.now() + 1}`,
      recipient: input.phone,
      recipientName: input.fullName,
      channel: 'WHATSAPP',
      template: `bukti_pengajuan_reservasi_${reservationCode}_kamar_${room.code}`,
      status: 'SENT',
      attempts: 1,
      sentAt: newReservation.createdAt,
      createdAt: newReservation.createdAt,
    }
  );

  savePersistentStore(store);
  await flushPostgresSync();
  return { ...newReservation, room };
}

export async function dbApproveReservation(reservationCode: string, adminNotes?: string): Promise<Reservation | null> {
  const db = getDb();
  const res = await dbGetReservationByCode(reservationCode);
  if (!res) return null;

  const index = db.reservations.findIndex((r) => r.code === res.code);
  if (index === -1) return null;

  const store = loadPersistentStore();
  const windowHours = store.settings?.bookingWindowHours || 24;
  const expiresAt = new Date(Date.now() + windowHours * 3600 * 1000).toISOString();

  db.reservations[index].status = 'APPROVED';
  db.reservations[index].expiresAt = expiresAt;
  db.reservations[index].adminNotes = adminNotes || 'Reservasi telah disetujui. Silakan selesaikan pembayaran invoice.';
  db.reservations[index].updatedAt = new Date().toISOString();

  await dbUpdateRoomStatus(res.roomCode, 'DIPESAN');

  // Terbitkan invoice jika belum ada
  const existingInvoice = db.payments.find((p) => p.reservationCode === res.code);
  if (!existingInvoice) {
    const invoiceCode = `INV-${res.code.replace('RSV-', '')}`;
    const newInvoice: PaymentInvoice = {
      id: `inv-${Date.now()}`,
      invoiceCode,
      reservationId: res.id,
      reservationCode: res.code,
      roomCode: res.roomCode,
      amount: res.totalInitialPayment,
      status: 'UNPAID',
      paymentMethod: 'QRIS',
      snapToken: `snap-token-${invoiceCode.toLowerCase()}`,
      snapRedirectUrl: `/pembayaran/selesai?order_id=${invoiceCode}`,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    db.payments.unshift(newInvoice);

    store.notificationLogs.unshift({
      id: `ntf-approve-${Date.now()}`,
      recipient: res.userPhone,
      recipientName: res.userName,
      channel: 'WHATSAPP',
      template: `reservasi_disetujui_invoice_${invoiceCode}_kamar_${res.roomCode}`,
      status: 'SENT',
      attempts: 1,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  savePersistentStore(store);
  await flushPostgresSync();
  return await dbGetReservationByCode(reservationCode);
}

export async function dbRejectReservation(
  reservationCode: string,
  rejectionReason: string
): Promise<Reservation | null> {
  const db = getDb();
  const res = await dbGetReservationByCode(reservationCode);
  if (!res) return null;

  const index = db.reservations.findIndex((r) => r.code === res.code);
  if (index === -1) return null;

  const store = loadPersistentStore();
  db.reservations[index].status = 'REJECTED';
  db.reservations[index].rejectionReason = rejectionReason;
  db.reservations[index].updatedAt = new Date().toISOString();

  // Kembalikan status kamar ke TERSEDIA apabila tidak ada reservasi/hunian aktif lain di kamar tersebut
  const otherActive =
    db.reservations.some(
      (r) =>
        r.code !== res.code &&
        r.roomCode === res.roomCode &&
        (r.status === 'PENDING_REVIEW' ||
          r.status === 'APPROVED' ||
          r.status === 'PAID' ||
          r.status === 'CHECKED_IN')
    ) ||
    store.tenancies.some((t) => t.roomCode === res.roomCode && t.status === 'AKTIF');

  if (!otherActive) {
    const room = await dbGetRoomByCode(res.roomCode);
    if (room && room.status === 'DIPESAN') {
      await dbUpdateRoomStatus(res.roomCode, 'TERSEDIA');
    }
  }

  savePersistentStore(store);
  await flushPostgresSync();
  return await dbGetReservationByCode(reservationCode);
}

/**
 * Pembatalan reservasi mandiri oleh Calon Penghuni sebelum lunas (status PENDING_REVIEW atau APPROVED dengan invoice belum SETTLEMENT).
 * Mengubah status reservasi menjadi CANCELLED, membatalkan invoice UNPAID/PENDING terkait,
 * dan otomatis mengembalikan status kamar di tabel rooms dari DIPESAN (RESERVED) menjadi TERSEDIA (AVAILABLE).
 */
export async function dbCancelReservationByUser(
  reservationCode: string,
  reason: string = 'Dibatalkan mandiri oleh Calon Penghuni melalui Portal Calon Penghuni.'
): Promise<{ success: boolean; message: string; reservation?: Reservation }> {
  const db = getDb();
  const res = await dbGetReservationByCode(reservationCode);
  if (!res) {
    return { success: false, message: `Reservasi ${reservationCode} tidak ditemukan.` };
  }

  if (res.status === 'PAID' || res.payment?.status === 'SETTLEMENT') {
    return {
      success: false,
      message: 'Reservasi yang sudah lunas tidak dapat dibatalkan secara mandiri. Silakan hubungi Pengelola Kos Omi.',
    };
  }

  if (res.status !== 'PENDING_REVIEW' && res.status !== 'APPROVED') {
    return {
      success: false,
      message: `Reservasi dengan status ${res.status} tidak dapat dibatalkan.`,
    };
  }

  const index = db.reservations.findIndex((r) => r.code === res.code);
  if (index === -1) {
    return { success: false, message: 'Data reservasi tidak ditemukan.' };
  }

  const nowIso = new Date().toISOString();
  db.reservations[index].status = 'CANCELLED';
  db.reservations[index].adminNotes =
    (db.reservations[index].adminNotes ? `${db.reservations[index].adminNotes} | ` : '') + reason;
  db.reservations[index].updatedAt = nowIso;

  // Batalkan invoice UNPAID / PENDING terkait jika ada
  const pIndex = db.payments.findIndex((p) => p.reservationCode === res.code);
  if (pIndex !== -1 && db.payments[pIndex].status !== 'SETTLEMENT') {
    db.payments[pIndex].status = 'EXPIRED';
  }

  const store = loadPersistentStore();
  // Kembalikan status kamar dari DIPESAN menjadi TERSEDIA apabila tidak ada reservasi/hunian aktif lain
  const otherActive =
    db.reservations.some(
      (r) =>
        r.code !== res.code &&
        r.roomCode === res.roomCode &&
        (r.status === 'PENDING_REVIEW' ||
          r.status === 'APPROVED' ||
          r.status === 'PAID' ||
          r.status === 'CHECKED_IN')
    ) ||
    store.tenancies.some((t) => t.roomCode === res.roomCode && t.status === 'AKTIF');

  if (!otherActive) {
    await dbUpdateRoomStatus(res.roomCode, 'TERSEDIA');
  }

  savePersistentStore(store);
  await flushPostgresSync();
  const updated = await dbGetReservationByCode(res.code);
  return {
    success: true,
    message: `Pesanan ${res.code} (Kamar No. ${res.roomCode}) berhasil dibatalkan dan status kamar telah dikembalikan menjadi TERSEDIA.`,
    reservation: updated || undefined,
  };
}

/**
 * Job pembatalan reservasi kedaluwarsa (PRD Bab 5.C & Bab 11 Task 2.5)
 * Membatalkan reservasi yang batas waktu pembayarannya (24 jam) telah lewat
 * dan mengembalikan kamar menjadi TERSEDIA.
 */
export async function dbCancelExpiredReservations(): Promise<{ cancelledCount: number; codes: string[] }> {
  const db = getDb();
  const now = Date.now();
  const cancelledCodes: string[] = [];

  for (const r of db.reservations) {
    if (r.status === 'APPROVED' && r.expiresAt) {
      const exp = new Date(r.expiresAt).getTime();
      if (exp < now) {
        r.status = 'CANCELLED';
        r.adminNotes = (r.adminNotes ? `${r.adminNotes} | ` : '') + 'Dibatalkan otomatis karena batas waktu bayar 24 jam terlewati.';
        r.updatedAt = new Date().toISOString();
        cancelledCodes.push(r.code);

        // Kembalikan status kamar menjadi TERSEDIA
        await dbUpdateRoomStatus(r.roomCode, 'TERSEDIA');

        // Tandai invoice terkait sebagai EXPIRED jika ada
        const payment = db.payments.find((p) => p.reservationCode === r.code);
        if (payment && payment.status === 'UNPAID') {
          payment.status = 'EXPIRED';
        }
      }
    }
  }

  if (cancelledCodes.length > 0) {
    savePersistentStore();
  await flushPostgresSync();
  }
  return { cancelledCount: cancelledCodes.length, codes: cancelledCodes };
}

// ==========================================
// PAYMENTS REPOSITORY
// ==========================================

export async function dbGetPaymentByInvoice(invoiceCode: string): Promise<PaymentInvoice | null> {
  const db = getDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const payment = db.payments.find((p) => p.invoiceCode === normalized);
  return payment ? { ...payment } : null;
}

export async function dbGetPaymentByReservationCode(resCode: string): Promise<PaymentInvoice | null> {
  const db = getDb();
  const normalized = resCode.toUpperCase().trim();
  const payment = db.payments.find((p) => p.reservationCode === normalized);
  return payment ? { ...payment } : null;
}

/**
 * Menyimpan snap_token dan snap_redirect_url pada invoice (PRD Bab 11 Task 2.6)
 * Memperbarui invoice di database server dan mencegah duplikasi transaksi.
 */
export async function dbUpdateInvoiceSnap(
  invoiceCodeOrOrderId: string,
  snapToken: string,
  snapRedirectUrl: string
): Promise<PaymentInvoice | null> {
  const db = getDb();
  const normalized = invoiceCodeOrOrderId.toUpperCase().trim();
  const pIndex = db.payments.findIndex(
    (p) =>
      p.invoiceCode.toUpperCase() === normalized ||
      p.id.toUpperCase() === normalized ||
      p.reservationCode.toUpperCase() === normalized
  );

  if (pIndex === -1) {
    return null;
  }

  db.payments[pIndex].snapToken = snapToken;
  db.payments[pIndex].snapRedirectUrl = snapRedirectUrl;
  savePersistentStore();
  await flushPostgresSync();
  return { ...db.payments[pIndex] };
}

/**
 * Konfirmasi pembayaran langsung di server (verifikasi database sejati).
 * Memperbarui status invoice menjadi SETTLEMENT, status reservasi menjadi PAID,
 * dan kamar menjadi TERISI.
 */
export async function dbSettlePayment(
  invoiceCode: string,
  method?: string
): Promise<{ success: boolean; message: string; payment?: PaymentInvoice; reservation?: Reservation }> {
  const db = getDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const pIndex = db.payments.findIndex((p) => p.invoiceCode === normalized);
  if (pIndex === -1) {
    return { success: false, message: `Invoice ${invoiceCode} tidak ditemukan di sistem server` };
  }

  const payment = db.payments[pIndex];
  if (payment.status === 'SETTLEMENT') {
    const reservation = await dbGetReservationByCode(payment.reservationCode);
    return {
      success: true,
      message: 'Invoice telah lunas sebelumnya',
      payment,
      reservation: reservation || undefined,
    };
  }

  // Cek apakah invoice sudah kedaluwarsa
  if (new Date(payment.expiresAt).getTime() < Date.now()) {
    payment.status = 'EXPIRED';
    return { success: false, message: 'Batas waktu pembayaran 24 jam telah kedaluwarsa', payment };
  }

  // Update status invoice
  payment.status = 'SETTLEMENT';
  payment.paidAt = new Date().toISOString();
  if (method) {
    payment.paymentMethod = method as any;
  }

  // Update status reservasi
  const rIndex = db.reservations.findIndex((r) => r.code === payment.reservationCode);
  if (rIndex !== -1) {
    db.reservations[rIndex].status = 'PAID';
    db.reservations[rIndex].updatedAt = new Date().toISOString();
  }

  // Kunci status kamar menjadi DIPESAN (hanya berubah menjadi TERISI setelah Pengelola memproses Check-in resmi)
  await dbUpdateRoomStatus(payment.roomCode, 'DIPESAN');

  // Sinkronisasi status tagihan bulanan pada portal penghuni jika invoice berupa sewa bulanan
  try {
    if (global.__kosOmiBillingState && global.__kosOmiBillingState.bills) {
      const bIndex = global.__kosOmiBillingState.bills.findIndex(
        (b) => b.invoiceCode.toUpperCase() === normalized || b.id.toUpperCase() === normalized
      );
      if (bIndex !== -1) {
        global.__kosOmiBillingState.bills[bIndex].status = 'LUNAS';
        global.__kosOmiBillingState.bills[bIndex].paidAt = payment.paidAt;
        global.__kosOmiBillingState.bills[bIndex].paymentMethod = method || 'Midtrans Snap';
      }
    }
  } catch (err) {
    console.warn('Gagal sinkronisasi billing state saat settle payment:', err);
  }

  // Sinkronisasi transaksi keuangan agar laporan keuangan cocok 100% dengan gateway
  try {
    if (!global.__kosOmiTransactions) {
      global.__kosOmiTransactions = [];
    }
    const existingTx = global.__kosOmiTransactions.find(
      (tx) => tx.invoiceNumber === payment.invoiceCode || tx.orderId === payment.invoiceCode
    );
    const resObj = await dbGetReservationByCode(payment.reservationCode);
    if (existingTx) {
      existingTx.transactionStatus = 'settlement';
      existingTx.settlementTime = payment.paidAt;
    } else {
      global.__kosOmiTransactions.unshift({
        id: `tx-${Date.now()}`,
        orderId: payment.invoiceCode,
        invoiceNumber: payment.invoiceCode,
        midtransTransactionId: `mid-${Date.now()}`,
        userName: resObj?.userName || 'Penghuni Kos',
        userPhone: resObj?.userPhone || '081234567890',
        userEmail: resObj?.userEmail || 'penghuni@kosomi.id',
        roomCode: payment.roomCode,
        category: 'BOOKING',
        paymentType: toPaymentMethodType(method),
        grossAmount: payment.amount,
        transactionStatus: 'settlement',
        fraudStatus: 'accept',
        settlementTime: payment.paidAt,
        createdAt: payment.createdAt || new Date().toISOString(),
      });
    }

    // Sinkronisasi ke antrean Check-in Pengelola (jangan membuat tenancy AKTIF sebelum Check-in resmi)
    if (!global.__kosOmiCheckinCandidates) {
      global.__kosOmiCheckinCandidates = [];
    }
    if (resObj) {
      const roomNum = parseInt(resObj.roomCode, 10) || 1;
      const floorNum = roomNum <= 33 ? 1 : 2;
      const existingCandidate = global.__kosOmiCheckinCandidates.find(
        (c) => c.reservationCode === resObj.code || c.id === resObj.id
      );
      if (existingCandidate) {
        existingCandidate.status = 'LUNAS';
        existingCandidate.paidAt = payment.paidAt || new Date().toISOString();
        existingCandidate.paymentMethod = method || 'QRIS';
      } else {
        global.__kosOmiCheckinCandidates.unshift({
          id: resObj.id || `cand-${Date.now()}`,
          reservationCode: resObj.code,
          userId: resObj.userId,
          userName: resObj.userName,
          userPhone: resObj.userPhone,
          userEmail: resObj.userEmail,
          userNik: resObj.userNik,
          roomId: resObj.roomId,
          roomCode: resObj.roomCode,
          roomFloor: floorNum,
          roomType: 'STANDAR_AC',
          startDate: resObj.checkInDate,
          durationMonths: resObj.durationMonths,
          bookingAmount: resObj.monthlyPrice,
          depositAmount: resObj.depositAmount,
          totalPaid: resObj.totalInitialPayment,
          invoiceCode: payment.invoiceCode,
          paymentMethod: method || 'QRIS',
          paidAt: payment.paidAt || new Date().toISOString(),
          idCardUrl:
            resObj.ktpUrl ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
          notes: resObj.adminNotes || 'Pembayaran lunas terverifikasi',
          status: 'LUNAS',
        });
      }
    }

    // Catat ke Monitoring Notifikasi Admin
    if (!(global as any).__kosOmiNotifLogs) {
      (global as any).__kosOmiNotifLogs = [];
    }
    if (resObj) {
      const nowIso = payment.paidAt || new Date().toISOString();
      (global as any).__kosOmiNotifLogs.unshift(
        {
          id: `ntf-paid-pengelola-${Date.now()}`,
          recipient: '+62 813-7432-9562',
          recipientName: 'Pengelola & Keuangan Kos Omi',
          channel: 'WHATSAPP',
          template: `pembayaran_lunas_${payment.invoiceCode}_kamar_${resObj.roomCode}_siap_checkin`,
          status: 'SENT',
          attempts: 1,
          sentAt: nowIso,
          createdAt: nowIso,
        },
        {
          id: `ntf-paid-calon-${Date.now() + 1}`,
          recipient: resObj.userEmail,
          recipientName: resObj.userName,
          channel: 'EMAIL',
          template: `kuitansi_pembayaran_lunas_${payment.invoiceCode}`,
          status: 'SENT',
          attempts: 1,
          sentAt: nowIso,
          createdAt: nowIso,
        }
      );
    }
  } catch (txErr) {
    console.warn('Gagal sinkronisasi transaksi keuangan:', txErr);
  }

  savePersistentStore();
  await flushPostgresSync();
  const updatedReservation = await dbGetReservationByCode(payment.reservationCode);

  return {
    success: true,
    message: 'Pembayaran berhasil diverifikasi secara resmi di server',
    payment: { ...payment },
    reservation: updatedReservation || undefined,
  };
}

/**
 * Calon Penghuni mengirim klaim/konfirmasi bahwa ia sudah melakukan transfer/QRIS/DANA.
 * TIDAK langsung mengubah status ke SETTLEMENT (Lunas), melainkan ke PENDING
 * agar divalidasi terlebih dahulu oleh Pengelola Kos apakah dana benar-benar sudah masuk.
 */
export async function dbSubmitPaymentConfirmation(
  invoiceCode: string,
  method?: string
): Promise<{ success: boolean; message: string; payment?: PaymentInvoice; reservation?: Reservation }> {
  const db = getDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const pIndex = db.payments.findIndex((p) => p.invoiceCode === normalized);
  if (pIndex === -1) {
    return { success: false, message: `Invoice ${invoiceCode} tidak ditemukan di sistem server` };
  }

  const payment = db.payments[pIndex];
  if (payment.status === 'SETTLEMENT') {
    const reservation = await dbGetReservationByCode(payment.reservationCode);
    return {
      success: true,
      message: 'Invoice telah divalidasi lunas oleh Pengelola sebelumnya',
      payment: { ...payment },
      reservation: reservation || undefined,
    };
  }

  payment.status = 'PENDING';
  if (method) {
    payment.paymentMethod = method as any;
  }

  const rIndex = db.reservations.findIndex((r) => r.code === payment.reservationCode);
  if (rIndex !== -1) {
    db.reservations[rIndex].adminNotes = `Calon penghuni telah mengirim konfirmasi pembayaran via ${(method || 'QRIS').toUpperCase()} (${new Date().toLocaleTimeString('id-ID')} WIB). Menunggu Pengelola memeriksa mutasi dana masuk & memvalidasi pelunasan.`;
    db.reservations[rIndex].updatedAt = new Date().toISOString();
  }

  // Catat notifikasi ke Pengelola Kos bahwa ada pembayaran yang perlu divalidasi
  if (!(global as any).__kosOmiNotifLogs) {
    (global as any).__kosOmiNotifLogs = [];
  }
  const resObj = await dbGetReservationByCode(payment.reservationCode);
  const nowIso = new Date().toISOString();
  (global as any).__kosOmiNotifLogs.unshift({
    id: `ntf-pending-pay-${Date.now()}`,
    recipient: '+62 813-7432-9562',
    recipientName: 'Pengelola Kos Omi (Validasi Pembayaran)',
    channel: 'WHATSAPP',
    template: `konfirmasi_transfer_masuk_${payment.invoiceCode}_${(method || 'QRIS').toUpperCase()}_menunggu_validasi_pengelola`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });

  savePersistentStore();
  await flushPostgresSync();
  return {
    success: true,
    message: `Konfirmasi pembayaran via ${(method || 'QRIS').toUpperCase()} berhasil dikirim ke Pengelola! Status akan menjadi LUNAS setelah Pengelola memastikan dana sudah masuk ke rekening/DANA.`,
    payment: { ...payment },
    reservation: resObj || undefined,
  };
}

/**
 * Mengembalikan status pembayaran ke UNPAID / Belum Dibayar (jika ditolak Pengelola karena dana belum masuk atau untuk uji ulang)
 */
export async function dbResetPaymentToUnpaid(
  invoiceCode: string
): Promise<{ success: boolean; message: string; payment?: PaymentInvoice; reservation?: Reservation }> {
  const db = getDb();
  const normalized = invoiceCode.toUpperCase().trim();
  const pIndex = db.payments.findIndex((p) => p.invoiceCode === normalized);
  if (pIndex === -1) {
    return { success: false, message: `Invoice ${invoiceCode} tidak ditemukan` };
  }

  const payment = db.payments[pIndex];
  payment.status = 'UNPAID';
  payment.paidAt = undefined;
  payment.expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const rIndex = db.reservations.findIndex((r) => r.code === payment.reservationCode);
  if (rIndex !== -1) {
    db.reservations[rIndex].status = 'APPROVED';
    db.reservations[rIndex].updatedAt = new Date().toISOString();
  }

  if (global.__kosOmiTransactions) {
    const tx = global.__kosOmiTransactions.find(
      (t) => t.invoiceNumber === payment.invoiceCode || t.orderId === payment.invoiceCode
    );
    if (tx) {
      tx.transactionStatus = 'pending';
      tx.settlementTime = undefined;
    }
  }

  savePersistentStore();
  await flushPostgresSync();
  const updatedReservation = await dbGetReservationByCode(payment.reservationCode);
  return {
    success: true,
    message: `Status tagihan ${payment.invoiceCode} berhasil dikembalikan menjadi BELUM DIBAYAR (UNPAID).`,
    payment: { ...payment },
    reservation: updatedReservation || undefined,
  };
}

// Set untuk melacak midtrans_transaction_id yang telah diproses secara idempoten
const processedMidtransTransactionIds = new Set<string>();

export interface ProcessMidtransWebhookInput {
  orderId: string;
  transactionId?: string;
  transactionStatus: string;
  fraudStatus?: string;
  grossAmount: number;
  paymentType?: string;
  bank?: string;
  settlementTime?: string;
  signatureKey?: string;
  rawPayload?: Record<string, unknown>;
}

export interface ProcessMidtransWebhookResult {
  success: boolean;
  message: string;
  status: 'SETTLEMENT' | 'EXPIRED' | 'PENDING' | 'ALREADY_PROCESSED' | 'ERROR';
  isDuplicate?: boolean;
  payment?: PaymentInvoice;
  reservation?: Reservation;
}

/**
 * Memproses Webhook Notifikasi Midtrans secara Idempoten (PRD Bab 7 & Bab 11 Task 2.7)
 * Memperbarui payments, invoices, dan reservations.
 */
export async function dbProcessMidtransWebhookResult(
  input: ProcessMidtransWebhookInput
): Promise<ProcessMidtransWebhookResult> {
  const db = getDb();
  const normalizedOrderId = input.orderId.toUpperCase().trim();

  // 1. Idempotensi via transactionId
  if (input.transactionId && processedMidtransTransactionIds.has(input.transactionId)) {
    const existingPayment = db.payments.find(
      (p) =>
        p.midtransTransactionId === input.transactionId ||
        p.invoiceCode.toUpperCase() === normalizedOrderId
    );
    const existingRes = existingPayment
      ? await dbGetReservationByCode(existingPayment.reservationCode)
      : null;

    return {
      success: true,
      message: 'Transaksi Midtrans telah diproses sebelumnya (Idempoten)',
      status: 'ALREADY_PROCESSED',
      isDuplicate: true,
      payment: existingPayment ? { ...existingPayment } : undefined,
      reservation: existingRes || undefined,
    };
  }

  // 2. Cari Invoice di Database Server
  const pIndex = db.payments.findIndex(
    (p) =>
      p.invoiceCode.toUpperCase() === normalizedOrderId ||
      p.id.toUpperCase() === normalizedOrderId ||
      p.reservationCode.toUpperCase() === normalizedOrderId
  );

  if (pIndex === -1) {
    return {
      success: false,
      message: `Invoice dengan order_id ${input.orderId} tidak ditemukan di database server.`,
      status: 'ERROR',
    };
  }

  const payment = db.payments[pIndex];

  // 3. Validasi Nominal (Gross Amount tidak boleh kurang dari amount invoice)
  if (input.grossAmount < payment.amount) {
    return {
      success: false,
      message: `Nominal pembayaran tidak sesuai. Diharapkan minimal Rp ${payment.amount}, diterima Rp ${input.grossAmount}.`,
      status: 'ERROR',
    };
  }

  // 4. Evaluasi Status Transaksi
  const isSettlement =
    input.transactionStatus === 'settlement' ||
    (input.transactionStatus === 'capture' && input.fraudStatus === 'accept');

  const isFailedOrExpired =
    input.transactionStatus === 'cancel' ||
    input.transactionStatus === 'expire' ||
    input.transactionStatus === 'deny' ||
    input.transactionStatus === 'failure';

  const isPending = input.transactionStatus === 'pending';

  // Update field transaksi pembayaran
  payment.midtransOrderId = input.orderId;
  if (input.transactionId) {
    payment.midtransTransactionId = input.transactionId;
  }
  if (input.paymentType) {
    payment.paymentMethod = input.paymentType;
  }
  if (input.bank) {
    payment.bank = input.bank;
  }
  if (input.rawPayload) {
    payment.rawPayload = input.rawPayload;
  }

  const rIndex = db.reservations.findIndex((r) => r.code === payment.reservationCode);

  if (isSettlement) {
    // A. Lunas / Settlement: Update status invoice dan reservasi ke PAID
    payment.status = 'SETTLEMENT';
    payment.paidAt = input.settlementTime || new Date().toISOString();
    payment.settlementTime = input.settlementTime || new Date().toISOString();

    if (rIndex !== -1) {
      db.reservations[rIndex].status = 'PAID';
      db.reservations[rIndex].updatedAt = new Date().toISOString();
      db.reservations[rIndex].adminNotes =
        (db.reservations[rIndex].adminNotes ? `${db.reservations[rIndex].adminNotes} | ` : '') +
        `Pembayaran lunas via Midtrans (${input.paymentType || 'GATEWAY'}) trx: ${input.transactionId || '-'}`;
    }

    // Pastikan kamar tetap DIPESAN (dikunci untuk pemesan sampai pengelola check-in)
    const room = await dbGetRoomByCode(payment.roomCode);
    if (room && room.status !== 'DIPESAN' && room.status !== 'TERISI') {
      await dbUpdateRoomStatus(payment.roomCode, 'DIPESAN');
    }

    // Sinkronisasi status tagihan bulanan pada portal penghuni jika invoice berupa sewa bulanan
    try {
      if (global.__kosOmiBillingState && global.__kosOmiBillingState.bills) {
        const bIndex = global.__kosOmiBillingState.bills.findIndex(
          (b) => b.invoiceCode.toUpperCase() === normalizedOrderId || b.id.toUpperCase() === normalizedOrderId
        );
        if (bIndex !== -1) {
          global.__kosOmiBillingState.bills[bIndex].status = 'LUNAS';
          global.__kosOmiBillingState.bills[bIndex].paidAt = input.settlementTime || new Date().toISOString();
          global.__kosOmiBillingState.bills[bIndex].paymentMethod = input.paymentType || 'Midtrans Snap';
        }
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi billing state pada webhook settlement:', err);
    }

    // Sinkronisasi transaksi keuangan agar laporan keuangan cocok 100% dengan dashboard Midtrans
    try {
      if (global.__kosOmiTransactions) {
        const existingTx = global.__kosOmiTransactions.find(
          (tx) => tx.invoiceNumber === payment.invoiceCode || tx.orderId === input.orderId
        );
        if (existingTx) {
          existingTx.transactionStatus = 'settlement';
          existingTx.settlementTime = input.settlementTime || new Date().toISOString();
        } else {
          const resObj = await dbGetReservationByCode(payment.reservationCode);
          global.__kosOmiTransactions.unshift({
            id: `tx-${Date.now()}`,
            orderId: input.orderId,
            invoiceNumber: payment.invoiceCode,
            midtransTransactionId: input.transactionId || `mid-${Date.now()}`,
            userName: resObj?.userName || 'Penghuni Kos',
            userPhone: resObj?.userPhone || '081234567890',
            userEmail: resObj?.userEmail || 'penghuni@kosomi.id',
            roomCode: payment.roomCode,
            category: 'BOOKING',
            paymentType: toPaymentMethodType(input.paymentType),
            bank: toBankType(input.bank),
            grossAmount: input.grossAmount,
            transactionStatus: 'settlement',
            fraudStatus: toFraudStatus(input.fraudStatus) || 'accept',
            settlementTime: input.settlementTime || new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (txErr) {
      console.warn('Gagal sinkronisasi transaksi keuangan pada webhook:', txErr);
    }

    if (input.transactionId) {
      processedMidtransTransactionIds.add(input.transactionId);
    }

    savePersistentStore();
  await flushPostgresSync();
    const updatedRes = await dbGetReservationByCode(payment.reservationCode);
    return {
      success: true,
      message: 'Pembayaran invoice dan reservasi berhasil diverifikasi lunas (SETTLEMENT).',
      status: 'SETTLEMENT',
      payment: { ...payment },
      reservation: updatedRes || undefined,
    };
  } else if (isFailedOrExpired) {
    // B. Gagal / Kedaluwarsa: Update status invoice dan batalkan reservasi
    payment.status = 'EXPIRED';

    if (rIndex !== -1) {
      db.reservations[rIndex].status = 'CANCELLED';
      db.reservations[rIndex].updatedAt = new Date().toISOString();
      db.reservations[rIndex].adminNotes =
        (db.reservations[rIndex].adminNotes ? `${db.reservations[rIndex].adminNotes} | ` : '') +
        `Dibatalkan karena transaksi Midtrans ${input.transactionStatus}.`;
    }

    // Kembalikan status kamar menjadi TERSEDIA
    await dbUpdateRoomStatus(payment.roomCode, 'TERSEDIA');

    if (input.transactionId) {
      processedMidtransTransactionIds.add(input.transactionId);
    }

    const updatedRes = await dbGetReservationByCode(payment.reservationCode);
    return {
      success: true,
      message: `Status transaksi Midtrans ${input.transactionStatus}: Invoice dan reservasi dibatalkan, kamar kembali TERSEDIA.`,
      status: 'EXPIRED',
      payment: { ...payment },
      reservation: updatedRes || undefined,
    };
  } else if (isPending) {
    // C. Pending: Menunggu pembayaran oleh pengguna
    payment.status = 'PENDING';

    const updatedRes = await dbGetReservationByCode(payment.reservationCode);
    return {
      success: true,
      message: 'Status transaksi Midtrans PENDING (menunggu pembayaran oleh pengguna).',
      status: 'PENDING',
      payment: { ...payment },
      reservation: updatedRes || undefined,
    };
  }

  return {
    success: true,
    message: `Notifikasi status ${input.transactionStatus} berhasil diterima dan dicatat.`,
    status: 'PENDING',
    payment: { ...payment },
  };
}

/**
 * Menambahkan catatan audit log ke sistem server
 */
export async function dbAddAuditLog(log: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  payloadBefore?: any;
  payloadAfter?: any;
}): Promise<ServerAuditLog> {
  const db = getDb();
  const createdAt = new Date().toISOString();
  const newLog: ServerAuditLog = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    ...log,
    createdAt,
  };
  db.auditLogs.unshift(newLog);

  const roleMap: Record<string, 'ADMIN' | 'PENGELOLA' | 'KEUANGAN' | 'PENGHUNI' | 'CALON_PENGHUNI'> = {
    'admin-01': 'ADMIN',
    'usr-admin-01': 'ADMIN',
    'usr-admin-1': 'ADMIN',
    'pengelola-01': 'PENGELOLA',
    'usr-pengelola-01': 'PENGELOLA',
    'usr-pengelola-1': 'PENGELOLA',
    'usr-keuangan-01': 'KEUANGAN',
    'usr-keuangan-1': 'KEUANGAN',
  };
  const nameMap: Record<string, string> = {
    'admin-01': 'Ibu Yulastri (Admin Sistem)',
    'usr-admin-01': 'Ibu Yulastri (Admin Sistem)',
    'usr-admin-1': 'Ibu Yulastri (Admin Sistem)',
    'pengelola-01': 'Yanti Susanti (Pengelola Kos)',
    'usr-pengelola-01': 'Yanti Susanti (Pengelola Kos)',
    'usr-pengelola-1': 'Yanti Susanti (Pengelola Kos)',
    'usr-keuangan-01': 'Aisyah Fitriani (Staf Keuangan)',
    'usr-keuangan-1': 'Aisyah Fitriani (Staf Keuangan)',
  };

  await createAuditLog({
    userId: log.userId,
    actorName:
      nameMap[log.userId] ||
      log.payloadAfter?.actorName ||
      log.payloadAfter?.userName ||
      log.payloadAfter?.tenantName ||
      'Pengelola Kos Omi',
    actorRole:
      log.payloadAfter?.actorRole ||
      roleMap[log.userId] ||
      (log.action === 'CREATE_RESERVATION' || log.action === 'CANCEL_RESERVATION_BY_USER'
        ? 'CALON_PENGHUNI'
        : 'PENGELOLA'),
    action: log.action,
    category: log.entityType.toLowerCase(),
    entityId: log.entityId,
    description:
      log.payloadAfter?.description ||
      `Aktivitas ${log.action.replace(/_/g, ' ').toLowerCase()} pada ${log.entityId}`,
    meta: (log.payloadAfter || log.payloadBefore || {}) as Record<string, unknown>,
  });

  return newLog;
}

/**
 * Membersihkan seluruh relasi reservasi, invoice/pembayaran, dan mengembalikan status kamar
 * menjadi TERSEDIA saat akun pengguna dihapus permanen oleh Admin.
 */
export async function dbCleanupUserRelations(params: {
  userId: string;
  email: string;
  roomCode?: string;
}): Promise<{ releasedRooms: string[] }> {
  const db = getDb();
  const normalizedEmail = params.email.toLowerCase().trim();
  const affectedRoomCodes = new Set<string>();
  if (params.roomCode) {
    affectedRoomCodes.add(params.roomCode);
  }

  const removedReservationCodes = new Set<string>();
  db.reservations = db.reservations.filter((r) => {
    const isTarget =
      r.userId === params.userId || r.userEmail.toLowerCase().trim() === normalizedEmail;
    if (isTarget) {
      affectedRoomCodes.add(r.roomCode);
      removedReservationCodes.add(r.code);
      return false;
    }
    return true;
  });

  db.payments = db.payments.filter(
    (p) => !removedReservationCodes.has(p.reservationCode)
  );

  db.users = db.users.filter(
    (u) => u.id !== params.userId && u.email.toLowerCase().trim() !== normalizedEmail
  );

  const releasedRooms: string[] = [];
  const activeTenancies = ((global as any).__kosOmiTenancies as any[] | undefined) || [];

  for (const rCode of affectedRoomCodes) {
    const stillHasActiveReservation = db.reservations.some(
      (r) =>
        r.roomCode === rCode &&
        (r.status === 'PENDING_REVIEW' ||
          r.status === 'APPROVED' ||
          r.status === 'PAID' ||
          r.status === 'CHECKED_IN')
    );
    const stillHasActiveTenancy = activeTenancies.some(
      (t) =>
        t.roomCode === rCode &&
        t.status === 'AKTIF' &&
        t.userId !== params.userId &&
        t.userEmail?.toLowerCase().trim() !== normalizedEmail
    );
    if (!stillHasActiveReservation && !stillHasActiveTenancy) {
      const room = await dbGetRoomByCode(rCode);
      if (room && (room.status === 'DIPESAN' || room.status === 'TERISI')) {
        await dbUpdateRoomStatus(rCode, 'TERSEDIA');
        releasedRooms.push(rCode);
      }
    }
  }

  savePersistentStore();
  await flushPostgresSync();
  return { releasedRooms };
}

/**
 * Mengambil catatan audit log sistem
 */
export async function dbGetAuditLogs(limit: number = 50): Promise<ServerAuditLog[]> {
  const db = getDb();
  return db.auditLogs.slice(0, limit);
}

