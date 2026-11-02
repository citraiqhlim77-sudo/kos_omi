import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import type { UserRole } from './types/auth';
import { applySecurityHeaders } from './lib/security/headers';

// Middleware memakai konfigurasi edge-safe (tanpa bcrypt / modul Node murni).
const { auth } = NextAuth(authConfig);

// Peta otorisasi prefiks rute terhadap peran pengguna (PRD Bab 5 & Bab 11 Task 2.3)
const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/pengelola': ['ADMIN', 'PENGELOLA'],
  '/keuangan': ['ADMIN', 'KEUANGAN'],
  '/penghuni': ['ADMIN', 'PENGHUNI'],
  '/calon': ['ADMIN', 'CALON_PENGHUNI'],
};

export default auth((request) => {
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

  // 2. Cek apakah rute saat ini termasuk prefiks yang diproteksi peran (RBAC)
  const matchedPrefix = Object.keys(ROUTE_ROLE_MAP).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  let response: NextResponse;

  if (!matchedPrefix) {
    response = NextResponse.next();
    return applySecurityHeaders(response.headers), response;
  }

  const user = request.auth?.user;
  const role = user?.role;
  const isActive = user?.isActive;

  // A. Belum login sama sekali: arahkan ke halaman masuk dengan callbackUrl
  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    response = NextResponse.redirect(loginUrl);
    return applySecurityHeaders(response.headers), response;
  }

  // B. Akun terdaftar namun telah dinonaktifkan: tolak langsung
  if (isActive === false) {
    const disabledUrl = new URL('/login', request.url);
    disabledUrl.searchParams.set(
      'error',
      'Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi pengelola.'
    );
    response = NextResponse.redirect(disabledUrl);
    return applySecurityHeaders(response.headers), response;
  }

  // C. Sudah login tetapi peran tidak memiliki hak akses rute ini
  // Sesuai PRD Bab 5: ADMIN memiliki akses penuh ke seluruh prefiks internal
  const allowedRoles = ROUTE_ROLE_MAP[matchedPrefix];
  if (role !== 'ADMIN' && !allowedRoles.includes(role)) {
    response = NextResponse.rewrite(new URL('/403', request.url));
    return applySecurityHeaders(response.headers), response;
  }

  response = NextResponse.next();
  return applySecurityHeaders(response.headers), response;
});

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
