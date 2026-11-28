'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getCurrentUser,requireRole } from '@/lib/auth-server';
import { createAuditLog } from '@/lib/audit';
import { getNeonDb,schema } from '@/db';
import {
ensurePostgresHydrated,
flushPostgresSync,
savePersistentStore,
} from '@/server/persistence';

export interface RoomRentExtension {
  roomCode: string;
  requestedBy: string;
  requestedEmail: string;
  extraDays: number; // 1 s/d 7 hari
  promisedDate: string; // YYYY-MM-DD
  reason: string;
  requestedAt: string;
}

export interface RoomReminderMeta {
  reminderCount: number;
  lastReminderAt?: string;
}

export type RoomScheduleStatus =
  | 'AMAN'
  | 'SEGERA_JATUH_TEMPO'
  | 'MINTA_TEMPO'
  | 'TERLAMBAT'
  | 'WAJIB_KONFIRMASI_IBU_KOS';

export interface RoomRentScheduleItem {
  roomCode: string;
  roomFloor: number;
  occupants: Array<{
    id: string;
    tenancyId: string;
    name: string;
    email: string;
    phone: string;
  }>;
  checkInDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD (siklus 3 bulanan sesuai tanggal masuk)
  effectiveDueDate: string; // YYYY-MM-DD (setelah tempo jika ada)
  cycleAmount: number; // Rp 2.500.000 per 3 bulan / kamar (atau Rp 5.000.000/semester)
  myCycleAmount?: number; // Nominal bagian penghuni (setengah jika sekamar berdua, penuh jika sendiri)
  isCyclePaid?: boolean;
  paidAt?: string | null;
  daysUntilDue: number; // positif = sisa hari, 0 = hari ini, negatif = hari lewat jatuh tempo
  daysOverdue: number; // 0 jika belum lewat, >0 jika lewat jatuh tempo asli
  status: RoomScheduleStatus;
  extension?: RoomRentExtension | null;
  reminderCount: number;
  lastReminderAt?: string | null;
}

export interface SocialDonationRecord {
  id: string;
  title: string; // Contoh: "Duka Cita Keluarga Kamar 12"
  donorName: string;
  roomCode: string;
  amount: number;
  method: 'TUNAI' | 'TRANSFER' | 'DANA';
  notes: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

interface RentMetaStore {
  extensions: Record<string, RoomRentExtension>;
  reminders: Record<string, RoomReminderMeta>;
  paidCycles?: Record<string, string>;
}

const EXTENSIONS_SETTING_KEY = 'room_rent_meta_json';
const DONATIONS_SETTING_KEY = 'social_donations_json';

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiRentMetaCache: RentMetaStore | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiSocialDonationsCache: SocialDonationRecord[] | undefined;
}

function parseIsoDateLocal(dateStr: string): Date {
  const parts = (dateStr || '2026-07-01').slice(0, 10).split('-').map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  return new Date(Date.UTC(2026, 6, 1));
}

function formatDateYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addMonthsSafe(base: Date, monthsToAdd: number): Date {
  const origDay = base.getUTCDate();
  const targetYear = base.getUTCFullYear();
  const targetMonth = base.getUTCMonth() + monthsToAdd;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(origDay, lastDayOfTargetMonth);
  return new Date(Date.UTC(targetYear, targetMonth, clampedDay));
}

function addDaysSafe(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Menghitung tanggal jatuh tempo siklus 3-bulanan yang relevan saat ini berdasarkan Tanggal Masuk kamar.
 * Jika tanggal jatuh tempo siklus terakhir masih berada dalam jendela <= 30 hari di belakang hari ini
 * (masa penagihan/tunggakan), tampilkan siklus tersebut; jika tidak, maju ke siklus +3 bulan berikutnya.
 */
function computeCurrent3MonthDueDate(checkInDateStr: string, todayDate: Date): Date {
  const start = parseIsoDateLocal(checkInDateStr);
  let due = addMonthsSafe(start, 3);
  const windowPastMs = 30 * 24 * 60 * 60 * 1000;

  let guard = 0;
  while (todayDate.getTime() - due.getTime() > windowPastMs && guard < 40) {
    due = addMonthsSafe(due, 3);
    guard++;
  }
  return due;
}

async function readSettingJson<T>(key: string, fallback: T): Promise<T> {
  const neonDb = getNeonDb();
  if (neonDb && !process.env.VITEST && process.env.NODE_ENV !== 'test') {
    try {
      const rows = await neonDb
        .select()
        .from(schema.settings)
        .where(eq(schema.settings.key, key));
      if (rows[0]?.value) {
        return JSON.parse(rows[0].value) as T;
      }
    } catch (err) {
      console.warn(`[RentSchedule] Gagal membaca ${key} dari Neon:`, err);
    }
  }
  return fallback;
}

async function writeSettingJson(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  const neonDb = getNeonDb();
  if (neonDb && !process.env.VITEST && process.env.NODE_ENV !== 'test') {
    await neonDb
      .insert(schema.settings)
      .values({ key, value: serialized, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value: serialized, updatedAt: new Date() },
      });
  }
}

