export interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  status: 'BELUM_BAYAR' | 'TERLAMBAT';
  description: string;
}

export interface TenancyRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userNik: string;
  idCardUrl: string;
  roomId: string;
  roomCode: string;
  roomFloor: number;
  roomType: 'STANDAR_NON_AC' | 'STANDAR_AC' | 'DELUXE_AC';
  monthlyPrice: number;
  depositAmount: number;
  checkInDate: string;
  contractEndDate: string;
  checkOutDate?: string | null;
  dueDay: number;
  status: 'AKTIF' | 'SELESAI';
  depositRefunded: boolean;
  unpaidBillsCount: number;
  totalUnpaidAmount: number;
  unpaidInvoices: UnpaidInvoice[];
  pastInvoices: Array<{
    id: string;
    invoiceNumber: string;
    periodMonth: string;
    amount: number;
    paidAt: string;
    paymentMethod: string;
    status: 'LUNAS';
  }>;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface CheckinCandidate {
  id: string;
  reservationCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  userNik: string;
  roomId: string;
  roomCode: string;
  roomFloor: number;
  roomType: 'STANDAR_NON_AC' | 'STANDAR_AC' | 'DELUXE_AC';
  startDate: string;
  durationMonths: number;
  bookingAmount: number;
  depositAmount: number;
  totalPaid: number;
  invoiceCode: string;
  paymentMethod: string;
  paidAt: string;
  idCardUrl: string;
  notes?: string;
  status: 'LUNAS' | 'CHECKIN';
}
