import type { Room } from './room';

export interface CalonUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  nik: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  ktpUrl: string;
  createdAt: string;
}

export type ReservationStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Reservation {
  id: string;
  code: string;
  roomId: string;
  roomCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userNik: string;
  userOccupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  ktpUrl?: string;
  checkInDate: string;
  durationMonths: number;
  monthlyPrice: number;
  depositAmount: number;
  totalInitialPayment: number;
  status: ReservationStatus;
  expiresAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  room?: Room;
  payment?: PaymentInvoice;
}

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'SETTLEMENT' | 'EXPIRED' | 'CANCELLED';

export interface PaymentInvoice {
  id: string;
  invoiceCode: string;
  reservationId: string;
  reservationCode: string;
  roomCode: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: 'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'BNI_VA' | 'GOPAY' | 'SHOPEEPAY' | string;
  snapToken?: string;
  snapRedirectUrl?: string;
  expiresAt: string;
  paidAt?: string;
  createdAt: string;
  midtransOrderId?: string;
  midtransTransactionId?: string;
  bank?: string;
  settlementTime?: string;
  rawPayload?: Record<string, unknown>;
}

export interface CreateReservationInput {
  roomCode: string;
  fullName: string;
  nik: string;
  phone: string;
  email: string;
  occupation?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  checkInDate: string;
  durationMonths: number;
  ktpUrl?: string;
  agreedToRules: boolean;
}
