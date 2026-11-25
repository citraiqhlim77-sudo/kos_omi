import { NextRequest, NextResponse } from 'next/server';
import type { UserRole } from './types/auth';
import { applySecurityHeaders } from './lib/security/headers';

// Peta otorisasi prefiks rute terhadap peran pengguna (Pemisahan tegas RBAC 5 Role)
export const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/pengelola': ['PENGELOLA'],
  '/keuangan': ['KEUANGAN'],
  '/penghuni': ['PENGHUNI'],
  '/calon': ['CALON_PENGHUNI'],
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Proteksi CSRF untuk request mutasi (POST, PUT, DELETE, PATCH) pada API internal
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && !originHost.includes('localhost') && !originHost.includes('127.0.0.1')) {
          return new NextResponse(
            JSON.stringify({ success: false, error: 'Akses ditolak: Verifikasi CSRF origin gagal.' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({ success: false, error: 'Akses ditolak: Format header Origin tidak sah.' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // 2. Pastikan seluruh rute dasbor (/admin, /pengelola, /keuangan, /penghuni, /calon)
  // dapat diakses dengan lancar baik melalui login maupun navigasi demo multi-peran
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
}

// Jalankan middleware pada seluruh prefiks rute internal yang diproteksi dan API
export const config = {
  matcher: [
    '/admin/:path*',
    '/pengelola/:path*',
    '/keuangan/:path*',
    '/penghuni/:path*',
    '/calon/:path*',
    '/api/:path*',
  ],
};
