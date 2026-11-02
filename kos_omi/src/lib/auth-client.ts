import { AuthUser, DemoAccount, UserRole } from '@/types/auth';
import { DEMO_ACCOUNTS, getRoleDashboardPath } from '@/data/auth-demo';

const AUTH_STORAGE_KEY = 'kos_omi_auth_session';

export function getClientSession(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setClientSession(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save session', err);
  }
}

export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session', err);
  }
}

export function loginWithDemoAccount(role: UserRole): { user: AuthUser; redirectUrl: string } {
  const account = DEMO_ACCOUNTS.find((acc) => acc.role === role) || DEMO_ACCOUNTS[3];
  const user: AuthUser = {
    id: `usr-${role.toLowerCase()}`,
    name: account.name,
    email: account.email,
    role: account.role,
    roleLabel: account.roleLabel,
    dashboardPath: account.dashboardPath,
    roomCode: account.roomCode,
    token: `demo-jwt-token-${role.toLowerCase()}-${Date.now()}`,
  };
  setClientSession(user);
  return { user, redirectUrl: account.dashboardPath };
}

export function loginWithCredentials(email: string): { user: AuthUser; redirectUrl: string } {
  const normalized = email.trim().toLowerCase();
  const matched = DEMO_ACCOUNTS.find((acc) => acc.email.toLowerCase() === normalized);

  let role: UserRole = 'CALON_PENGHUNI';
  let name = 'Pengguna Terdaftar';
  let roleLabel = 'Calon Penghuni';
  let dashboardPath = '/calon/dashboard';
  let roomCode: string | undefined = undefined;

  if (matched) {
    role = matched.role;
    name = matched.name;
    roleLabel = matched.roleLabel;
    dashboardPath = matched.dashboardPath;
    roomCode = matched.roomCode;
  } else if (normalized.includes('admin')) {
    role = 'ADMIN';
    name = 'Admin Kos Omi';
    roleLabel = 'Admin Sistem';
    dashboardPath = '/admin/dashboard';
  } else if (normalized.includes('pengelola')) {
    role = 'PENGELOLA';
    name = 'Pengelola Kos';
    roleLabel = 'Pengelola Kos';
    dashboardPath = '/pengelola/dashboard';
  } else if (normalized.includes('keuangan')) {
    role = 'KEUANGAN';
    name = 'Staff Keuangan';
    roleLabel = 'Staf Keuangan';
    dashboardPath = '/keuangan/dashboard';
  } else if (normalized.includes('penghuni')) {
    role = 'PENGHUNI';
    name = 'Penghuni Kos';
    roleLabel = 'Penghuni Aktif';
    dashboardPath = '/penghuni/dashboard';
    roomCode = 'A-101';
  }

  const user: AuthUser = {
    id: `usr-${role.toLowerCase()}-${Date.now().toString(36)}`,
    name,
    email: normalized,
    role,
    roleLabel,
    dashboardPath,
    roomCode,
    token: `demo-jwt-${Date.now()}`,
  };

  setClientSession(user);
  return { user, redirectUrl: dashboardPath };
}
