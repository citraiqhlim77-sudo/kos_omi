/**
 * Central Notification Dispatcher (PRD Bab 6.H, Bab 10, & Bab 11 Task 3.3)
 *
 * Mengoordinasikan seluruh event notifikasi otomatis ke saluran:
 * 1. Email via Resend (HTML responsif)
 * 2. WhatsApp via Fonnte Adapter (Nomor format 62 & preferensi whatsapp_notif_enabled)
 *
 * Menggunakan Promise.allSettled agar kegagalan satu saluran tidak memblokir saluran lainnya,
 * dan setiap percobaan dicatat secara mandiri ke tabel `notification_logs`.
 */

import {
  sendReservationCreatedNotification,
  sendReservationApprovedNotification,
  sendReservationRejectedNotification,
  sendPaymentSuccessNotification,
  sendBillingReminderH3Notification,
  sendBillingReminderH0Notification,
  sendBillingOverdueNotification,
  sendCheckinSuccessNotification,
  sendCheckoutSuccessNotification,
} from './email';

import {
  sendReservationCreatedWA,
  sendReservationApprovedWA,
  sendReservationRejectedWA,
  sendPaymentSuccessWA,
  sendBillingReminderH3WA,
  sendBillingReminderH0WA,
  sendBillingOverdueWA,
  sendCheckinSuccessWA,
  sendCheckoutSuccessWA,
} from './whatsapp';

export interface DispatchNotificationResult {
  email: { attempted: boolean; success: boolean; messageId?: string; error?: string };
  whatsapp: { attempted: boolean; success: boolean; messageId?: string; error?: string; skipped?: boolean };
}

/**
 * 1. EVENT: RESERVASI DIBUAT (reservasi_dibuat)
 */