async function loadRentMeta(): Promise<RentMetaStore> {
  const fallback: RentMetaStore = global.__kosOmiRentMetaCache || {
    extensions: {},
    reminders: {},
    paidCycles: {},
  };
  const loaded = await readSettingJson<RentMetaStore>(EXTENSIONS_SETTING_KEY, fallback);
  const safe: RentMetaStore = {
    extensions: loaded?.extensions || {},
    reminders: loaded?.reminders || {},
    paidCycles: loaded?.paidCycles || {},
  };
  global.__kosOmiRentMetaCache = safe;
  return safe;
}

async function saveRentMeta(meta: RentMetaStore): Promise<void> {
  global.__kosOmiRentMetaCache = meta;
  await writeSettingJson(EXTENSIONS_SETTING_KEY, meta);
}

function buildScheduleItem(
  roomCode: string,
  roomFloor: number,
  occupants: RoomRentScheduleItem['occupants'],
  checkInDate: string,
  meta: RentMetaStore
): RoomRentScheduleItem {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dueDateObj = computeCurrent3MonthDueDate(checkInDate, todayUtc);
  const nextDueDate = formatDateYmd(dueDateObj);

  const cycleKey = `${roomCode}:${nextDueDate}`;
  const paidAt = meta.paidCycles?.[cycleKey] || null;
  const isCyclePaid = Boolean(paidAt);

  const ext = isCyclePaid ? null : meta.extensions[roomCode] || null;
  const rem = meta.reminders[roomCode] || { reminderCount: 0 };

  const msPerDay = 24 * 60 * 60 * 1000;
  const rawDaysUntilDue = Math.round((dueDateObj.getTime() - todayUtc.getTime()) / msPerDay);
  const rawDaysOverdue = !isCyclePaid && rawDaysUntilDue < 0 ? Math.abs(rawDaysUntilDue) : 0;

  let effectiveDueObj = dueDateObj;
  let activeExtension: RoomRentExtension | null = null;
  if (!isCyclePaid && ext && ext.extraDays >= 1 && ext.extraDays <= 7) {
    const cappedPromised = addDaysSafe(dueDateObj, Math.min(7, Math.max(1, ext.extraDays)));
    activeExtension = {
      ...ext,
      promisedDate: formatDateYmd(cappedPromised),
    };
    effectiveDueObj = cappedPromised;
  }

  const daysUntilEffective = Math.round((effectiveDueObj.getTime() - todayUtc.getTime()) / msPerDay);

  let status: RoomScheduleStatus = 'AMAN';
  if (isCyclePaid) {
    status = 'AMAN';
  } else if (rawDaysOverdue > 7 || (activeExtension && daysUntilEffective < 0)) {
    // Lewat batas maksimal 7 hari (1 minggu) belum juga dibayar -> Wajib Konfirmasi Kendala ke Ibu Kos Langsung
    status = 'WAJIB_KONFIRMASI_IBU_KOS';
  } else if (activeExtension) {
    status = 'MINTA_TEMPO';
  } else if (rawDaysOverdue >= 1 && rawDaysOverdue <= 7) {
    status = 'TERLAMBAT';
  } else if (rawDaysUntilDue >= 0 && rawDaysUntilDue <= 7) {
    status = 'SEGERA_JATUH_TEMPO';
  } else {
    status = 'AMAN';
  }

  const cycleAmount = 2500000;
  const myCycleAmount = occupants.length >= 2 ? Math.round(cycleAmount / 2) : cycleAmount;

  return {
    roomCode,
    roomFloor,
    occupants,
    checkInDate: (checkInDate || '2026-07-01').slice(0, 10),
    nextDueDate,
    effectiveDueDate: formatDateYmd(effectiveDueObj),
    cycleAmount, // Per 3 bulan per kamar (Rp 5.000.000 per semester / 6 bulan)
    myCycleAmount,
    isCyclePaid,
    paidAt,
    daysUntilDue: rawDaysUntilDue,
    daysOverdue: rawDaysOverdue,
    status,
    extension: activeExtension,
    reminderCount: rem.reminderCount || 0,
    lastReminderAt: rem.lastReminderAt || null,
  };
}

/**
 * 1. Ambil jadwal jatuh tempo 3-bulanan seluruh kamar terisi (untuk Keuangan & Pengelola)
 */
