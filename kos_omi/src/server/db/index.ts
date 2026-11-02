import type { Room, RoomFilterOptions, RoomStatus } from '@/types/room';
import type { CalonUser, Reservation, PaymentInvoice, CreateReservationInput } from '../../types/reservation';
import type { PaymentMethodType } from '@/types/finance';
import { ALL_ROOMS } from '@/data/rooms';

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
  // Salin 67 kamar nyata Kos Omi
  const initialRooms: Room[] = JSON.parse(JSON.stringify(ALL_ROOMS));

  // Pengguna awal (calon penghuni nyata)
  const initialUsers: CalonUser[] = [
    {
      id: 'usr-anisa',
      name: 'Anisa Permata',
      email: 'anisa@example.com',
      phone: '081298765432',
      nik: '1371016508980002',
      occupation: 'Mahasiswi Pascasarjana UIN Imam Bonjol Padang',
      emergencyContactName: 'Bambang Permata',
      emergencyContactPhone: '081122334455',
      emergencyContactRelation: 'Orang Tua (Ayah)',
      ktpUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    },
    {
      id: 'usr-bagas',
      name: 'Bagas Kurniawan',
      email: 'bagas@example.com',
      phone: '081234567890',
      nik: '1371021405970001',
      occupation: 'Tenaga Pengajar di Kota Padang',
      emergencyContactName: 'Dewi Lestari',
      emergencyContactPhone: '081398761234',
      emergencyContactRelation: 'Kakak Kandung',
      ktpUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
  ];

  // Skenario Reservasi PRD:
  // 1. Anisa Permata: Kamar A-112 disetujui, siap bayar (24 jam)
  const anisaExpiresAt = new Date(Date.now() + 18 * 3600 * 1000).toISOString(); // sisa 18 jam
  const anisaReservation: Reservation = {
    id: 'rsv-anisa-112',
    code: 'RSV-202610-A112',
    roomId: 'room-a-112',
    roomCode: 'A-112',
    userId: 'usr-anisa',
    userName: 'Anisa Permata',
    userEmail: 'anisa@example.com',
    userPhone: '081298765432',
    userNik: '1371016508980002',
    userOccupation: 'Mahasiswi Pascasarjana UIN Imam Bonjol Padang',
    emergencyContactName: 'Bambang Permata',
    emergencyContactPhone: '081122334455',
    emergencyContactRelation: 'Orang Tua (Ayah)',
    checkInDate: '2026-11-01',
    durationMonths: 6,
    monthlyPrice: 1450000,
    depositAmount: 1450000,
    totalInitialPayment: 2900000,
    status: 'APPROVED',
    expiresAt: anisaExpiresAt,
    adminNotes: 'Dokumen KTP dan KTM lengkap terverifikasi. Kamar siap ditempati sesuai tanggal masuk.',
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  };

  const anisaInvoice: PaymentInvoice = {
    id: 'inv-anisa-112',
    invoiceCode: 'INV-202610-A112',
    reservationId: 'rsv-anisa-112',
    reservationCode: 'RSV-202610-A112',
    roomCode: 'A-112',
    amount: 2900000,
    status: 'UNPAID',
    paymentMethod: 'QRIS',
    snapToken: 'snap-token-anisa-demo-112',
    snapRedirectUrl: '/pembayaran/simulasi?invoice=INV-202610-A112',
    expiresAt: anisaExpiresAt,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  };

  // 2. Bagas Kurniawan: Kamar D-404 baru diajukan (status PENDING_REVIEW, kamar tetap TERSEDIA sampai disetujui)
  const bagasReservation: Reservation = {
    id: 'rsv-bagas-404',
    code: 'RSV-202610-D404',
    roomId: 'room-d-404',
    roomCode: 'D-404',
    userId: 'usr-bagas',
    userName: 'Bagas Kurniawan',
    userEmail: 'bagas@example.com',
    userPhone: '081234567890',
    userNik: '1371021405970001',
    userOccupation: 'Tenaga Pengajar di Kota Padang',
    emergencyContactName: 'Dewi Lestari',
    emergencyContactPhone: '081398761234',
    emergencyContactRelation: 'Kakak Kandung',
    checkInDate: '2026-11-05',
    durationMonths: 12,
    monthlyPrice: 1450000,
    depositAmount: 1450000,
    totalInitialPayment: 2900000,
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  };

  // 3. Rina Kusuma: Kamar A-101 sudah lunas dan aktif huni
  const rinaReservation: Reservation = {
    id: 'rsv-rina-101',
    code: 'RSV-202609-A101',
    roomId: 'room-a-101',
    roomCode: 'A-101',
    userId: 'usr-rina',
    userName: 'Rina Kusuma',
    userEmail: 'rina@example.com',
    userPhone: '081211112222',
    userNik: '1371031201990004',
    userOccupation: 'Tenaga Medis RSUP Padang',
    emergencyContactName: 'Hendra Kusuma',
    emergencyContactPhone: '081233334444',
    emergencyContactRelation: 'Orang Tua',
    checkInDate: '2026-09-01',
    durationMonths: 12,
    monthlyPrice: 1450000,
    depositAmount: 1450000,
    totalInitialPayment: 2900000,
    status: 'PAID',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 58 * 24 * 3600 * 1000).toISOString(),
  };

  const rinaInvoice: PaymentInvoice = {
    id: 'inv-rina-101',
    invoiceCode: 'INV-202609-A101',
    reservationId: 'rsv-rina-101',
    reservationCode: 'RSV-202609-A101',
    roomCode: 'A-101',
    amount: 2900000,
    status: 'SETTLEMENT',
    paymentMethod: 'BCA_VA',
    paidAt: new Date(Date.now() - 58 * 24 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 57 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 59 * 24 * 3600 * 1000).toISOString(),
  };

  // 4. Dummy Invoice PRD Task 1.7 (INV-202506-00045) - Status Menunggu / UNPAID
  const dummyInvoice45: PaymentInvoice = {
    id: 'inv-dummy-45',
    invoiceCode: 'INV-202506-00045',
    reservationId: 'rsv-dummy-45',
    reservationCode: 'RSV-202506-B204',
    roomCode: 'B-204',
    amount: 2200000,
    status: 'UNPAID',
    paymentMethod: 'QRIS',
    snapToken: 'snap-token-inv-202506-00045',
    snapRedirectUrl: '/pembayaran/selesai?order_id=INV-202506-00045',
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  };

  const dummyReservation45: Reservation = {
    id: 'rsv-dummy-45',
    code: 'RSV-202506-B204',
    roomId: 'room-b-204',
    roomCode: 'B-204',
    userId: 'usr-anisa',
    userName: 'Anisa Permata',
    userEmail: 'anisa@example.com',
    userPhone: '081298765432',
    userNik: '1371016508980002',
    userOccupation: 'Mahasiswi Pascasarjana UIN Imam Bonjol Padang',
    emergencyContactName: 'Bambang Permata',
    emergencyContactPhone: '081122334455',
    emergencyContactRelation: 'Orang Tua (Ayah)',
    checkInDate: '2026-11-10',
    durationMonths: 6,
    monthlyPrice: 1100000,
    depositAmount: 1100000,
    totalInitialPayment: 2200000,
    status: 'APPROVED',
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    adminNotes: 'Reservasi disetujui, silakan bayar melalui Midtrans.',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  };

  // 5. Dummy Invoice PRD Bab 7 (KOS-202506-00012) - Status Lunas / SETTLEMENT
  const dummyInvoiceSettled12: PaymentInvoice = {
    id: 'inv-dummy-12',
    invoiceCode: 'INV-202506-00012',
    reservationId: 'rsv-dummy-12',
    reservationCode: 'RSV-202506-A105',
    roomCode: 'A-105',
    amount: 1100000,
    status: 'SETTLEMENT',
    paymentMethod: 'QRIS',
    paidAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  };

  // 6. Dummy Invoice PRD Bab 7 (KOS-202506-00014) - Status Kedaluwarsa / EXPIRED
  const dummyInvoiceExpired14: PaymentInvoice = {
    id: 'inv-dummy-14',
    invoiceCode: 'INV-202506-00014',
    reservationId: 'rsv-dummy-14',
    reservationCode: 'RSV-202506-C302',
    roomCode: 'C-302',
    amount: 750000,
    status: 'EXPIRED',
    paymentMethod: 'GOPAY',
    expiresAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  };

  return {
    rooms: initialRooms,
    users: initialUsers,
    reservations: [anisaReservation, bagasReservation, rinaReservation, dummyReservation45],
    payments: [anisaInvoice, rinaInvoice, dummyInvoice45, dummyInvoiceSettled12, dummyInvoiceExpired14],
    auditLogs: [
      {
        id: 'aud-init-001',
        userId: 'usr-admin-01',
        action: 'INIT_SYSTEM',
        entityType: 'SYSTEM',
        entityId: 'sys',
        ipAddress: '127.0.0.1',
        userAgent: 'Internal System/1.0',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],
    isInitialized: true,
  };
}

