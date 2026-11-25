import type { AuditLogRecord, UserRole } from '@/types/admin';
import { db as drizzleDb, schema } from '@/db';

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiAuditLogs: AuditLogRecord[] | undefined;
}

export function getUnifiedAuditLogsStore(): AuditLogRecord[] {
  if (!global.__kosOmiAuditLogs) {
    global.__kosOmiAuditLogs = [];
  }
  return global.__kosOmiAuditLogs;
}

export interface CreateAuditLogInput {
  userId?: string | null;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: string;
  entityId?: string;
  description: string;
  meta?: Record<string, unknown>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Helper terpusat pencatatan Log Aktivitas & Audit di seluruh 5 role Kos Omi.
 * Menyimpan ke store memori terpadu dan ke tabel `audit_logs` PostgreSQL (jika aktif).
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLogRecord> {
  const store = getUnifiedAuditLogsStore();
  const createdAt = new Date().toISOString();
  const metaPayload: Record<string, unknown> = {
    description: input.description,
    ...(input.meta || {}),
  };

  const record: AuditLogRecord = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    actorId: input.userId || 'system',
    actorName: input.actorName,
    actorRole: input.actorRole,
    action: input.action,
    entity: input.category.toLowerCase(),
    entityId: input.entityId || 'sistem',
    meta: metaPayload,
    createdAt,
  };

  store.unshift(record);

  try {
    if (drizzleDb.isAvailable && drizzleDb.db) {
      const safeActorUuid =
        input.userId && UUID_REGEX.test(input.userId) ? input.userId : null;
      await drizzleDb.db.insert(schema.auditLogs).values({
        actorId: safeActorUuid,
        action: input.action,
        entity: input.category.toLowerCase().slice(0, 40),
        entityId: (input.entityId || 'sistem').slice(0, 64),
        meta: {
          actorName: input.actorName,
          actorRole: input.actorRole,
          ...metaPayload,
        },
      });
    }
  } catch (err) {
    console.warn('[AuditLog] Peringatan saat menulis ke PostgreSQL audit_logs:', err);
  }

  return record;
}
