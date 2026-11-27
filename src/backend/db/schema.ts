import {
  pgTable,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  jsonb,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =================================================================
// 1. ENUMERASI RESMI KOS OMI (5 ROLE & SIKLUS HUNIAN)
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

export const invoiceTypeEnum = pgEnum('invoice_type', [
  'BOOKING',
  'DEPOSIT',
  'SEWA_BULANAN',
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
// 2. TABEL UTAMA POSTGRESQL (NEON SERVERLESS + DRIZZLE ORM)
// =================================================================

export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    nim: varchar('nim', { length: 80 }),
    email: varchar('email', { length: 180 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 40 }).notNull(),
    role: userRoleEnum('role').notNull().default('CALON_PENGHUNI'),
    roomCode: varchar('room_code', { length: 16 }),
    isActive: boolean('is_active').notNull().default(true),
    whatsappNotifEnabled: boolean('whatsapp_notif_enabled').notNull().default(true),
    failedLoginCount: integer('failed_login_count').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
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
    id: varchar('id', { length: 80 }).primaryKey(),
    code: varchar('code', { length: 16 }).notNull(),
    floor: integer('floor').notNull(),
    type: roomTypeEnum('type').notNull().default('STANDAR_NON_AC'),
    status: roomStatusEnum('status').notNull().default('TERSEDIA'),
    areaSqm: integer('area_sqm').notNull().default(12),
    monthlyPrice: integer('monthly_price').notNull(),
    depositAmount: integer('deposit_amount').notNull().default(0),
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
    id: varchar('id', { length: 80 }).primaryKey(),
    code: varchar('code', { length: 40 }).notNull(),
    userId: varchar('user_id', { length: 80 }).notNull().references(() => users.id),
    roomId: varchar('room_id', { length: 80 }).notNull().references(() => rooms.id),
    roomCode: varchar('room_code', { length: 16 }).notNull(),
    userName: varchar('user_name', { length: 160 }).notNull(),
    userEmail: varchar('user_email', { length: 180 }).notNull(),
    userPhone: varchar('user_phone', { length: 40 }).notNull(),
    userNik: varchar('user_nik', { length: 40 }).notNull(),
    userOccupation: text('user_occupation'),
    emergencyContactName: varchar('emergency_contact_name', { length: 160 }),
    emergencyContactPhone: varchar('emergency_contact_phone', { length: 40 }),
    emergencyContactRelation: varchar('emergency_contact_relation', { length: 80 }),
    startDate: varchar('start_date', { length: 20 }).notNull(),
    durationMonths: integer('duration_months').notNull().default(6),
    monthlyPrice: integer('monthly_price').notNull().default(5000000),
    depositAmount: integer('deposit_amount').notNull().default(0),
    totalInitialPayment: integer('total_initial_payment').notNull().default(5000000),
    status: varchar('status', { length: 40 }).notNull().default('PENDING_REVIEW'),
    idCardUrl: text('id_card_url').notNull(),
    notes: text('notes'),
    verifiedBy: varchar('verified_by', { length: 80 }).references(() => users.id),
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
    id: varchar('id', { length: 80 }).primaryKey(),
    userId: varchar('user_id', { length: 80 }).notNull().references(() => users.id),
    roomId: varchar('room_id', { length: 80 }).notNull().references(() => rooms.id),
    roomCode: varchar('room_code', { length: 16 }).notNull(),
    reservationId: varchar('reservation_id', { length: 80 }).references(() => reservations.id),
    userName: varchar('user_name', { length: 160 }).notNull(),
    userEmail: varchar('user_email', { length: 180 }).notNull(),
    userPhone: varchar('user_phone', { length: 40 }).notNull(),
    userNik: varchar('user_nik', { length: 40 }),
    idCardUrl: text('id_card_url'),
    checkInDate: varchar('check_in_date', { length: 20 }).notNull(),
    checkOutDate: varchar('check_out_date', { length: 20 }),
    contractEndDate: varchar('contract_end_date', { length: 20 }).notNull(),
    monthlyPrice: integer('monthly_price').notNull(),
    depositAmount: integer('deposit_amount').notNull().default(0),
    dueDay: integer('due_day').notNull().default(5),
    depositRefunded: boolean('deposit_refunded').notNull().default(false),
    status: tenancyStatusEnum('status').notNull().default('AKTIF'),
    emergencyContact: jsonb('emergency_contact').$type<{
      name: string;
      relation: string;
      phone: string;
    }>(),
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
    id: varchar('id', { length: 80 }).primaryKey(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
    userId: varchar('user_id', { length: 80 }).notNull().references(() => users.id),
    reservationId: varchar('reservation_id', { length: 80 }).references(() => reservations.id),
    reservationCode: varchar('reservation_code', { length: 40 }),
    tenancyId: varchar('tenancy_id', { length: 80 }).references(() => tenancies.id),
    roomCode: varchar('room_code', { length: 16 }).notNull(),
    tenantName: varchar('tenant_name', { length: 160 }),
    tenantEmail: varchar('tenant_email', { length: 180 }),
    tenantPhone: varchar('tenant_phone', { length: 40 }),
    type: invoiceTypeEnum('type').notNull(),
    periodMonth: varchar('period_month', { length: 80 }),
    periodKey: varchar('period_key', { length: 16 }),
    amount: integer('amount').notNull(),
    dueDate: varchar('due_date', { length: 40 }).notNull(),
    status: varchar('status', { length: 40 }).notNull().default('UNPAID'),
    paymentMethod: varchar('payment_method', { length: 60 }),
    midtransOrderId: varchar('midtrans_order_id', { length: 80 }),
    snapToken: varchar('snap_token', { length: 160 }),
    snapRedirectUrl: text('snap_redirect_url'),
    notes: text('notes'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('invoices_number_unique').on(t.invoiceNumber),
    index('invoices_status_idx').on(t.status),
    index('invoices_user_idx').on(t.userId),
  ]
);

export const payments = pgTable(
  'payments',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    invoiceId: varchar('invoice_id', { length: 80 }).notNull().references(() => invoices.id),
    invoiceNumber: varchar('invoice_number', { length: 50 }),
    midtransOrderId: varchar('midtrans_order_id', { length: 80 }).notNull(),
    midtransTransactionId: varchar('midtrans_transaction_id', { length: 100 }),
    userName: varchar('user_name', { length: 160 }),
    userEmail: varchar('user_email', { length: 180 }),
    userPhone: varchar('user_phone', { length: 40 }),
    roomCode: varchar('room_code', { length: 16 }),
    category: varchar('category', { length: 40 }),
    paymentType: varchar('payment_type', { length: 40 }),
    bank: varchar('bank', { length: 30 }),
    grossAmount: integer('gross_amount').notNull(),
    transactionStatus: varchar('transaction_status', { length: 40 }).notNull(),
    fraudStatus: varchar('fraud_status', { length: 30 }),
    signatureKey: varchar('signature_key', { length: 128 }),
    settlementTime: timestamp('settlement_time', { withTimezone: true }),
    rawPayload: jsonb('raw_payload').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('payments_status_idx').on(t.transactionStatus),
    index('payments_invoice_idx').on(t.invoiceId),
    index('payments_order_idx').on(t.midtransOrderId),
  ]
);

export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    userId: varchar('user_id', { length: 80 }).references(() => users.id),
    recipientName: varchar('recipient_name', { length: 160 }),
    channel: notificationChannelEnum('channel').notNull(),
    template: varchar('template', { length: 160 }).notNull(),
    recipient: varchar('recipient', { length: 180 }).notNull(),
    status: notificationStatusEnum('status').notNull().default('SENT'),
    attempts: integer('attempts').notNull().default(1),
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notif_status_idx').on(t.status)]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar('id', { length: 80 }).primaryKey(),
    actorId: varchar('actor_id', { length: 80 }).references(() => users.id),
    actorName: varchar('actor_name', { length: 160 }),
    actorRole: varchar('actor_role', { length: 40 }),
    action: varchar('action', { length: 80 }).notNull(),
    entity: varchar('entity', { length: 60 }).notNull(),
    entityId: varchar('entity_id', { length: 80 }).notNull(),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_entity_idx').on(t.entity, t.entityId)]
);

export const settings = pgTable('settings', {
  key: varchar('key', { length: 80 }).primaryKey(),
  value: text('value').notNull(),
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
  reservation: one(reservations, {
    fields: [tenancies.reservationId],
    references: [reservations.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  reservation: one(reservations, {
    fields: [invoices.reservationId],
    references: [reservations.id],
  }),
  tenancy: one(tenancies, { fields: [invoices.tenancyId], references: [tenancies.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));