// Dapatkan instance global
function getDb(): DatabaseState {
  if (!global.__kosOmiDbState) {
    global.__kosOmiDbState = initializeState();
  }
  return global.__kosOmiDbState;
}

// ==========================================
// ROOMS REPOSITORY
// ==========================================

export async function dbGetRooms(filter?: RoomFilterOptions): Promise<Room[]> {
  const db = getDb();
  let result = [...db.rooms];

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
      result.sort((a, b) => a.floor - b.floor || a.code.localeCompare(b.code));
    } else {
      result.sort((a, b) => a.code.localeCompare(b.code));
    }
  }

  return result;
}

export async function dbGetRoomByCode(codeOrId: string): Promise<Room | null> {
  const db = getDb();
  const normalized = codeOrId.toUpperCase().trim();
  const room = db.rooms.find((r) => r.code === normalized || r.id === codeOrId);
  return room ? { ...room } : null;
}

export async function dbUpdateRoomStatus(codeOrId: string, status: RoomStatus): Promise<boolean> {
  const db = getDb();
  const normalized = codeOrId.toUpperCase().trim();
  const index = db.rooms.findIndex((r) => r.code === normalized || r.id === codeOrId);
  if (index === -1) return false;
  db.rooms[index].status = status;
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
  const db = getDb();
  const normalized = codeOrId.toUpperCase().trim();
  const index = db.rooms.findIndex((r) => r.code === normalized || r.id === codeOrId);
  if (index === -1) return null;

  db.rooms[index] = {
    ...db.rooms[index],
    ...data,
  };
  return { ...db.rooms[index] };
}

