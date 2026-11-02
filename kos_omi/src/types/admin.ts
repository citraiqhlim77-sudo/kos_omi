export type UserRole =
  | 'ADMIN'
  | 'PENGELOLA'
  | 'KEUANGAN'
  | 'CALON_PENGHUNI'
  | 'PENGHUNI';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  roomCode?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminSettings {
  kosName: string;
  kosAddress: string;
  adminPhone: string;
  dueDay: number; // default 5
  depositPercentage: number; // default 100
  bookingWindowHours: number; // default 24
  timezone: string;
  lateFeeEnabled: boolean;
  lateFeeDailyAmount: number;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationLogRecord {
  id: string;
  recipient: string;
  recipientName: string;
  channel: 'WHATSAPP' | 'EMAIL';
  template: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  attempts: number;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}