export async function fetchRoomRentSchedulesAction(): Promise<RoomRentScheduleItem[]> {
  const store = await ensurePostgresHydrated();
  const meta = await loadRentMeta();

  const byRoom = new Map<
    string,
    {
      roomFloor: number;
      checkInDate: string;
      occupants: RoomRentScheduleItem['occupants'];
    }
  >();

  for (const ten of store.tenancies) {
    if (ten.status !== 'AKTIF') continue;
    const existing = byRoom.get(ten.roomCode);
    const occ = {
      id: ten.userId,
      tenancyId: ten.id,
      name: ten.userName,
      email: ten.userEmail,
      phone: ten.userPhone || '-',
    };
    if (!existing) {
      byRoom.set(ten.roomCode, {
        roomFloor: ten.roomFloor || (Number(ten.roomCode) <= 33 ? 1 : 2),
        checkInDate: ten.checkInDate || '2026-07-01',
        occupants: [occ],
      });
    } else {
      existing.occupants.push(occ);
    }
  }

  const priority: Record<RoomScheduleStatus, number> = {
    WAJIB_KONFIRMASI_IBU_KOS: 0,
    TERLAMBAT: 1,
    MINTA_TEMPO: 2,
    SEGERA_JATUH_TEMPO: 3,
    AMAN: 4,
  };

  return Array.from(byRoom.entries())
    .map(([roomCode, info]) =>
      buildScheduleItem(roomCode, info.roomFloor, info.occupants, info.checkInDate, meta)
    )
    .sort((a, b) => {
      const pDiff = priority[a.status] - priority[b.status];
      if (pDiff !== 0) return pDiff;
      return (parseInt(a.roomCode, 10) || 0) - (parseInt(b.roomCode, 10) || 0);
    });
}

/**
 * 2. Ambil jadwal sewa 3-bulanan khusus kamar penghuni yang sedang login (/penghuni/tagihan)
 */
export async function fetchMyRoomRentScheduleAction(): Promise<RoomRentScheduleItem | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const schedules = await fetchRoomRentSchedulesAction();
  const emailNorm = currentUser.email.toLowerCase().trim();
  return (
    schedules.find((s) =>
      s.occupants.some(
        (o) => o.id === currentUser.id || o.email.toLowerCase().trim() === emailNorm
      )
    ) || null
  );
}

/**
 * 3. Pengelola / Keuangan / Admin mengedit Tanggal Masuk kamar (otomatis memperbarui siklus jatuh tempo 3 bulan)
 */
export async function updateRoomCheckInDateAction(
  roomCode: string,
  newCheckInDate: string
): Promise<{ success: boolean; message: string; schedule?: RoomRentScheduleItem }> {
  const actor = await requireRole(['ADMIN', 'PENGELOLA', 'KEUANGAN']);
  const cleanDate = (newCheckInDate || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return { success: false, message: 'Format tanggal masuk tidak valid (gunakan YYYY-MM-DD).' };
  }

  const store = await ensurePostgresHydrated();
  const matchingTenancies = store.tenancies.filter(
    (t) => t.roomCode === roomCode && t.status === 'AKTIF'
  );
  if (matchingTenancies.length === 0) {
    return { success: false, message: `Tidak ada penghuni aktif pada Kamar No. ${roomCode}.` };
  }

  const newContractEnd = formatDateYmd(addMonthsSafe(parseIsoDateLocal(cleanDate), 6));
  for (const ten of matchingTenancies) {
    ten.checkInDate = cleanDate;
    ten.contractEndDate = newContractEnd;
  }

  for (const prof of store.profiles) {
    if (prof.roomCode === roomCode) {
      prof.checkInDate = cleanDate;
      prof.tenancyEnd = newContractEnd;
    }
  }

  // Bersihkan pengajuan tempo lama saat tanggal masuk / siklus diperbarui
  const meta = await loadRentMeta();
  if (meta.extensions[roomCode]) {
    delete meta.extensions[roomCode];
    await saveRentMeta(meta);
  }

  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'UPDATE_ROOM_CHECKIN_DATE',
    category: 'tenancies',
    entityId: `room-${roomCode}`,
    description: `Memperbarui tanggal masuk Kamar No. ${roomCode} menjadi ${cleanDate} (siklus jatuh tempo 3-bulanan otomatis disesuaikan)`,
    meta: { roomCode, checkInDate: cleanDate, contractEndDate: newContractEnd },
  });

  revalidatePath('/pengelola/penghuni');
  revalidatePath('/keuangan/tagihan');
  revalidatePath('/penghuni/tagihan');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/admin/log-aktivitas');

  const updatedList = await fetchRoomRentSchedulesAction();
  const schedule = updatedList.find((s) => s.roomCode === roomCode);

  return {
    success: true,
    message: `Tanggal masuk Kamar No. ${roomCode} berhasil diperbarui ke ${cleanDate}. Jatuh tempo 3-bulanan otomatis menjadi ${schedule?.nextDueDate || '-'}.`,
    schedule,
  };
}

/**
 * 4. Kirim Pengingat Tagihan Sewa Per Kamar (WA + Catat Log Notifikasi)
 */
