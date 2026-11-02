-- =================================================================
-- MIGRATION: 0000_init_kos_omi_schema.sql
-- Neon PostgreSQL DDL Schema untuk Sistem Manajemen Kos Omi
-- Sesuai Bab 10 Dokumen PRD Kos Omi
-- =================================================================

-- 1. ENUMERASI
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'PENGELOLA', 'KEUANGAN', 'CALON_PENGHUNI', 'PENGHUNI');
CREATE TYPE "room_status" AS ENUM ('TERSEDIA', 'DIPESAN', 'TERISI', 'NONAKTIF');
CREATE TYPE "room_type" AS ENUM ('STANDAR_NON_AC', 'STANDAR_AC', 'DELUXE_AC');
CREATE TYPE "reservation_status" AS ENUM ('MENUNGGU_VERIFIKASI', 'DITOLAK', 'MENUNGGU_PEMBAYARAN', 'LUNAS', 'CHECKIN', 'KEDALUWARSA', 'DIBATALKAN');
CREATE TYPE "invoice_type" AS ENUM ('BOOKING', 'DEPOSIT', 'SEWA_BULANAN');
CREATE TYPE "invoice_status" AS ENUM ('BELUM_BAYAR', 'MENUNGGU_PEMBAYARAN', 'LUNAS', 'TERLAMBAT', 'KEDALUWARSA', 'DIBATALKAN');
CREATE TYPE "tenancy_status" AS ENUM ('AKTIF', 'SELESAI');
CREATE TYPE "notification_channel" AS ENUM ('WHATSAPP', 'EMAIL');
CREATE TYPE "notification_status" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- 2. TABEL USERS
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'CALON_PENGHUNI',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_notif_enabled" BOOLEAN NOT NULL DEFAULT true,
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");

-- 3. TABEL ROOMS (67 Kamar)
CREATE TABLE IF NOT EXISTS "rooms" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(10) NOT NULL,
    "floor" INTEGER NOT NULL,
    "type" "room_type" NOT NULL DEFAULT 'STANDAR_NON_AC',
    "status" "room_status" NOT NULL DEFAULT 'TERSEDIA',
    "area_sqm" INTEGER NOT NULL DEFAULT 12,
    "monthly_price" INTEGER NOT NULL,
    "deposit_amount" INTEGER NOT NULL,
    "facilities" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "description" TEXT,
    "photo_urls" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "rooms_code_unique" ON "rooms" ("code");
CREATE INDEX IF NOT EXISTS "rooms_status_idx" ON "rooms" ("status");
CREATE INDEX IF NOT EXISTS "rooms_floor_idx" ON "rooms" ("floor");

-- 4. TABEL RESERVATIONS
CREATE TABLE IF NOT EXISTS "reservations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "room_id" UUID NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
    "start_date" DATE NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    "id_card_url" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "verified_by" UUID REFERENCES "users"("id"),
    "verified_at" TIMESTAMP WITH TIME ZONE,
    "reject_reason" TEXT,
    "payment_deadline" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "reservations_code_unique" ON "reservations" ("code");
CREATE INDEX IF NOT EXISTS "reservations_status_idx" ON "reservations" ("status");
CREATE INDEX IF NOT EXISTS "reservations_user_idx" ON "reservations" ("user_id");

-- 5. TABEL TENANCIES
CREATE TABLE IF NOT EXISTS "tenancies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "room_id" UUID NOT NULL REFERENCES "rooms"("id") ON DELETE CASCADE,
    "reservation_id" UUID REFERENCES "reservations"("id"),
    "check_in_date" DATE NOT NULL,
    "check_out_date" DATE,
    "contract_end_date" DATE NOT NULL,
    "monthly_price" INTEGER NOT NULL,
    "due_day" INTEGER NOT NULL DEFAULT 5,
    "deposit_refunded" BOOLEAN NOT NULL DEFAULT false,
    "status" "tenancy_status" NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "tenancies_room_status_idx" ON "tenancies" ("room_id", "status");
CREATE INDEX IF NOT EXISTS "tenancies_user_idx" ON "tenancies" ("user_id");

-- 6. TABEL INVOICES
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoice_number" VARCHAR(25) NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "reservation_id" UUID REFERENCES "reservations"("id"),
    "tenancy_id" UUID REFERENCES "tenancies"("id"),
    "type" "invoice_type" NOT NULL,
    "period_month" VARCHAR(7),
    "amount" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'BELUM_BAYAR',
    "midtrans_order_id" VARCHAR(50),
    "snap_token" VARCHAR(120),
    "snap_redirect_url" VARCHAR(500),
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_number_unique" ON "invoices" ("invoice_number");
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_order_id_unique" ON "invoices" ("midtrans_order_id");
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_tenancy_period_unique" ON "invoices" ("tenancy_id", "period_month");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices" ("due_date");
CREATE INDEX IF NOT EXISTS "invoices_user_idx" ON "invoices" ("user_id");

-- 7. TABEL PAYMENTS
CREATE TABLE IF NOT EXISTS "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
    "midtrans_order_id" VARCHAR(50) NOT NULL,
    "midtrans_transaction_id" VARCHAR(80),
    "payment_type" VARCHAR(40),
    "bank" VARCHAR(20),
    "gross_amount" INTEGER NOT NULL,
    "transaction_status" VARCHAR(30) NOT NULL,
    "fraud_status" VARCHAR(30),
    "signature_key" VARCHAR(128),
    "settlement_time" TIMESTAMP WITH TIME ZONE,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS "payments_transaction_unique" ON "payments" ("midtrans_transaction_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments" ("transaction_status");
CREATE INDEX IF NOT EXISTS "payments_invoice_idx" ON "payments" ("invoice_id");

-- 8. TABEL NOTIFICATION_LOGS
CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "channel" "notification_channel" NOT NULL,
    "template" VARCHAR(60) NOT NULL,
    "recipient" VARCHAR(180) NOT NULL,
    "status" "notification_status" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "sent_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "notif_status_idx" ON "notification_logs" ("status");

-- 9. TABEL AUDIT_LOGS
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(80) NOT NULL,
    "entity" VARCHAR(40) NOT NULL,
    "entity_id" VARCHAR(64) NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "audit_entity_idx" ON "audit_logs" ("entity", "entity_id");

-- 10. TABEL SETTINGS
CREATE TABLE IF NOT EXISTS "settings" (
    "key" VARCHAR(60) PRIMARY KEY,
    "value" VARCHAR(255) NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
