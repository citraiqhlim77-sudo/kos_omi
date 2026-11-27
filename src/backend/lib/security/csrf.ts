/**
 * Proteksi CSRF (Cross-Site Request Forgery) Kos Omi (PRD Bab 8 & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. Origin / Referer Header Verification (Next.js Server Actions & API Route Protection)
 * 2. CSRF Token Generator & Validator berbasis HMAC-SHA256
 */

import { createHmac, randomBytes } from 'crypto';

const CSRF_SECRET = process.env.AUTH_SECRET || 'kos-omi-csrf-super-secret-key-32chars';

export interface CsrfVerificationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Memvalidasi apakah header Origin / Referer request berasal dari domain aplikasi yang sah
 */
export function verifyCsrfOrigin(requestHeaders: Headers): CsrfVerificationResult {
  const origin = requestHeaders.get('origin');
  const referer = requestHeaders.get('referer');
  const host = requestHeaders.get('host') || requestHeaders.get('x-forwarded-host');

  // Jika tidak ada origin maupun referer pada request mutasi (POST, PUT, DELETE)
  const targetHeader = origin || referer;
  if (!targetHeader) {
    // Pada Server Action Next.js internal, header host selalu ada
    return { valid: true };
  }

  try {
    const targetUrl = new URL(targetHeader);
    const targetHost = targetUrl.host;

    // Periksa kesesuaian dengan header Host request saat ini
    if (host && (targetHost === host || host.startsWith(targetHost))) {
      return { valid: true };
    }

    // Periksa kesesuaian dengan AUTH_URL / NEXT_PUBLIC_APP_URL
    const appUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const appHost = new URL(appUrl).host;

    if (targetHost === appHost || targetHost.includes('localhost') || targetHost.includes('127.0.0.1')) {
      return { valid: true };
    }

    return {
      valid: false,
      reason: `Permintaan ditolak: Origin tidak sah (${targetHost} != ${host || appHost}).`,
    };
  } catch {
    return {
      valid: false,
      reason: 'Permintaan ditolak: Format header Origin / Referer tidak valid.',
    };
  }
}

/**
 * Menghasilkan CSRF Token bertanda tangan HMAC dengan waktu kedaluwarsa (default 1 jam)
 */
export function generateCsrfToken(sessionId: string = 'global-session'): string {
  const timestamp = Date.now().toString();
  const salt = randomBytes(8).toString('hex');
  const data = `${sessionId}:${timestamp}:${salt}`;
  const hmac = createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
  return `${timestamp}.${salt}.${hmac}`;
}

/**
 * Memverifikasi validitas CSRF Token
 */
export function validateCsrfToken(
  token: string,
  sessionId: string = 'global-session',
  maxAgeMs: number = 60 * 60 * 1000 // 1 jam
): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, salt, hmac] = parts;
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  // Cek apakah token kedaluwarsa
  if (Date.now() - tokenTime > maxAgeMs) {
    return false;
  }

  // Hitung ulang HMAC
  const data = `${sessionId}:${timestamp}:${salt}`;
  const expectedHmac = createHmac('sha256', CSRF_SECRET).update(data).digest('hex');

  return hmac === expectedHmac;
}