export async function sendRoomRentReminderAction(
  roomCode: string
): Promise<{
  success: boolean;
  message: string;
  whatsappUrl?: string;
  schedule?: RoomRentScheduleItem;
}> {
  const actor = await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const schedules = await fetchRoomRentSchedulesAction();
  const target = schedules.find((s) => s.roomCode === roomCode);

  if (!target) {
    return { success: false, message: `Data jadwal kamar No. ${roomCode} tidak ditemukan.` };
  }

  const meta = await loadRentMeta();
  const nowIso = new Date().toISOString();
  const prevRem = meta.reminders[roomCode] || { reminderCount: 0 };
  meta.reminders[roomCode] = {
    reminderCount: (prevRem.reminderCount || 0) + 1,
    lastReminderAt: nowIso,
  };
  await saveRentMeta(meta);

  const occupantNames = target.occupants.map((o) => o.name).join(' & ');
  const rawPhone = target.occupants.find((o) => o.phone && o.phone !== '-')?.phone || '';
  const waPhone = rawPhone ? rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '62') : '';

  const isFinal = target.status === 'WAJIB_KONFIRMASI_IBU_KOS';
  const waMessage = isFinal
    ? `Assalamu'alaikum ${occupantNames} (Kamar No. ${roomCode} Kos Omi).\n\nTagihan sewa 3-bulanan Kamar No. ${roomCode} (jatuh tempo ${target.nextDueDate}) telah melewati batas maksimal perpanjangan 7 hari (1 minggu).\n\nMohon segera mengonfirmasi kendala pembayaran secara langsung kepada Ibu Kos (Ibu Yulastri: 0813-7432-9562). Terima kasih.`
    : `Assalamu'alaikum ${occupantNames} (Kamar No. ${roomCode} Kos Omi).\n\nMengingatkan jadwal pembayaran sewa 3-bulanan Kamar No. ${roomCode} (tanggal masuk: ${target.checkInDate}) dengan jatuh tempo tanggal ${target.effectiveDueDate}.\n\nJika sedang ada kendala, Anda dapat mengajukan perpanjangan waktu maksimal 7 hari melalui Portal Penghuni Kos Omi. Terima kasih.`;

  const whatsappUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  const store = await ensurePostgresHydrated();
  store.notificationLogs.unshift({
    id: `ntf-rent-k${roomCode}-${Date.now()}`,
    recipient: rawPhone || target.occupants[0]?.email || `Kamar ${roomCode}`,
    recipientName: `${occupantNames} (Kamar ${roomCode})`,
    channel: 'WHATSAPP',
    template: isFinal
      ? `peringatan_final_7_hari_kamar_${roomCode}`
      : `pengingat_sewa_3bulanan_kamar_${roomCode}`,
    status: 'SENT',
    attempts: meta.reminders[roomCode].reminderCount,
    sentAt: nowIso,
    createdAt: nowIso,
  });
  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: isFinal ? 'SEND_FINAL_7DAY_WARNING' : 'SEND_ROOM_RENT_REMINDER',
    category: 'notifications',
    entityId: `room-${roomCode}`,
    description: isFinal
      ? `Mengirim peringatan final (>7 hari — wajib konfirmasi ke Ibu Kos) untuk Kamar No. ${roomCode} (${occupantNames})`
      : `Mengirim pengingat sewa 3-bulanan ke Kamar No. ${roomCode} (${occupantNames})`,
    meta: { roomCode, nextDueDate: target.nextDueDate, isFinal },
  });

  revalidatePath('/keuangan/tagihan');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');

  const refreshed = (await fetchRoomRentSchedulesAction()).find((s) => s.roomCode === roomCode);

  return {
    success: true,
    message: isFinal
      ? `Peringatan final batas 7 hari untuk Kamar No. ${roomCode} (${occupantNames}) berhasil dicatat!`
      : `Pengingat tagihan sewa untuk Kamar No. ${roomCode} (${occupantNames}) berhasil dicatat!`,
    whatsappUrl,
    schedule: refreshed,
  };
}

/**
 * 5. Penghuni mengajukan perpanjangan waktu bayar (Maksimal 7 Hari / 1 Minggu)
 */
