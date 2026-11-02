export type UserRole = 'ADMIN' | 'PENGELOLA' | 'KEUANGAN' | 'PENGHUNI' | 'CALON_PENGHUNI';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  roleLabel: string;
  dashboardPath: string;
  roomCode?: string;
  token?: string;
}

export interface DemoAccount {
  role: UserRole;
  roleLabel: string;
  roleDescription: string;
  email: string;
  password: string;
  name: string;
  dashboardPath: string;
  roomCode?: string;
  badgeColor: string;
}
