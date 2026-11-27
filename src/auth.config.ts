import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types/auth';

/**
 * Konfigurasi Auth.js yang aman untuk Edge Runtime (dipakai middleware).
 * Tidak boleh mengimpor bcryptjs atau store pengguna. Provider Credentials
 * ditambahkan di src/auth.ts yang hanya berjalan di Node.js.
 */
export const authConfig = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'kos-omi-padang-production-auth-secret-key-2026-kelompok-1',
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 hari
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
  providers: [],
  callbacks: {
    // Simpan id, name, email, role & status aktif ke dalam JWT saat login berhasil.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
      }
      return token;
    },
    // Teruskan id, name, email, role & status aktif dari JWT ke objek session.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
        session.user.isActive = (token.isActive as boolean | undefined) ?? true;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

