import type { PaymentTransaction } from '@/types/finance';

export const PAYMENT_CATEGORY_LABELS: Record<PaymentTransaction['category'], string> = {
  SEWA_BULANAN: 'Sewa Semesteran (Rp 5.000.000/semester)',
  BOOKING: 'Booking Kamar Baru (1 Semester)',
  DEPOSIT: 'Uang Jaminan (Deposit)',
  DENDA: 'Denda Keterlambatan',
};

export function formatPaymentCategoryLabel(category: string): string {
  if (category === 'SEWA_BULANAN') {
    return PAYMENT_CATEGORY_LABELS.SEWA_BULANAN;
  }
  if (category === 'BOOKING') {
    return PAYMENT_CATEGORY_LABELS.BOOKING;
  }
  if (category === 'DEPOSIT') {
    return PAYMENT_CATEGORY_LABELS.DEPOSIT;
  }
  if (category === 'DENDA') {
    return PAYMENT_CATEGORY_LABELS.DENDA;
  }
  return category;
}