export async function requestRentExtensionAction(params: {
  extraDays: number;
  reason: string;
}): Promise<{ success: boolean; message: string; schedule?: RoomRentScheduleItem | null }> {
  const user = await requireRole(['PENGHUNI']);
  const days = Math.round(Number(params.extraDays));
  if (Number.isNaN(days) || days < 1 || days > 7) {
    return {
      success: false,
      message: 'Batas perpanjangan waktu pembayaran hanya dapat dipilih antara 1 sampai 7 hari (maksimal 1 minggu).',
    };
  }

  const cleanReason = (params.reason || '').trim();
  if (cleanReason.length < 5) {
    return {
      success: false,
      message: 'Mohon tulis alasan singkat (minimal 5 karakter) agar diketahui Staf Keuangan & Ibu Kos.',
    };
  }

  const mySchedule = await fetchMyRoomRentScheduleAction();
  if (!mySchedule) {
    return { success: false, message: 'Data kontrak kamar aktif Anda tidak ditemukan.' };
  }

  const promisedDate = formatDateYmd(addDaysSafe(parseIsoDateLocal(mySchedule.nextDueDate), days));
  const meta = await loadRentMeta();
  const nowIso = new Date().toISOString();

  meta.extensions[mySchedule.roomCode] = {
    roomCode: mySchedule.roomCode,
    requestedBy: user.name,
    requestedEmail: user.email,
    extraDays: days,
    promisedDate,
    reason: cleanReason,
    requestedAt: nowIso,
  };
  await saveRentMeta(meta);

  const store = await ensurePostgresHydrated();
  store.notificationLogs.unshift({
    id: `ntf-ext-k${mySchedule.roomCode}-${Date.now()}`,
    recipient: '+62 813-7432-9562',
    recipientName: `Pengajuan Tempo ${days} Hari (${user.name} - Kamar ${mySchedule.roomCode})`,
    channel: 'WHATSAPP',
    template: `pengajuan_tempo_${days}_hari_kamar_${mySchedule.roomCode}`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });
  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: user.id,
    actorName: user.name,
    actorRole: 'PENGHUNI',
    action: 'REQUEST_RENT_EXTENSION',
    category: 'payments',
    entityId: `room-${mySchedule.roomCode}`,
    description: `Mengajukan perpanjangan waktu bayar +${days} hari (s/d ${promisedDate}) untuk Kamar No. ${mySchedule.roomCode}: "${cleanReason}"`,
    meta: { roomCode: mySchedule.roomCode, extraDays: days, promisedDate, reason: cleanReason },
  });

  revalidatePath('/penghuni/tagihan');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/keuangan/tagihan');
  revalidatePath('/admin/log-aktivitas');
  revalidatePath('/admin/notifikasi');

  const updated = await fetchMyRoomRentScheduleAction();
  return {
    success: true,
    message: `Pengajuan perpanjangan waktu +${days} hari (s/d ${promisedDate}) berhasil dicatat! Jika melewati batas 7 hari belum dibayar, Anda wajib konfirmasi langsung ke Ibu Kos.`,
    schedule: updated,
  };
}

/**
 * 5b. Penghuni membayar tagihan sewa 3-bulanan langsung dari kartu Jatuh Tempo / Daftar Tagihan
 * Otomatis mencatat transaksi LUNAS ke daftar tagihan penghuni & laporan Keuangan + melunasi siklus jatuh tempo.
 */
