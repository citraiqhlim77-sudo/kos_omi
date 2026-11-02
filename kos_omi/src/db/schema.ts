import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  text,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =================================================================
// 1. ENUMERASI (Sesuai Bab 10 Dokumen PRD Kos Omi)
// =================================================================

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'PENGELOLA',
  'KEUANGAN',
  'CALON_PENGHUNI',
  'PENGHUNI',
]);

export const roomStatusEnum = pgEnum('room_status', [
  'TERSEDIA',
  'DIPESAN',
  'TERISI',
  'NONAKTIF',
]);

export const roomTypeEnum = pgEnum('room_type', [
  'STANDAR_NON_AC',
  'STANDAR_AC',
  'DELUXE_AC',
]);

export const reservationStatusEnum = pgEnum('reservation_status', [
  'MENUNGGU_VERIFIKASI',
  'DITOLAK',
  'MENUNGGU_PEMBAYARAN',
  'LUNAS',
  'CHECKIN',
  'KEDALUWARSA',
  'DIBATALKAN',
]);

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'BOOKING',
  'DEPOSIT',
  'SEWA_BULANAN',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'BELUM_BAYAR',
  'MENUNGGU_PEMBAYARAN',
  'LUNAS',
  'TERLAMBAT',
  'KEDALUWARSA',
  'DIBATALKAN',
]);

export const tenancyStatusEnum = pgEnum('tenancy_status', [
  'AKTIF',
  'SELESAI',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'WHATSAPP',
  'EMAIL',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'PENDING',
  'SENT',
  'FAILED',
]);

// =================================================================
// 2. TABEL UTAMA (Sesuai Bab 10 Dokumen PRD Kos Omi)
// =================================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 180 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(), // format 62xxxxxxxxxx
    role: userRoleEnum('role').notNull().default('CALON_PENGHUNI'),
    isActive: boolean('is_active').notNull().default(true),
    whatsappNotifEnabled: boolean('whatsapp_notif_enabled').notNull().default(true),
    failedLoginCount: integer('failed_login_count').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_email_unique').on(t.email),
    index('users_role_idx').on(t.role),
  ]
);

export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull(), // contoh: A-101
    floor: integer('floor').notNull(),
    type: roomTypeEnum('type').notNull().default('STANDAR_NON_AC'),
    status: roomStatusEnum('status').notNull().default('TERSEDIA'),
    areaSqm: integer('area_sqm').notNull().default(12),
    monthlyPrice: integer('monthly_price').notNull(), // Rupiah, tanpa desimal
    depositAmount: integer('deposit_amount').notNull(),
    facilities: jsonb('facilities').$type<string[]>().notNull().default([]),
    description: text('description'),
    photoUrls: jsonb('photo_urls').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('rooms_code_unique').on(t.code),
    index('rooms_status_idx').on(t.status),
    index('rooms_floor_idx').on(t.floor),
  ]
);

export const reservations = pgTable(
  'reservations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 20 }).notNull(), // contoh: RSV-250601-0007
    userId: uuid('user_id').notNull().references(() => users.id),
    roomId: uuid('room_id').notNull().references(() => rooms.id),
    startDate: date('start_date').notNull(),
    durationMonths: integer('duration_months').notNull(), // 1, 3, 6, 12
    status: reservationStatusEnum('status').notNull().default('MENUNGGU_VERIFIKASI'),
    idCardUrl: varchar('id_card_url', { length: 500 }).notNull(), // path privat
    notes: text('notes'),
    verifiedBy: uuid('verified_by').references(() => users.id),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    rejectReason: text('reject_reason'),
    paymentDeadline: timestamp('payment_deadline', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('reservations_code_unique').on(t.code),
    index('reservations_status_idx').on(t.status),
    index('reservations_user_idx').on(t.userId),
    index('reservations_room_idx').on(t.roomId),
  ]
);

