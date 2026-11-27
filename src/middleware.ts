import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';
import type { UserRole } from './types/auth';
import { applySecurityHeaders } from '@/lib/security/headers';

const { auth } = NextAuth(authConfig);

// Peta otorisasi ketat prefiks rute terhadap peran pengguna (RBAC 5 Role)
export const ROUTE_ROLE_MAP: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/pengelola': ['PENGELOLA'],
  '/keuangan': ['KEUANGAN'],
  // Izinkan PENGHUNI melewati Edge pada /calon agar CalonPortalLayout langsung mengarahkan ke /penghuni/dashboard
  '/calon': ['CALON_PENGHUNI', 'PENGHUNI'],
  // Izinkan token CALON_PENGHUNI melewati Edge agar layout server /penghuni memeriksa promosi role terbaru di PostgreSQL;
  // jika belum resmi PENGHUNI di DB, layout server /penghuni tetap menolak ke /403.
  '/penghuni': ['PENGHUNI', 'CALON_PENGHUNI'],
};

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. Proteksi CSRF untuk request mutasi (POST, PUT, DELETE, PATCH) pada API internal
  if (
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/webhooks/') &&
    !pathname.startsWith('/api/auth/')
  ) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (
          originHost !== host &&
          !originHost.includes('localhost') &&
          !originHost.includes('127.0.0.1')
        ) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: 'Akses ditolak: Verifikasi CSRF origin gagal.',
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Akses ditolak: Format header Origin tidak sah.',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // 2. Proteksi ketat RBAC untuk seluruh rute portal (/admin/*, /pengelola/*, /keuangan/*, /penghuni/*, /calon/*)
  if (!pathname.startsWith('/api/')) {
    const matchedPrefix = Object.keys(ROUTE_ROLE_MAP).find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (matchedPrefix) {
      const sessionUser = request.auth?.user;

      // Belum login -> arahkan langsung ke /login
      if (!sessionUser || (!sessionUser.id && !sessionUser.email)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        applySecurityHeaders(redirectRes.headers);
        return redirectRes;
      }

      // Akun nonaktif -> arahkan ke /login
      if (sessionUser.isActive === false) {
        const loginUrl = new URL('/login', request.url);
        const redirectRes = NextResponse.redirect(loginUrl);
        applySecurityHeaders(redirectRes.headers);
        return redirectRes;
      }

      // Sudah login tetapi mencoba membuka URL milik role lain -> arahkan ke /403
      const allowedRoles = ROUTE_ROLE_MAP[matchedPrefix];
      const userRole = sessionUser.role as UserRole | undefined;
      if (!userRole || !allowedRoles.includes(userRole)) {
        const forbiddenUrl = new URL('/403', request.url);
        const forbiddenRes = NextResponse.redirect(forbiddenUrl);
        applySecurityHeaders(forbiddenRes.headers);
        return forbiddenRes;
      }
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  return response;
});

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