export async function payRoomRentCycleAction(params: {
  method?: string;
  transferProofUrl?: string;
}): Promise<{
  success: boolean;
  message: string;
  bill?: import('@/types/billing').MonthlyBill;
  schedule?: RoomRentScheduleItem | null;
}> {
  const user = await requireRole(['PENGHUNI']);
  const mySchedule = await fetchMyRoomRentScheduleAction();
  if (!mySchedule) {
    return { success: false, message: 'Data kontrak kamar aktif Anda tidak ditemukan.' };
  }

  const nowIso = new Date().toISOString();
  const cycleKey = `${mySchedule.roomCode}:${mySchedule.nextDueDate}`;
  const invoiceCode = `INV-SEWA-${mySchedule.roomCode}-${mySchedule.nextDueDate.replace(/-/g, '')}`;
  const amount = mySchedule.myCycleAmount ?? mySchedule.cycleAmount;
  const methodLabel =
    (params.method || 'bri').toLowerCase() === 'qris'
      ? 'QRIS'
      : 'Transfer Bank BRI (763701006296502)';

  const store = await ensurePostgresHydrated();

  // 1. Update atau buat tagihan MonthlyBill pada store.bills
  const dueYear = Number(mySchedule.nextDueDate.slice(0, 4)) || new Date().getFullYear();
  const periodKey = mySchedule.nextDueDate.slice(0, 7);
  const existingBill = store.bills.find(
    (b) =>
      b.invoiceCode === invoiceCode &&
      (b.tenantEmail?.toLowerCase().trim() === user.email.toLowerCase().trim() ||
        b.roomCode === mySchedule.roomCode)
  );

  let targetBill: import('@/types/billing').MonthlyBill;
  if (existingBill) {
    existingBill.status = 'LUNAS';
    existingBill.paidAt = nowIso;
    existingBill.paymentMethod = methodLabel;
    existingBill.rentAmount = amount;
    existingBill.totalAmount = amount;
    existingBill.amount = amount;
    targetBill = existingBill;
  } else {
    targetBill = {
      id: `bill-sewa-${mySchedule.roomCode}-${Date.now()}`,
      invoiceCode,
      roomCode: mySchedule.roomCode,
      tenantEmail: user.email,
      tenantName: user.name,
      tenantPhone: user.phone || '-',
      periodMonth: `Sewa 3-Bulanan (${mySchedule.nextDueDate})`,
      periodKey,
      year: dueYear,
      dueDate: mySchedule.effectiveDueDate,
      rentAmount: amount,
      amount,
      penaltyAmount: 0,
      totalAmount: amount,
      status: 'LUNAS',
      paidAt: nowIso,
      paymentMethod: methodLabel,
      createdAt: nowIso,
    };
    store.bills.unshift(targetBill);
  }

  // 2. Catat transaksi pembayaran ke store.payments agar langsung masuk ke portal Keuangan
  const existingPayment = store.payments.find((p) => p.invoiceCode === invoiceCode);
  if (existingPayment) {
    existingPayment.status = 'SETTLEMENT';
    existingPayment.paidAt = nowIso;
    existingPayment.paymentMethod = methodLabel;
    if (params.transferProofUrl) {
      existingPayment.rawPayload = {
        ...(existingPayment.rawPayload || {}),
        transferProofUrl: params.transferProofUrl,
      };
    }
  } else {
    store.payments.unshift({
      id: `pay-sewa-${Date.now()}`,
      invoiceCode,
      reservationId: `sewa-${mySchedule.roomCode}`,
      reservationCode: `SEWA-${mySchedule.roomCode}`,
      roomCode: mySchedule.roomCode,
      amount,
      paymentMethod: methodLabel,
      status: 'SETTLEMENT',
      bank: 'BRI',
      settlementTime: nowIso,
      rawPayload: {
        tenantName: user.name,
        tenantEmail: user.email,
        transferProofUrl: params.transferProofUrl || undefined,
      },
      expiresAt: nowIso,
      paidAt: nowIso,
      createdAt: nowIso,
    });
  }

  // 3. Tandai siklus 3-bulanan kamar ini LUNAS & hapus status perpanjangan waktu lama
  const meta = await loadRentMeta();
  meta.paidCycles = meta.paidCycles || {};
  meta.paidCycles[cycleKey] = nowIso;
  if (meta.extensions[mySchedule.roomCode]) {
    delete meta.extensions[mySchedule.roomCode];
  }
  await saveRentMeta(meta);

  // 4. Catat notifikasi & audit log
  store.notificationLogs.unshift({
    id: `ntf-pay-sewa-k${mySchedule.roomCode}-${Date.now()}`,
    recipient: '+62 813-7432-9562',
    recipientName: `Pembayaran Sewa Lunas (${user.name} - Kamar ${mySchedule.roomCode})`,
    channel: 'WHATSAPP',
    template: `pembayaran_sewa_lunas_kamar_${mySchedule.roomCode}`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });

  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: user.id,
    actorName: user.name,
    actorRole: 'PENGHUNI',
    action: 'PAY_ROOM_RENT_CYCLE',
    category: 'payments',
    entityId: invoiceCode,
    description: `Melunasi tagihan sewa 3-bulanan Kamar No. ${mySchedule.roomCode} sebesar Rp ${amount.toLocaleString('id-ID')} via ${methodLabel}`,
    meta: { roomCode: mySchedule.roomCode, invoiceCode, amount, method: methodLabel },
  });

  revalidatePath('/penghuni/tagihan');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/penghuni/riwayat');
  revalidatePath('/keuangan/tagihan');
  revalidatePath('/keuangan/transaksi');
  revalidatePath('/keuangan/dashboard');
  revalidatePath('/keuangan/laporan');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');

  const updatedSchedule = await fetchMyRoomRentScheduleAction();
  return {
    success: true,
    message: `Pembayaran sewa 3-bulanan Kamar No. ${mySchedule.roomCode} (${invoiceCode}) berhasil dicatat LUNAS dan diteruskan ke Keuangan Kos Omi!`,
    bill: targetBill,
    schedule: updatedSchedule,
  };
}

/**
 * 6. IURAN SOSIAL / DUKA CITA (SEIKHLASNYA) — Terpisah dari Pendapatan Sewa Kos
 */
export async function fetchSocialDonationsAction(): Promise<SocialDonationRecord[]> {
  const fallback = global.__kosOmiSocialDonationsCache || [];
  const list = await readSettingJson<SocialDonationRecord[]>(DONATIONS_SETTING_KEY, fallback);
  const safeList = Array.isArray(list) ? list : [];
  global.__kosOmiSocialDonationsCache = safeList;
  return safeList;
}

