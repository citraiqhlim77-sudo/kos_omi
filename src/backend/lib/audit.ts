import type { AuditLogRecord,UserRole } from '@/types/admin';
import {
ensurePostgresHydrated,
flushPostgresSync,
loadPersistentStore,
savePersistentStore,
} from '@/server/persistence';

export function getUnifiedAuditLogsStore(): AuditLogRecord[] {
  const store = loadPersistentStore();
  return store.auditLogs;
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

/**
 * Helper terpusat pencatatan Log Aktivitas & Audit di seluruh 5 role Kos Omi.
 * Menyimpan langsung ke tabel `audit_logs` di Neon PostgreSQL.
 */
export async function createAuditLog(input: CreateAuditLogInput): Promise<AuditLogRecord> {
  const persistent = await ensurePostgresHydrated();
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

  persistent.auditLogs.unshift(record);
  savePersistentStore(persistent);
  await flushPostgresSync();

  return record;
}
