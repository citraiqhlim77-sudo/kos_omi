import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { describeCredentialsFailure, verifyCredentials } from '@/lib/auth/credentials';

/**
 * Error login dengan pesan Bahasa Indonesia di field `code`,
 * dibaca kembali oleh loginAction untuk ditampilkan di form.
 */
class KosOmiLoginError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Email dan Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Kata Sandi', type: 'password' },
      },
      async authorize(raw) {
        const email = typeof raw?.email === 'string' ? raw.email.trim() : '';
        const password = typeof raw?.password === 'string' ? raw.password : '';

        if (!email || !password) {
          throw new KosOmiLoginError('Email dan kata sandi wajib diisi.');
        }

        const result = await verifyCredentials(email, password);
        if (!result.ok) {
          throw new KosOmiLoginError(describeCredentialsFailure(result));
        }

        return result.user;
      },
    }),
  ],
});