export async function dbGetRoomTenantHistory(code: string): Promise<any[]> {
  const normalized = code.toUpperCase().trim();
  const db = getDb();
  const room = db.rooms.find((r) => r.code === normalized);

  if (!room) return [];

  // Data riwayat penghuni realistis sesuai status kamar saat ini
  const histories: any[] = [];

  if (room.status === 'TERISI') {
    histories.push({
      id: `ten-act-${normalized}`,
      roomCode: normalized,
      tenantName: normalized === 'A-101' ? 'Rina Kusuma' : 'Dimas Prasetyo',
      tenantPhone: normalized === 'A-101' ? '081211112222' : '081388889999',
      tenantEmail: normalized === 'A-101' ? 'rina@example.com' : 'dimas@example.com',
      startDate: '2026-09-01',
      endDate: '2027-08-31',
      status: 'AKTIF',
      monthlyRent: room.monthlyPrice,
      depositStatus: 'DITAHAN',
      notes: 'Penghuni aktif, pembayaran tagihan sewa bulanan selalu tepat waktu sebelum tgl 5.',
    });
    histories.push({
      id: `ten-prev-${normalized}`,
      roomCode: normalized,
      tenantName: 'Fajar Nugraha',
      tenantPhone: '081277665544',
      tenantEmail: 'fajar.nugraha@alumni.uinib.ac.id',
      startDate: '2025-08-01',
      endDate: '2026-08-01',
      status: 'SELESAI',
      monthlyRent: room.monthlyPrice,
      depositStatus: 'DIKEMBALIKAN',
      notes: 'Selesai masa studi magister UIN Imam Bonjol Padang, check-out dalam kondisi kamar bersih tanpa kerusakan.',
    });
  } else if (room.status === 'DIPESAN') {
    histories.push({
      id: `ten-rsv-${normalized}`,
      roomCode: normalized,
      tenantName: 'Anisa Permata',
      tenantPhone: '081298765432',
      tenantEmail: 'anisa@example.com',
      startDate: '2026-11-01',
      endDate: '2027-04-30',
      status: 'RESERVASI',
      monthlyRent: room.monthlyPrice,
      depositStatus: 'MENUNGGU_PEMERIKSAAN',
      notes: 'Reservasi disetujui, sedang menunggu penyelesaian pembayaran invoice via Midtrans Snap.',
    });
  } else {
    histories.push({
      id: `ten-past-${normalized}`,
      roomCode: normalized,
      tenantName: 'Budi Darmawan',
      tenantPhone: '081233445566',
      tenantEmail: 'budi.darmawan@gmail.com',
      startDate: '2025-10-01',
      endDate: '2026-09-30',
      status: 'SELESAI',
      monthlyRent: room.monthlyPrice,
      depositStatus: 'DIKEMBALIKAN',
      notes: 'Pindah tugas ke Jakarta, deposit telah dikembalikan penuh 100%.',
    });
  }

  return histories;
}