export const tenancies = pgTable(
  'tenancies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id),
    roomId: uuid('room_id').notNull().references(() => rooms.id),
    reservationId: uuid('reservation_id').references(() => reservations.id),
    checkInDate: date('check_in_date').notNull(),
    checkOutDate: date('check_out_date'),
    contractEndDate: date('contract_end_date').notNull(),
    monthlyPrice: integer('monthly_price').notNull(), // snapshot harga saat check-in
    dueDay: integer('due_day').notNull().default(5),
    depositRefunded: boolean('deposit_refunded').notNull().default(false),
    status: tenancyStatusEnum('status').notNull().default('AKTIF'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tenancies_room_status_idx').on(t.roomId, t.status),
    index('tenancies_user_idx').on(t.userId),
  ]
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceNumber: varchar('invoice_number', { length: 25 }).notNull(), // INV-202506-00045
    userId: uuid('user_id').notNull().references(() => users.id),
    reservationId: uuid('reservation_id').references(() => reservations.id),
    tenancyId: uuid('tenancy_id').references(() => tenancies.id),
    type: invoiceTypeEnum('type').notNull(),
    periodMonth: varchar('period_month', { length: 7 }), // 2025-06, null untuk BOOKING/DEPOSIT
    amount: integer('amount').notNull(),
    dueDate: date('due_date').notNull(),
    status: invoiceStatusEnum('status').notNull().default('BELUM_BAYAR'),
    midtransOrderId: varchar('midtrans_order_id', { length: 50 }), // KOS-202506-00045
    snapToken: varchar('snap_token', { length: 120 }),
    snapRedirectUrl: varchar('snap_redirect_url', { length: 500 }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('invoices_number_unique').on(t.invoiceNumber),
    uniqueIndex('invoices_order_id_unique').on(t.midtransOrderId),
    uniqueIndex('invoices_tenancy_period_unique').on(t.tenancyId, t.periodMonth),
    index('invoices_status_idx').on(t.status),
    index('invoices_due_date_idx').on(t.dueDate),
    index('invoices_user_idx').on(t.userId),
  ]
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    midtransOrderId: varchar('midtrans_order_id', { length: 50 }).notNull(),
    midtransTransactionId: varchar('midtrans_transaction_id', { length: 80 }),
    paymentType: varchar('payment_type', { length: 40 }), // qris, bank_transfer, gopay, shopeepay
    bank: varchar('bank', { length: 20 }), // bca, bni, bri, permata, mandiri
    grossAmount: integer('gross_amount').notNull(),
    transactionStatus: varchar('transaction_status', { length: 30 }).notNull(), // pending, settlement, capture, expire, cancel, deny
    fraudStatus: varchar('fraud_status', { length: 30 }),
    signatureKey: varchar('signature_key', { length: 128 }),
    settlementTime: timestamp('settlement_time', { withTimezone: true }),
    rawPayload: jsonb('raw_payload').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('payments_transaction_unique').on(t.midtransTransactionId),
    index('payments_status_idx').on(t.transactionStatus),
    index('payments_invoice_idx').on(t.invoiceId),
    index('payments_order_idx').on(t.midtransOrderId),
    index('payments_settlement_idx').on(t.settlementTime),
  ]
);

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id),
    channel: notificationChannelEnum('channel').notNull(),
    template: varchar('template', { length: 60 }).notNull(), // reservasi_disetujui, pengingat_tagihan, dst.
    recipient: varchar('recipient', { length: 180 }).notNull(),
    status: notificationStatusEnum('status').notNull().default('PENDING'),
    attempts: integer('attempts').notNull().default(0),
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notif_status_idx').on(t.status)]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id').references(() => users.id),
    action: varchar('action', { length: 80 }).notNull(), // ROOM_STATUS_UPDATED, RESERVATION_APPROVED, dst.
    entity: varchar('entity', { length: 40 }).notNull(),
    entityId: varchar('entity_id', { length: 64 }).notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_entity_idx').on(t.entity, t.entityId)]
);

export const settings = pgTable('settings', {
  key: varchar('key', { length: 60 }).primaryKey(), // contoh: due_day_default, deposit_percent
  value: varchar('value', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// =================================================================
// 3. RELASI ANTAR TABEL (Drizzle Relations)
// =================================================================

export const usersRelations = relations(users, ({ many }) => ({
  reservations: many(reservations),
  tenancies: many(tenancies),
  invoices: many(invoices),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
  tenancies: many(tenancies),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  room: one(rooms, { fields: [reservations.roomId], references: [rooms.id] }),
  invoices: many(invoices),
}));

export const tenanciesRelations = relations(tenancies, ({ one, many }) => ({
  user: one(users, { fields: [tenancies.userId], references: [users.id] }),
  room: one(rooms, { fields: [tenancies.roomId], references: [rooms.id] }),
  reservation: one(reservations, { fields: [tenancies.reservationId], references: [reservations.id] }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  reservation: one(reservations, { fields: [invoices.reservationId], references: [reservations.id] }),
  tenancy: one(tenancies, { fields: [invoices.tenancyId], references: [tenancies.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));
