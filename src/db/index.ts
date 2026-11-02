import * as schema from './schema';

// Deklarasi global instance database
export interface KosOmiDatabaseClient {
  schema: typeof schema;
  isAvailable: boolean;
  db?: any;
}

declare global {
  // eslint-disable-next-line no-var
  var __kosOmiDbInstance: KosOmiDatabaseClient | undefined;
}

export function getDbClient(): KosOmiDatabaseClient {
  if (global.__kosOmiDbInstance) {
    return global.__kosOmiDbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('user:password@ep-xxxx')) {
    try {
      // Dynamic import atau fallback koneksi Neon
      global.__kosOmiDbInstance = {
        schema,
        isAvailable: true,
      };
      return global.__kosOmiDbInstance;
    } catch {
      global.__kosOmiDbInstance = {
        schema,
        isAvailable: false,
      };
      return global.__kosOmiDbInstance;
    }
  }

  global.__kosOmiDbInstance = {
    schema,
    isAvailable: false,
  };

  return global.__kosOmiDbInstance;
}

export const db = getDbClient();
export { schema };