export async function addSocialDonationAction(input: {
  title: string;
  donorName: string;
  roomCode: string;
  amount: number;
  method: 'TUNAI' | 'TRANSFER' | 'DANA';
  notes?: string;
  date?: string;
}): Promise<{ success: boolean; message: string; record?: SocialDonationRecord }> {
  const actor = await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const title = (input.title || '').trim();
  const donorName = (input.donorName || '').trim();
  const amount = Math.round(Number(input.amount));

  if (title.length < 3 || donorName.length < 2) {
    return { success: false, message: 'Keterangan kegiatan duka cita dan nama penyumbang wajib diisi.' };
  }
  if (Number.isNaN(amount) || amount <= 0) {
    return { success: false, message: 'Nominal sumbangan seikhlasnya harus lebih besar dari Rp 0.' };
  }

  const list = await fetchSocialDonationsAction();
  const nowIso = new Date().toISOString();
  const record: SocialDonationRecord = {
    id: `don-${Date.now()}`,
    title,
    donorName,
    roomCode: (input.roomCode || '-').trim(),
    amount,
    method: input.method || 'TUNAI',
    notes: (input.notes || '').trim(),
    date: (input.date || nowIso.slice(0, 10)).slice(0, 10),
    createdAt: nowIso,
  };

  const nextList = [record, ...list];
  global.__kosOmiSocialDonationsCache = nextList;
  await writeSettingJson(DONATIONS_SETTING_KEY, nextList);

  await createAuditLog({
    userId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'SOCIAL_DONATION_RECORDED',
    category: 'payments',
    entityId: record.id,
    description: `Mencatat iuran duka cita/sosial seikhlasnya Rp ${amount.toLocaleString('id-ID')} dari ${donorName} (Kamar ${record.roomCode}) — ${title}`,
    meta: { title, donorName, roomCode: record.roomCode, amount },
  });

  revalidatePath('/keuangan/transaksi');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: `Iuran duka cita seikhlasnya dari ${donorName} (Rp ${amount.toLocaleString('id-ID')}) berhasil dicatat!`,
    record,
  };
}

export async function deleteSocialDonationAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireRole(['ADMIN', 'KEUANGAN']);
  const list = await fetchSocialDonationsAction();
  const nextList = list.filter((item) => item.id !== id);
  global.__kosOmiSocialDonationsCache = nextList;
  await writeSettingJson(DONATIONS_SETTING_KEY, nextList);
  revalidatePath('/keuangan/transaksi');
  return { success: true, message: 'Catatan iuran sosial berhasil dihapus.' };
}

/**
 * 7. KIRIM PENGINGAT MASSAL 1X KLIK UNTUK SEMUA KAMAR (Keuangan)
 */
