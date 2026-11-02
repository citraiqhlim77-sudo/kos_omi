export type MonthlyBillStatus = 'BELUM_BAYAR' | 'LUNAS' | 'TERLAMBAT' | 'KEDALUWARSA';

export interface MonthlyBill {
  id: string;
  invoiceCode: string;
  periodMonth: string;
  periodKey: string;
  year: number;
  roomCode: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  dueDate: string;
  rentAmount: number;
  amount?: number;
  penaltyAmount?: number;
  totalAmount: number;
  status: MonthlyBillStatus;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  notes?: string;
}

export interface TenantProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nik: string;
  occupation: string;
  roomCode: string;
  checkInDate: string;
  tenancyEnd: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyContact?: string;
  monthlyRent?: number;
  avatarUrl?: string;
}
