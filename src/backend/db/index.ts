import { neon } from '@neondatabase/serverless';
import { drizzle,type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type NeonDrizzleDb = NeonHttpDatabase<typeof schema>;

export interface KosOmiDatabaseClient {
  schema: typeof schema;
  isAvailable: boolean;
  db?: NeonDrizzleDb;
}

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiDbInstance: KosOmiDatabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __kosOmiDbUrlCached: string | undefined;
}

export function isDatabaseUrlConfigured(url?: string): url is string {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://')) {
    return false;
  }
  if (
    trimmed.includes('user:password@ep-xxxx') ||
    trimmed.includes('YOUR_PRODUCTION_DB_PASSWORD') ||
    trimmed.includes('[password]')
  ) {
    return false;
  }
  return true;
}

export function getDbClient(): KosOmiDatabaseClient {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (global.__kosOmiDbInstance && global.__kosOmiDbUrlCached === databaseUrl) {
    return global.__kosOmiDbInstance;
  }

  if (isDatabaseUrlConfigured(databaseUrl)) {
    try {
      const sqlClient = neon(databaseUrl);
      const neonDb = drizzle(sqlClient, { schema });
      global.__kosOmiDbInstance = {
        schema,
        isAvailable: true,
        db: neonDb,
      };
      global.__kosOmiDbUrlCached = databaseUrl;
      return global.__kosOmiDbInstance;
    } catch (err) {
      console.error('[NeonDB] Gagal menginisialisasi koneksi Neon PostgreSQL:', err);
    }
  }

  global.__kosOmiDbInstance = {
    schema,
    isAvailable: false,
    db: undefined,
  };
  global.__kosOmiDbUrlCached = databaseUrl;
  return global.__kosOmiDbInstance;
}

export function getNeonDb(): NeonDrizzleDb | null {
  const client = getDbClient();
  return client.isAvailable && client.db ? client.db : null;
}

export const db = getDbClient();
export { schema };