export async function sendBulkRentRemindersAction(
  mode: 'ALL' | 'DUE_ONLY' = 'ALL'
): Promise<{ success: boolean; count: number; message: string }> {
  const actor = await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const schedules = await fetchRoomRentSchedulesAction();
  const targets =
    mode === 'DUE_ONLY'
      ? schedules.filter((s) => s.status !== 'AMAN')
      : schedules;

  if (targets.length === 0) {
    return {
      success: false,
      count: 0,
      message: 'Tidak ada kamar yang perlu dikirim pengingat saat ini.',
    };
  }

  const meta = await loadRentMeta();
  const store = await ensurePostgresHydrated();
  const nowIso = new Date().toISOString();

  for (const item of targets) {
    const prev = meta.reminders[item.roomCode] || { reminderCount: 0 };
    meta.reminders[item.roomCode] = {
      reminderCount: prev.reminderCount + 1,
      lastReminderAt: nowIso,
    };
    const isFinal = item.status === 'WAJIB_KONFIRMASI_IBU_KOS';
    const occupantNames = item.occupants.map((o) => o.name).join(' & ');
    store.notificationLogs.unshift({
      id: `ntf-bulk-k${item.roomCode}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      recipient: item.occupants[0]?.phone || '-',
      recipientName: `${occupantNames} (Kamar ${item.roomCode})`,
      channel: 'WHATSAPP',
      template: isFinal
        ? `peringatan_final_7hari_kamar_${item.roomCode}`
        : `pengingat_sewa_3bulanan_kamar_${item.roomCode}`,
      status: 'SENT',
      attempts: meta.reminders[item.roomCode].reminderCount,
      sentAt: nowIso,
      createdAt: nowIso,
    });
  }

  await saveRentMeta(meta);
  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'SEND_BULK_RENT_REMINDERS',
    category: 'notifications',
    entityId: `bulk-${targets.length}`,
    description: `Mengirim pengingat sewa 3-bulanan serentak ke ${targets.length} kamar aktif`,
    meta: { count: targets.length, mode },
  });

  revalidatePath('/keuangan/tagihan');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/penghuni/tagihan');
  revalidatePath('/admin/notifikasi');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    count: targets.length,
    message: `Pengingat tagihan sewa 3-bulanan berhasil dikirim serentak ke ${targets.length} kamar aktif.`,
  };
}

/**
 * 8. PENGUMUMAN IURAN DUKA CITA (Keuangan -> Notif ke Semua Penghuni -> Donasi Seikhlasnya Otomatis Masuk Keuangan)
 */
export interface SocialAnnouncement {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

const ANNOUNCEMENTS_SETTING_KEY = 'social_announcements_json';

export async function fetchSocialAnnouncementsAction(): Promise<SocialAnnouncement[]> {
  const list = await readSettingJson<SocialAnnouncement[]>(ANNOUNCEMENTS_SETTING_KEY, []);
  return Array.isArray(list) ? list : [];
}

export async function fetchActiveSocialAnnouncementsAction(): Promise<SocialAnnouncement[]> {
  const list = await fetchSocialAnnouncementsAction();
  return list.filter((a) => a.isActive);
}

export async function createSocialAnnouncementAction(input: {
  title: string;
  description: string;
}): Promise<{ success: boolean; message: string; announcement?: SocialAnnouncement }> {
  const actor = await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const title = (input.title || '').trim();
  const description = (input.description || '').trim();
  if (title.length < 4 || description.length < 5) {
    return {
      success: false,
      message: 'Judul dan deskripsi pengumuman duka cita wajib diisi.',
    };
  }

  const list = await fetchSocialAnnouncementsAction();
  const nowIso = new Date().toISOString();
  const announcement: SocialAnnouncement = {
    id: `ann-${Date.now()}`,
    title,
    description,
    createdBy: actor.name,
    createdAt: nowIso,
    isActive: true,
  };

  await writeSettingJson(ANNOUNCEMENTS_SETTING_KEY, [announcement, ...list]);

  await createAuditLog({
    userId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: 'CREATE_SOCIAL_ANNOUNCEMENT',
    category: 'notifications',
    entityId: announcement.id,
    description: `Menerbitkan pengumuman iuran duka cita: "${title}"`,
    meta: { title, description },
  });

  revalidatePath('/keuangan/transaksi');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/penghuni/tagihan');

  return {
    success: true,
    message: 'Pengumuman iuran duka cita berhasil dikirim ke seluruh penghuni kos.',
    announcement,
  };
}

export async function closeSocialAnnouncementAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireRole(['ADMIN', 'KEUANGAN', 'PENGELOLA']);
  const list = await fetchSocialAnnouncementsAction();
  const updated = list.map((a) => (a.id === id ? { ...a, isActive: false } : a));
  await writeSettingJson(ANNOUNCEMENTS_SETTING_KEY, updated);
  revalidatePath('/keuangan/transaksi');
  revalidatePath('/penghuni/dashboard');
  return { success: true, message: 'Pengumuman duka cita telah ditutup.' };
}

export async function submitPenghuniSocialDonationAction(input: {
  title: string;
  amount: number;
  method: 'TRANSFER' | 'TUNAI' | 'DANA';
  notes?: string;
}): Promise<{ success: boolean; message: string; record?: SocialDonationRecord }> {
  const user = await requireRole(['PENGHUNI']);
  const amount = Math.round(Number(input.amount));
  if (Number.isNaN(amount) || amount < 1000) {
    return {
      success: false,
      message: 'Nominal sumbangan seikhlasnya minimal Rp 1.000.',
    };
  }

  const store = await ensurePostgresHydrated();
  const myTenancy = store.tenancies.find(
    (t) => t.userEmail.toLowerCase().trim() === user.email.toLowerCase().trim() && t.status === 'AKTIF'
  );
  const roomCode = myTenancy?.roomCode || '-';
  const nowIso = new Date().toISOString();

  const list = await fetchSocialDonationsAction();
  const record: SocialDonationRecord = {
    id: `don-${Date.now()}`,
    title: (input.title || 'Iuran Duka Cita').trim(),
    donorName: user.name,
    roomCode,
    amount,
    method: input.method || 'TRANSFER',
    notes: (input.notes || 'Transfer seikhlasnya via Portal Penghuni').trim(),
    date: nowIso.slice(0, 10),
    createdAt: nowIso,
  };

  const nextList = [record, ...list];
  global.__kosOmiSocialDonationsCache = nextList;
  await writeSettingJson(DONATIONS_SETTING_KEY, nextList);

  store.notificationLogs.unshift({
    id: `ntf-don-${Date.now()}`,
    recipient: '+62 813-7432-9562',
    recipientName: `Iuran Duka Cita Rp ${amount.toLocaleString('id-ID')} (${user.name} · Kamar ${roomCode})`,
    channel: 'WHATSAPP',
    template: `iuran_duka_cita_masuk_kamar_${roomCode}`,
    status: 'SENT',
    attempts: 1,
    sentAt: nowIso,
    createdAt: nowIso,
  });
  savePersistentStore(store);
  await flushPostgresSync();

  await createAuditLog({
    userId: user.id,
    actorName: user.name,
    actorRole: 'PENGHUNI',
    action: 'PENGHUNI_SOCIAL_DONATION',
    category: 'payments',
    entityId: record.id,
    description: `Mengirim iuran duka cita seikhlasnya Rp ${amount.toLocaleString('id-ID')} (Kamar ${roomCode})`,
    meta: { title: record.title, amount, roomCode },
  });

  revalidatePath('/keuangan/transaksi');
  revalidatePath('/penghuni/dashboard');
  revalidatePath('/admin/log-aktivitas');

  return {
    success: true,
    message: `Terima kasih! Sumbangan seikhlasnya sebesar Rp ${amount.toLocaleString('id-ID')} telah otomatis tercatat di bagian Keuangan.`,
    record,
  };
}
