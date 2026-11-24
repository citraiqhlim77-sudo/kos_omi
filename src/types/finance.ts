export type GatewayTransactionStatus =
  | 'settlement'
  | 'capture'
  | 'pending'
  | 'expire'
  | 'cancel'
  | 'deny';

export type PaymentMethodType = 'qris' | 'bank_transfer' | 'gopay' | 'shopeepay';

export interface PaymentTransaction {
  id: string;
  orderId: string; // contoh: KOS-202506-00012
  invoiceNumber: string; // contoh: INV-202506-00045
  midtransTransactionId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  roomCode: string;
  category: 'SEWA_BULANAN' | 'BOOKING' | 'DEPOSIT' | 'DENDA';
  paymentType: PaymentMethodType;
  bank?: 'bca' | 'mandiri' | 'bni' | 'bri' | 'permata';
  grossAmount: number;
  transactionStatus: GatewayTransactionStatus;
  fraudStatus: 'accept' | 'challenge' | null;
  settlementTime?: string | null;
  createdAt: string;
  vaNumber?: string;
  qrUrl?: string;
}

export interface MonthlyTrendData {
  month: string;
  label: string;
  totalIncome: number;
  rentIncome: number;
  bookingIncome: number;
  transactionCount: number;
}

export interface DailyReportRow {
  date: string;
  transactionCount: number;
  qrisAmount: number;
  vaAmount: number;
  ewalletAmount: number;
  rentAmount: number;
  bookingAmount: number;
  totalAmount: number;
}

export interface MonthlyReportRow {
  month: string;
  monthName: string;
  transactionCount: number;
  qrisAmount: number;
  vaAmount: number;
  ewalletAmount: number;
  rentAmount: number;
  bookingAmount: number;
  totalAmount: number;
}

export interface OverdueBill {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  roomCode: string;
  tenantPhone: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  periodMonth: string;
  status: 'TERLAMBAT' | 'BELUM_BAYAR';
  reminderCount: number;
  lastReminderSentAt?: string | null;
}

export interface FloorOccupancyBreakdown {
  floor: number;
  label: string;
  totalRooms: number;
  occupiedRooms: number;
  bookedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number; // Persentase (Terisi + Dipesan) / Total
}

export interface OccupancyAnalytics {
  totalRooms: number;
  occupiedRooms: number;
  bookedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalOccupancyRate: number;
  floor1: FloorOccupancyBreakdown;
  floor2: FloorOccupancyBreakdown;
  recommendation: string;
}

export interface CollectionRateAnalytics {
  totalBillsCount: number;
  paidBillsCount: number;
  unpaidBillsCount: number;
  overdueBillsCount: number;
  totalBilledAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  collectionRate: number; // Persentase LUNAS
  delinquencyRate: number; // Persentase TERLAMBAT/BELUM_BAYAR
  recommendation: string;
}

export interface ReservationConversionAnalytics {
  totalReservations: number;
  paidOrCheckinCount: number;
  pendingOrApprovedCount: number;
  rejectedCount: number;
  expiredOrCancelledCount: number;
  conversionRate: number; // Persentase LUNAS/CHECKIN
  dropOffRate: number; // Persentase DITOLAK/KEDALUWARSA/DIBATALKAN
  recommendation: string;
}

export interface OperationalDecisionAnalytics {
  occupancy: OccupancyAnalytics;
  collectionRate: CollectionRateAnalytics;
  reservationConversion: ReservationConversionAnalytics;
}

export interface FinanceDashboardStats {
  currentMonthIncome: number;
  previousMonthIncome: number;
  growthPercentage: number;
  currentMonthTransactions: number;
  pendingTransactionsCount: number;
  pendingAmount: number;
  settlementRate: number;
  incomeByCategory: {
    rent: number;
    booking: number;
    deposit: number;
  };
  incomeByMethod: {
    qris: number;
    va: number;
    ewallet: number;
  };
  monthlyTrends: MonthlyTrendData[];
  analytics?: OperationalDecisionAnalytics;
}

export interface GatewayReconciliationItem {
  orderId: string;
  invoiceNumber: string;
  userName: string;
  roomCode: string;
  paymentType: string;
  systemStatus: GatewayTransactionStatus;
  gatewayStatus: GatewayTransactionStatus;
  systemAmount: number;
  gatewayAmount: number;
  isMatched: boolean;
  statusMismatch: boolean;
  amountMismatch: boolean;
  resolution: 'MATCHED' | 'AUTO_SYNCED' | 'DISCREPANCY';
  notes: string;
}

export interface GatewayReconciliationResult {
  totalChecked: number;
  matchedCount: number;
  unmatchedCount: number;
  autoSyncedCount: number;
  systemGrossTotal: number;
  gatewayGrossTotal: number;
  discrepancyAmount: number;
  reconciledAt: string;
  items: GatewayReconciliationItem[];
}