export async function dbGetRoomStats() {
  const db = getDb();
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
  const db = getDb();
  return db.reservations.map((res) => {
    const room = db.rooms.find((r) => r.code === res.roomCode);
    const payment = db.payments.find((p) => p.reservationCode === res.code);
    return { ...res, room, payment };
  });
}

export async function dbGetReservationByCode(code: string): Promise<Reservation | null> {
  const db = getDb();
  const normalized = code.toUpperCase().trim();
  const res = db.reservations.find((r) => r.code === normalized);
  if (!res) return null;

  const room = db.rooms.find((r) => r.code === res.roomCode);
  const payment = db.payments.find((p) => p.reservationCode === res.code);
  return { ...res, room, payment };
}

export async function dbGetReservationsByUserEmail(email: string): Promise<Reservation[]> {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const matched = db.reservations.filter((r) => r.userEmail.toLowerCase() === normalized);

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

  if (room.status !== 'TERSEDIA') {
    throw new Error(`Kamar ${input.roomCode} saat ini sedang ${room.status} dan tidak dapat diajukan reservasi`);
  }

  // Buat kode reservasi unik: RSV-YYYYMM-KODE
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const cleanCode = room.code.replace('-', '');
  const countSameRoom = db.reservations.filter((r) => r.roomCode === room.code).length + 1;
  const reservationCode = `RSV-${dateStr}-${cleanCode}${countSameRoom > 1 ? `-${countSameRoom}` : ''}`;

  const monthlyPrice = room.monthlyPrice;
  const depositAmount = room.depositAmount;
  const totalInitialPayment = monthlyPrice + depositAmount;

  const newReservation: Reservation = {
    id: `rsv-${Date.now()}`,
    code: reservationCode,
    roomId: room.id,
    roomCode: room.code,
    userId: `usr-${Date.now()}`,
    userName: input.fullName,
    userEmail: input.email.toLowerCase().trim(),
    userPhone: input.phone.trim(),
    userNik: input.nik.trim(),
    userOccupation: (input.occupation ?? '').trim(),
    emergencyContactName: (input.emergencyName ?? '').trim(),
    emergencyContactPhone: (input.emergencyPhone ?? '').trim(),
    emergencyContactRelation: (input.emergencyRelation ?? '').trim(),
    ktpUrl: input.ktpUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
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

  return { ...newReservation, room };
}

export async function dbApproveReservation(reservationCode: string, adminNotes?: string): Promise<Reservation | null> {
  const db = getDb();
  const res = await dbGetReservationByCode(reservationCode);
  if (!res) return null;

  const index = db.reservations.findIndex((r) => r.code === res.code);
  if (index === -1) return null;

  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 jam batas bayar

  db.reservations[index].status = 'APPROVED';
  db.reservations[index].expiresAt = expiresAt;
  db.reservations[index].adminNotes = adminNotes || 'Reservasi telah disetujui. Silakan selesaikan pembayaran invoice.';
  db.reservations[index].updatedAt = new Date().toISOString();

  // Kunci status kamar menjadi DIPESAN
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
  }

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

  db.reservations[index].status = 'REJECTED';
  db.reservations[index].rejectionReason = rejectionReason;
  db.reservations[index].updatedAt = new Date().toISOString();

  // Pastikan status kamar tetap atau kembali TERSEDIA jika sebelumnya dikunci
  const room = await dbGetRoomByCode(res.roomCode);
  if (room && room.status === 'DIPESAN') {
    await dbUpdateRoomStatus(res.roomCode, 'TERSEDIA');
  }

  return await dbGetReservationByCode(reservationCode);
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
    if (global.__kosOmiTransactions) {
      const existingTx = global.__kosOmiTransactions.find(
        (tx) => tx.invoiceNumber === payment.invoiceCode || tx.orderId === payment.invoiceCode
      );
      if (existingTx) {
        existingTx.transactionStatus = 'settlement';
        existingTx.settlementTime = payment.paidAt;
      } else {
        const resObj = await dbGetReservationByCode(payment.reservationCode);
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
    }
  } catch (txErr) {
    console.warn('Gagal sinkronisasi transaksi keuangan:', txErr);
  }

  const updatedReservation = await dbGetReservationByCode(payment.reservationCode);

  return {
    success: true,
    message: 'Pembayaran berhasil diverifikasi secara resmi di server',
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
  const newLog: ServerAuditLog = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    ...log,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  return newLog;
}

/**
 * Mengambil catatan audit log sistem
 */
export async function dbGetAuditLogs(limit: number = 50): Promise<ServerAuditLog[]> {
  const db = getDb();
  return db.auditLogs.slice(0, limit);
}

