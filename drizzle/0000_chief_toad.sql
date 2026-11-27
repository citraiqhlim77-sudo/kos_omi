CREATE TYPE "public"."invoice_type" AS ENUM('BOOKING', 'DEPOSIT', 'SEWA_BULANAN');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('WHATSAPP', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."room_status" AS ENUM('TERSEDIA', 'DIPESAN', 'TERISI', 'NONAKTIF');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('STANDAR_NON_AC', 'STANDAR_AC', 'DELUXE_AC');--> statement-breakpoint
CREATE TYPE "public"."tenancy_status" AS ENUM('AKTIF', 'SELESAI');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'PENGELOLA', 'KEUANGAN', 'CALON_PENGHUNI', 'PENGHUNI');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"actor_id" varchar(80),
	"actor_name" varchar(160),
	"actor_role" varchar(40),
	"action" varchar(80) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(80) NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"user_id" varchar(80) NOT NULL,
	"reservation_id" varchar(80),
	"reservation_code" varchar(40),
	"tenancy_id" varchar(80),
	"room_code" varchar(16) NOT NULL,
	"tenant_name" varchar(160),
	"tenant_email" varchar(180),
	"tenant_phone" varchar(40),
	"type" "invoice_type" NOT NULL,
	"period_month" varchar(80),
	"period_key" varchar(16),
	"amount" integer NOT NULL,
	"due_date" varchar(40) NOT NULL,
	"status" varchar(40) DEFAULT 'UNPAID' NOT NULL,
	"payment_method" varchar(60),
	"midtrans_order_id" varchar(80),
	"snap_token" varchar(160),
	"snap_redirect_url" text,
	"notes" text,
	"paid_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"user_id" varchar(80),
	"recipient_name" varchar(160),
	"channel" "notification_channel" NOT NULL,
	"template" varchar(160) NOT NULL,
	"recipient" varchar(180) NOT NULL,
	"status" "notification_status" DEFAULT 'SENT' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"invoice_id" varchar(80) NOT NULL,
	"invoice_number" varchar(50),
	"midtrans_order_id" varchar(80) NOT NULL,
	"midtrans_transaction_id" varchar(100),
	"user_name" varchar(160),
	"user_email" varchar(180),
	"user_phone" varchar(40),
	"room_code" varchar(16),
	"category" varchar(40),
	"payment_type" varchar(40),
	"bank" varchar(30),
	"gross_amount" integer NOT NULL,
	"transaction_status" varchar(40) NOT NULL,
	"fraud_status" varchar(30),
	"signature_key" varchar(128),
	"settlement_time" timestamp with time zone,
	"raw_payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"code" varchar(40) NOT NULL,
	"user_id" varchar(80) NOT NULL,
	"room_id" varchar(80) NOT NULL,
	"room_code" varchar(16) NOT NULL,
	"user_name" varchar(160) NOT NULL,
	"user_email" varchar(180) NOT NULL,
	"user_phone" varchar(40) NOT NULL,
	"user_nik" varchar(40) NOT NULL,
	"user_occupation" text,
	"emergency_contact_name" varchar(160),
	"emergency_contact_phone" varchar(40),
	"emergency_contact_relation" varchar(80),
	"start_date" varchar(20) NOT NULL,
	"duration_months" integer DEFAULT 6 NOT NULL,
	"monthly_price" integer DEFAULT 5000000 NOT NULL,
	"deposit_amount" integer DEFAULT 0 NOT NULL,
	"total_initial_payment" integer DEFAULT 5000000 NOT NULL,
	"status" varchar(40) DEFAULT 'PENDING_REVIEW' NOT NULL,
	"id_card_url" text NOT NULL,
	"notes" text,
	"verified_by" varchar(80),
	"verified_at" timestamp with time zone,
	"reject_reason" text,
	"payment_deadline" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"floor" integer NOT NULL,
	"type" "room_type" DEFAULT 'STANDAR_NON_AC' NOT NULL,
	"status" "room_status" DEFAULT 'TERSEDIA' NOT NULL,
	"area_sqm" integer DEFAULT 12 NOT NULL,
	"monthly_price" integer NOT NULL,
	"deposit_amount" integer DEFAULT 0 NOT NULL,
	"facilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"photo_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenancies" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"user_id" varchar(80) NOT NULL,
	"room_id" varchar(80) NOT NULL,
	"room_code" varchar(16) NOT NULL,
	"reservation_id" varchar(80),
	"user_name" varchar(160) NOT NULL,
	"user_email" varchar(180) NOT NULL,
	"user_phone" varchar(40) NOT NULL,
	"user_nik" varchar(40),
	"id_card_url" text,
	"check_in_date" varchar(20) NOT NULL,
	"check_out_date" varchar(20),
	"contract_end_date" varchar(20) NOT NULL,
	"monthly_price" integer NOT NULL,
	"deposit_amount" integer DEFAULT 0 NOT NULL,
	"due_day" integer DEFAULT 5 NOT NULL,
	"deposit_refunded" boolean DEFAULT false NOT NULL,
	"status" "tenancy_status" DEFAULT 'AKTIF' NOT NULL,
	"emergency_contact" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(80) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"nim" varchar(80),
	"email" varchar(180) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"plain_password" varchar(255),
	"phone" varchar(40) NOT NULL,
	"role" "user_role" DEFAULT 'CALON_PENGHUNI' NOT NULL,
	"room_code" varchar(16),
	"is_active" boolean DEFAULT true NOT NULL,
	"whatsapp_notif_enabled" boolean DEFAULT true NOT NULL,
	"failed_login_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenancy_id_tenancies_id_fk" FOREIGN KEY ("tenancy_id") REFERENCES "public"."tenancies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_unique" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_user_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notif_status_idx" ON "notification_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("transaction_status");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("midtrans_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_code_unique" ON "reservations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reservations_user_idx" ON "reservations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reservations_room_idx" ON "reservations" USING btree ("room_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rooms_code_unique" ON "rooms" USING btree ("code");--> statement-breakpoint
CREATE INDEX "rooms_status_idx" ON "rooms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rooms_floor_idx" ON "rooms" USING btree ("floor");--> statement-breakpoint
CREATE INDEX "tenancies_room_status_idx" ON "tenancies" USING btree ("room_id","status");--> statement-breakpoint
CREATE INDEX "tenancies_user_idx" ON "tenancies" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");