import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types/auth';

/**
 * Konfigurasi Auth.js yang aman untuk Edge Runtime (dipakai middleware).
 * Tidak boleh mengimpor bcryptjs atau store pengguna. Provider Credentials
 * ditambahkan di src/auth.ts yang hanya berjalan di Node.js.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  providers: [],
  callbacks: {
    // Simpan id, role & status aktif ke dalam JWT saat login berhasil.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.isActive = user.isActive ?? true;
      }
      return token;
    },
    // Teruskan id, role & status aktif dari JWT ke objek session.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isActive = token.isActive ?? true;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
