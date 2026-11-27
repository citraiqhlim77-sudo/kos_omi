/**
 * Layanan Rate Limiting Upstash Redis (PRD Bab 8 & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. REST API Client ke Upstash Redis (https://xxxx.upstash.io)
 * 2. Sliding window / fixed window counter menggunakan perintah INCR dan EXPIRE
 * 3. Fallback transparan ke in-memory sliding window cache jika kredensial Upstash belum disetel
 * 4. Pembatasan akses untuk:
 *    - login: maksimal 5 percobaan per 15 menit per identifier (IP / Email)
 *    - register: maksimal 5 percobaan per 10 menit per IP
 *    - forgot_password: maksimal 3 percobaan per 15 menit per identifier
 *    - payment_transaction: maksimal 10 transaksi per 1 menit per identifier
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  error?: string;
  isFallback?: boolean;
}

export type RateLimitAction = 'login' | 'register' | 'forgot_password' | 'payment_transaction';

const RATE_LIMIT_CONFIGS: Record<RateLimitAction, { maxRequests: number; windowSeconds: number }> = {
  login: { maxRequests: 5, windowSeconds: 15 * 60 }, // 5 request per 15 menit
  register: { maxRequests: 5, windowSeconds: 10 * 60 }, // 5 request per 10 menit
  forgot_password: { maxRequests: 3, windowSeconds: 15 * 60 }, // 3 request per 15 menit
  payment_transaction: { maxRequests: 10, windowSeconds: 60 }, // 10 request per 1 menit
};

// In-Memory Fallback Cache untuk pengujian lokal tanpa koneksi Upstash
interface InMemoryRecord {
  count: number;
  expiresAt: number;
}
const inMemoryRateLimits = new Map<string, InMemoryRecord>();

/**
 * Fallback In-Memory Rate Limiter
 */
function checkInMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const existing = inMemoryRateLimits.get(key);

  if (!existing || now > existing.expiresAt) {
    inMemoryRateLimits.set(key, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
      isFallback: true,
    };
  }

  if (existing.count >= maxRequests) {
    const remainingSeconds = Math.ceil((existing.expiresAt - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: remainingSeconds,
      error: `Batas percobaan tercapai. Silakan coba kembali dalam ${remainingSeconds} detik.`,
      isFallback: true,
    };
  }

  existing.count += 1;
  const remainingSeconds = Math.ceil((existing.expiresAt - now) / 1000);
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetSeconds: remainingSeconds,
    isFallback: true,
  };
}

/**
 * Pemeriksaan Rate Limit dengan Upstash Redis REST API
 */
export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];
  const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  const redisKey = `kosomi:ratelimit:${action}:${cleanId}`;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Jika Upstash belum dikonfigurasi atau placeholder, gunakan fallback in-memory
  if (
    !redisUrl ||
    !redisToken ||
    redisUrl.includes('xxxx.upstash.io') ||
    redisToken === 'isi_token_upstash'
  ) {
    return checkInMemoryRateLimit(redisKey, config.maxRequests, config.windowSeconds);
  }

  try {
    // Pipeline perintah Redis: INCR dan TTL/EXPIRE
    // Upstash REST API /pipeline mendukung multiple commands
    const pipelineUrl = `${redisUrl.replace(/\/$/, '')}/pipeline`;
    const response = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['TTL', redisKey],
      ]),
    });

    if (!response.ok) {
      console.warn('[Upstash Redis] HTTP Error:', response.status, response.statusText);
      return checkInMemoryRateLimit(redisKey, config.maxRequests, config.windowSeconds);
    }

    const data = await response.json();
    // data format: [{ result: 1 }, { result: -1 }]
    const currentCount = Number(data[0]?.result || 1);
    const currentTtl = Number(data[1]?.result || -1);

    // Jika key baru dibuat (TTL = -1 atau count = 1), set waktu kedaluwarsa
    if (currentCount === 1 || currentTtl === -1) {
      await fetch(`${redisUrl.replace(/\/$/, '')}/expire/${redisKey}/${config.windowSeconds}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${redisToken}` },
      }).catch(() => null);
    }

    const resetSeconds = currentTtl > 0 ? currentTtl : config.windowSeconds;

    if (currentCount > config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetSeconds,
        error: `Batas percobaan tercapai. Silakan coba kembali dalam ${resetSeconds} detik.`,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - currentCount),
      resetSeconds,
    };
  } catch (err: any) {
    console.warn('[Upstash Redis] Network failure, using fallback limiter:', err?.message);
    return checkInMemoryRateLimit(redisKey, config.maxRequests, config.windowSeconds);
  }
}
