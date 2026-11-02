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
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.vercel-storage.com https://*.blob.vercel-storage.com",
      "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://api.sandbox.midtrans.com https://api.midtrans.com https://api.resend.com https://api.fonnte.com https://*.upstash.io",
      "frame-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
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
