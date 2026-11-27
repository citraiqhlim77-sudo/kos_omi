import { hash, compare } from 'bcryptjs';

// PRD Bab 10 & Task 2.2: bcryptjs dengan cost factor 12.
export const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  // Hash yang bukan format bcrypt ($2a$/$2b$/$2y$) langsung ditolak.
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(passwordHash)) return false;
  return compare(plain, passwordHash);
}
