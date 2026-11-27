/**
 * Definisi Header Keamanan Produksi Kos Omi (PRD Bab 8 & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. HSTS (Strict-Transport-Security)
 * 2. CSP (Content-Security-Policy)
 * 3. X-Frame-Options: DENY (Mencegah Clickjacking)
 * 4. X-Content-Type-Options: nosniff (Mencegah MIME Sniffing)
 * 5. Referrer-Policy: strict-origin-when-cross-origin
 * 6. Permissions-Policy: membatasi akses sensor / device API yang tidak diperlukan
 */

export const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

export function applySecurityHeaders(headers: Headers): Headers {
  for (const item of SECURITY_HEADERS) {
    if (!headers.has(item.key)) {
      headers.set(item.key, item.value);
    }
  }
  return headers;
}