export async function dispatchReservationCreated(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  reservationCode: string;
  roomCode: string;
  checkInDate: string;
  durationMonths: number;
  monthlyPrice: number;
  depositAmount: number;
  totalInitialPayment: number;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendReservationCreatedNotification(
      {
        userName: params.userName,
        userEmail: params.userEmail,
        reservationCode: params.reservationCode,
        roomCode: params.roomCode,
        checkInDate: params.checkInDate,
        durationMonths: params.durationMonths,
        monthlyPrice: params.monthlyPrice,
        depositAmount: params.depositAmount,
        totalInitialPayment: params.totalInitialPayment,
        portalUrl: 'https://kosomi.id/calon/reservasi',
      },
      params.userId
    ),
    sendReservationCreatedWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      reservationCode: params.reservationCode,
      roomCode: params.roomCode,
      startDate: params.checkInDate,
      durationMonths: params.durationMonths,
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 2. EVENT: RESERVASI DISETUJUI (reservasi_disetujui)
 */
export async function dispatchReservationApproved(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  reservationCode: string;
  roomCode: string;
  invoiceCode: string;
  totalAmount: number;
  monthlyPrice: number;
  depositAmount: number;
  checkInDate: string;
  durationMonths: number;
  paymentDeadline: string;
  paymentUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendReservationApprovedNotification(
      {
        userName: params.userName,
        userEmail: params.userEmail,
        reservationCode: params.reservationCode,
        roomCode: params.roomCode,
        checkInDate: params.checkInDate,
        durationMonths: params.durationMonths,
        monthlyPrice: params.monthlyPrice,
        depositAmount: params.depositAmount,
        totalInitialPayment: params.totalAmount,
        paymentDeadline: params.paymentDeadline,
        invoiceCode: params.invoiceCode,
        snapRedirectUrl: params.paymentUrl,
        portalUrl: 'https://kosomi.id/calon/reservasi',
      },
      params.userId
    ),
    sendReservationApprovedWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      reservationCode: params.reservationCode,
      roomCode: params.roomCode,
      invoiceCode: params.invoiceCode,
      totalAmount: params.totalAmount,
      paymentDeadline: params.paymentDeadline,
      paymentUrl: params.paymentUrl || 'https://kosomi.id/calon/reservasi',
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 3. EVENT: RESERVASI DITOLAK (reservasi_ditolak)
 */
export async function dispatchReservationRejected(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  reservationCode: string;
  roomCode: string;
  rejectionReason: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendReservationRejectedNotification(
      {
        userName: params.userName,
        reservationCode: params.reservationCode,
        roomCode: params.roomCode,
        rejectionReason: params.rejectionReason,
        portalUrl: 'https://kosomi.id/kamar',
      },
      params.userEmail,
      params.userId
    ),
    sendReservationRejectedWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      reservationCode: params.reservationCode,
      roomCode: params.roomCode,
      rejectionReason: params.rejectionReason,
      portalUrl: 'https://kosomi.id/kamar',
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 4. EVENT: PEMBAYARAN LUNAS (pembayaran_lunas)
 */
export async function dispatchPaymentSuccess(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  invoiceCode: string;
  orderId: string;
  roomCode: string;
  category: string;
  grossAmount: number;
  paymentType: string;
  settlementTime: string;
  portalUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendPaymentSuccessNotification(
      {
        userName: params.userName,
        invoiceCode: params.invoiceCode,
        orderId: params.orderId,
        roomCode: params.roomCode,
        category: params.category,
        grossAmount: params.grossAmount,
        paymentType: params.paymentType,
        settlementTime: params.settlementTime,
        portalUrl: params.portalUrl || `https://kosomi.id/pembayaran/selesai?order_id=${params.orderId}`,
      },
      params.userEmail,
      params.userId
    ),
    sendPaymentSuccessWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      invoiceCode: params.invoiceCode,
      orderId: params.orderId,
      roomCode: params.roomCode,
      grossAmount: params.grossAmount,
      paymentType: params.paymentType,
      settlementTime: params.settlementTime,
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 5. EVENT: PENGINGAT TAGIHAN H-3 (pengingat_tagihan_h3)
 */
export async function dispatchBillingReminderH3(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  invoiceCode: string;
  roomCode: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  portalUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendBillingReminderH3Notification(
      {
        userName: params.userName,
        invoiceCode: params.invoiceCode,
        roomCode: params.roomCode,
        periodMonth: params.periodMonth,
        amount: params.amount,
        dueDate: params.dueDate,
        daysRemaining: 3,
        portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
      },
      params.userEmail,
      params.userId
    ),
    sendBillingReminderH3WA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      roomCode: params.roomCode,
      periodMonth: params.periodMonth,
      amount: params.amount,
      dueDate: params.dueDate,
      portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 6. EVENT: PENGINGAT TAGIHAN H-0 (pengingat_tagihan_h0)
 */
export async function dispatchBillingReminderH0(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  invoiceCode: string;
  roomCode: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  portalUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendBillingReminderH0Notification(
      {
        userName: params.userName,
        invoiceCode: params.invoiceCode,
        roomCode: params.roomCode,
        periodMonth: params.periodMonth,
        amount: params.amount,
        dueDate: params.dueDate,
        portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
      },
      params.userEmail,
      params.userId
    ),
    sendBillingReminderH0WA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      roomCode: params.roomCode,
      periodMonth: params.periodMonth,
      amount: params.amount,
      dueDate: params.dueDate,
      portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 7. EVENT: TAGIHAN TERLAMBAT (tagihan_terlambat)
 */
export async function dispatchBillingOverdue(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  invoiceCode: string;
  roomCode: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  portalUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendBillingOverdueNotification(
      {
        userName: params.userName,
        invoiceCode: params.invoiceCode,
        roomCode: params.roomCode,
        periodMonth: params.periodMonth,
        amount: params.amount,
        dueDate: params.dueDate,
        daysOverdue: params.daysOverdue,
        portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
      },
      params.userEmail,
      params.userId
    ),
    sendBillingOverdueWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      roomCode: params.roomCode,
      periodMonth: params.periodMonth,
      amount: params.amount,
      dueDate: params.dueDate,
      daysOverdue: params.daysOverdue,
      portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 8. EVENT: CHECK-IN BERHASIL (checkin)
 */
export async function dispatchCheckinSuccess(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  roomCode: string;
  checkInDate: string;
  durationMonths: number;
  tenancyEndDate: string;
  monthlyPrice: number;
  depositAmount: number;
  portalUrl?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendCheckinSuccessNotification(
      {
        userName: params.userName,
        roomCode: params.roomCode,
        checkInDate: params.checkInDate,
        durationMonths: params.durationMonths,
        tenancyEndDate: params.tenancyEndDate,
        monthlyPrice: params.monthlyPrice,
        depositAmount: params.depositAmount,
        meterNumber: '1423-8890-4101',
        wifiSsid: 'KOS_OMI_LT1',
        wifiPassword: 'kosomisungaibangek2026',
        portalUrl: params.portalUrl || 'https://kosomi.id/penghuni/dashboard',
      },
      params.userEmail,
      params.userId
    ),
    sendCheckinSuccessWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      roomCode: params.roomCode,
      checkInDate: params.checkInDate,
      tenancyEndDate: params.tenancyEndDate,
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}

/**
 * 9. EVENT: CHECK-OUT SELESAI (checkout)
 */
export async function dispatchCheckoutSuccess(params: {
  userName: string;
  userEmail: string;
  userPhone: string;
  roomCode: string;
  checkOutDate: string;
  depositStatus: string;
  depositRefundAmount: number;
  notes?: string;
  userId?: string;
}): Promise<DispatchNotificationResult> {
  const [emailRes, waRes] = await Promise.allSettled([
    sendCheckoutSuccessNotification(
      {
        userName: params.userName,
        roomCode: params.roomCode,
        checkOutDate: params.checkOutDate,
        depositStatus: params.depositStatus,
        depositRefundAmount: params.depositRefundAmount,
        notes: params.notes,
      },
      params.userEmail,
      params.userId
    ),
    sendCheckoutSuccessWA({
      toPhone: params.userPhone,
      userId: params.userId,
      userName: params.userName,
      roomCode: params.roomCode,
      checkOutDate: params.checkOutDate,
      depositRefundStatus: params.depositStatus,
    }),
  ]);

  return {
    email: {
      attempted: true,
      success: emailRes.status === 'fulfilled' && emailRes.value.success,
      messageId: emailRes.status === 'fulfilled' ? emailRes.value.messageId : undefined,
      error: emailRes.status === 'rejected' ? String(emailRes.reason) : emailRes.value?.error,
    },
    whatsapp: {
      attempted: true,
      success: waRes.status === 'fulfilled' && waRes.value.success,
      messageId: waRes.status === 'fulfilled' ? waRes.value.messageId : undefined,
      error: waRes.status === 'rejected' ? String(waRes.reason) : waRes.value?.error,
      skipped: waRes.status === 'fulfilled' && waRes.value.skipped,
    },
  };
}
