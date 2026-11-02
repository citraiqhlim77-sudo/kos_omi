'use server';

import {
  dbCreateReservation,
  dbGetReservationByCode,
  dbGetReservationsByUserEmail,
  dbGetReservations,
  dbApproveReservation,
  dbRejectReservation,
  dbCancelExpiredReservations,
  dbAddAuditLog,
} from '@/server/db';
import { CreateReservationInput, Reservation } from '@/types/reservation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireRole, getCurrentUser } from '@/lib/auth-server';
import {
  dispatchReservationCreated,
  dispatchReservationApproved,
  dispatchReservationRejected,
} from '@/lib/notify/dispatch';
import { sanitizeInput, sanitizeString } from '@/lib/security/sanitize';
import { reservationInputSchema, rejectReservationSchema } from '@/lib/security/zod';
import { createSignedKtpUrl } from '@/lib/security/signed-url';

export interface ActionResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * 1. CREATE RESERVATION (PRD Bab 5.C & Bab 11 Task 2.5)
 * Validasi ketat:
 * - 1 reservasi aktif per pengguna (PENDING_REVIEW atau APPROVED)
 * - Tanggal rencana masuk minimal H+3 kalender dari hari ini
 * - Validasi berkas KTP (MIME type: JPEG, PNG, PDF; batas ukuran maksimal 2 MB)
 */
export async function createReservation(
  input: CreateReservationInput
): Promise<ActionResponse<Reservation>> {
  try {
    // 0. Sanitasi XSS seluruh input
    const sanitizedInput = sanitizeInput({ ...input });

    // 0b. Validasi Skema Zod Input Reservasi
    const validation = reservationInputSchema.safeParse({
      roomCode: sanitizedInput.roomCode,
      fullName: sanitizedInput.fullName,
      nik: sanitizedInput.nik,
      phone: sanitizedInput.phone,
      email: sanitizedInput.email,
      checkInDate: sanitizedInput.checkInDate,
      durationMonths: sanitizedInput.durationMonths,
    });

    if (!validation.success) {
      return { success: false, message: validation.error.message };
    }

    // A. Validasi Satu Reservasi Aktif per Pengguna (PRD Bab 5.C & Task 2.5)
    const existingReservations = await dbGetReservationsByUserEmail(input.email);
    const hasActiveReservation = existingReservations.some(
      (r) => r.status === 'PENDING_REVIEW' || r.status === 'APPROVED'
    );
    if (hasActiveReservation) {
      return {
        success: false,
        message:
          'Anda masih memiliki reservasi aktif yang sedang berjalan. Setiap pengguna hanya dapat memiliki 1 reservasi aktif sekaligus.',
      };
    }

    // B. Validasi Tanggal Masuk Minimal H+3 Kalender dari Hari Ini
    const now = new Date();
    const minCheckIn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
    minCheckIn.setHours(0, 0, 0, 0);

    const selectedCheckIn = new Date(input.checkInDate);
    selectedCheckIn.setHours(0, 0, 0, 0);

    if (selectedCheckIn < minCheckIn) {
      return {
        success: false,
        message:
          'Tanggal rencana masuk minimal H+3 dari hari ini untuk verifikasi berkas oleh pengelola dan penyiapan kamar.',
      };
    }

    // C. Validasi Berkas KTP (MIME JPEG/PNG/PDF & Maksimal 2 MB)
    if (input.ktpUrl) {
      const isDataUri = input.ktpUrl.startsWith('data:');
      if (isDataUri) {
        const mimeMatch = input.ktpUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : '';
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedMimes.includes(mimeType)) {
          return {
            success: false,
            message: 'Format berkas KTP tidak valid. Hanya berkas JPG, PNG, atau PDF yang diperbolehkan.',
          };
        }

        // Ukuran string base64 ke byte: (length * 3) / 4
        const base64Data = input.ktpUrl.slice(mimeMatch ? mimeMatch[0].length : 0);
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const maxBytes = 2 * 1024 * 1024; // 2 MB
        if (sizeInBytes > maxBytes) {
          return {
            success: false,
            message: 'Ukuran berkas KTP melebihi batas maksimal 2 MB sesuai ketentuan Vercel Blob.',
          };
        }
      }
    }

    if (!input.agreedToRules) {
      return {
        success: false,
        message: 'Anda wajib menyetujui tata tertib dan syarat ketentuan sewa Kos Omi.',
      };
    }

    const reservation = await dbCreateReservation(input);

    const currentUser = await getCurrentUser();
    await dbAddAuditLog({
      userId: currentUser?.id || reservation.userId,
      action: 'CREATE_RESERVATION',
      entityType: 'RESERVATION',
      entityId: reservation.code,
      payloadAfter: {
        roomCode: reservation.roomCode,
        userName: reservation.userName,
        userEmail: reservation.userEmail,
        checkInDate: reservation.checkInDate,
        durationMonths: reservation.durationMonths,
      },
    });

    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika dipanggil di luar konteks tag cache
    }
    revalidatePath('/');
    revalidatePath('/kamar');
    revalidatePath(`/kamar/${input.roomCode}`);
    revalidatePath('/calon');
    revalidatePath('/calon/reservasi');
    revalidatePath('/pengelola/reservasi');
    revalidatePath('/pengelola/dashboard');

    // Trigger Notifikasi Otomatis (Email Resend & WhatsApp Fonnte - Task 3.3)
    try {
      await dispatchReservationCreated({
        userName: reservation.userName,
        userEmail: reservation.userEmail,
        userPhone: reservation.userPhone || input.phone,
        reservationCode: reservation.code,
        roomCode: reservation.roomCode,
        checkInDate: reservation.checkInDate,
        durationMonths: reservation.durationMonths,
        monthlyPrice: reservation.monthlyPrice,
        depositAmount: reservation.depositAmount,
        totalInitialPayment: reservation.totalInitialPayment,
        userId: reservation.userId,
      });
    } catch (notifErr) {
      console.warn('[Notification] Gagal mengirim notifikasi reservasi dibuat:', notifErr);
    }

    return {
      success: true,
      message: 'Reservasi Anda berhasil diajukan dan sedang dalam peninjauan pengelola Kos Omi (maksimal 2x24 jam).',
      data: reservation,
    };
  } catch (error: any) {
    console.error('Error in createReservation:', error);
    return {
      success: false,
      message: error?.message || 'Terjadi kesalahan sistem saat mengajukan reservasi. Silakan coba kembali.',
    };
  }
}

// Alias untuk kompatibilitas form calon penghuni
export async function submitReservationAction(input: Parameters<typeof createReservation>[0]) {
  return createReservation(input);
}

/**
 * 2. APPROVE RESERVATION (PRD Bab 5.C & Bab 11 Task 2.5)
 * Otorisasi: Pengelola atau Admin.
 * Mengubah status reservasi menjadi APPROVED, status kamar menjadi DIPESAN,
 * dan menerbitkan invoice BOOKING pembayaran Midtrans dengan batas bayar 24 jam.
 * Menulis ke audit_logs dan memanggil revalidateTag("rooms").
 */
export async function approveReservation(
  reservationCode: string,
  notes?: string
): Promise<ActionResponse<Reservation>> {
  try {
    const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);

    const existing = await dbGetReservationByCode(reservationCode);
    if (!existing) {
      return { success: false, message: `Reservasi ${reservationCode} tidak ditemukan` };
    }

    if (existing.status !== 'PENDING_REVIEW') {
      return {
        success: false,
        message: `Reservasi ${reservationCode} saat ini berstatus ${existing.status} dan tidak dapat disetujui lagi.`,
      };
    }

    const updated = await dbApproveReservation(reservationCode, notes);
    if (!updated) {
      return { success: false, message: 'Gagal memproses persetujuan reservasi di database' };
    }

    // Catat ke audit_logs
    await dbAddAuditLog({
      userId: currentUser.id,
      action: 'APPROVE_RESERVATION',
      entityType: 'RESERVATION',
      entityId: reservationCode,
      payloadBefore: { status: existing.status, roomCode: existing.roomCode },
      payloadAfter: {
        status: 'APPROVED',
        roomStatus: 'DIPESAN',
        roomCode: updated.roomCode,
        expiresAt: updated.expiresAt,
        adminNotes: notes,
      },
    });

    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika dipanggil di luar konteks tag cache
    }
    revalidatePath('/pengelola/reservasi');
    revalidatePath(`/pengelola/reservasi/${reservationCode}`);
    revalidatePath('/pengelola/dashboard');
    revalidatePath('/pengelola/kamar');
    revalidatePath('/calon');
    revalidatePath('/calon/reservasi');
    revalidatePath('/kamar');
    revalidatePath('/');

    // Trigger Notifikasi Otomatis (Email Resend & WhatsApp Fonnte - Task 3.3)
    try {
      await dispatchReservationApproved({
        userName: updated.userName,
        userEmail: updated.userEmail,
        userPhone: updated.userPhone,
        reservationCode: updated.code,
        roomCode: updated.roomCode,
        invoiceCode: `INV-${updated.code.replace('RSV-', '')}`,
        totalAmount: updated.totalInitialPayment,
        monthlyPrice: updated.monthlyPrice,
        depositAmount: updated.depositAmount,
        checkInDate: updated.checkInDate,
        durationMonths: updated.durationMonths,
        paymentDeadline: '24 Jam dari sekarang',
        paymentUrl: `https://kosomi.id/calon/pembayaran/${updated.code}`,
        userId: updated.userId,
      });
    } catch (notifErr) {
      console.warn('[Notification] Gagal mengirim notifikasi reservasi disetujui:', notifErr);
    }

    return {
      success: true,
      message: `Reservasi ${reservationCode} disetujui! Invoice pembayaran Midtrans Snap (24 jam) telah aktif dan kamar ${updated.roomCode} dikunci ke status DIPESAN.`,
      data: updated,
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Gagal menyetujui reservasi' };
  }
}

export async function approveReservationAction(reservationCode: string, notes?: string) {
  return approveReservation(reservationCode, notes);
}
export async function approveReservationForDemoAction(reservationCode: string, notes?: string) {
  return approveReservation(reservationCode, notes);
}

/**
 * 3. REJECT RESERVATION (PRD Bab 5.C & Bab 11 Task 2.5)
 * Otorisasi: Pengelola atau Admin.
 * Alasan penolakan wajib minimal 10 karakter.
 * Mengembalikan kamar ke TERSEDIA jika sebelumnya berstatus DIPESAN.
 * Menulis ke audit_logs dan memanggil revalidateTag("rooms").
 */
export async function rejectReservation(
  reservationCode: string,
  rejectionReason: string
): Promise<ActionResponse<Reservation>> {
  try {
    const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);
    const sanitizedReason = sanitizeString(rejectionReason);

    // Validasi Zod Penolakan Reservasi
    const validation = rejectReservationSchema.safeParse({
      reservationCode,
      rejectionReason: sanitizedReason,
    });
    if (!validation.success) {
      return { success: false, message: validation.error.message };
    }

    const existing = await dbGetReservationByCode(reservationCode);
    if (!existing) {
      return { success: false, message: `Reservasi ${reservationCode} tidak ditemukan` };
    }

    const updated = await dbRejectReservation(reservationCode, rejectionReason.trim());
    if (!updated) {
      return { success: false, message: 'Gagal menolak reservasi di database' };
    }

    // Catat ke audit_logs
    await dbAddAuditLog({
      userId: currentUser.id,
      action: 'REJECT_RESERVATION',
      entityType: 'RESERVATION',
      entityId: reservationCode,
      payloadBefore: { status: existing.status, roomCode: existing.roomCode },
      payloadAfter: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        roomStatus: 'TERSEDIA',
      },
    });

    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika dipanggil di luar konteks tag cache
    }
    revalidatePath('/pengelola/reservasi');
    revalidatePath(`/pengelola/reservasi/${reservationCode}`);
    revalidatePath('/pengelola/dashboard');
    revalidatePath('/pengelola/kamar');
    revalidatePath('/calon');
    revalidatePath('/calon/reservasi');
    revalidatePath('/kamar');
    revalidatePath('/');

    // Trigger Notifikasi Otomatis (Email Resend & WhatsApp Fonnte - Task 3.3)
    try {
      await dispatchReservationRejected({
        userName: updated.userName,
        userEmail: updated.userEmail,
        userPhone: updated.userPhone,
        reservationCode: updated.code,
        roomCode: updated.roomCode,
        rejectionReason: rejectionReason.trim(),
        userId: updated.userId,
      });
    } catch (notifErr) {
      console.warn('[Notification] Gagal mengirim notifikasi reservasi ditolak:', notifErr);
    }

    return {
      success: true,
      message: `Reservasi ${reservationCode} telah ditolak. Alasan penolakan diteruskan ke calon penghuni.`,
      data: updated,
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Gagal menolak reservasi' };
  }
}

export async function rejectReservationAction(reservationCode: string, rejectionReason: string) {
  return rejectReservation(reservationCode, rejectionReason);
}

/**
 * 4. JOB PEMBATALAN RESERVASI KEDALUWARSA (PRD Bab 5.C & Bab 11 Task 2.5)
 * Membatalkan reservasi APPROVED yang invoice-nya tidak dibayar dalam 24 jam,
 * mengembalikan kamar ke status TERSEDIA dan menandai invoice EXPIRED.
 * Menulis ke audit_logs dan memanggil revalidateTag("rooms").
 */
export async function cancelExpiredReservations(): Promise<{
  success: boolean;
  cancelledCount: number;
  codes: string[];
}> {
  try {
    const result = await dbCancelExpiredReservations();

    if (result.cancelledCount > 0) {
      await dbAddAuditLog({
        userId: 'system-cron',
        action: 'CANCEL_EXPIRED_RESERVATIONS',
        entityType: 'RESERVATION',
        entityId: 'batch',
        payloadAfter: { count: result.cancelledCount, codes: result.codes },
      });

      try {
        revalidateTag('rooms');
      } catch {
        // Abaikan jika dipanggil di luar konteks tag cache
      }
      revalidatePath('/pengelola/reservasi');
      revalidatePath('/pengelola/kamar');
      revalidatePath('/pengelola/dashboard');
      revalidatePath('/calon');
      revalidatePath('/calon/reservasi');
      revalidatePath('/kamar');
      revalidatePath('/');
    }

    return {
      success: true,
      cancelledCount: result.cancelledCount,
      codes: result.codes,
    };
  } catch (error: any) {
    console.error('Error in cancelExpiredReservations:', error);
    return {
      success: false,
      cancelledCount: 0,
      codes: [],
    };
  }
}

export async function cancelExpiredReservationsAction() {
  return cancelExpiredReservations();
}

/**
 * Mengambil detail reservasi berdasarkan kode reservasi
 */
export async function fetchReservationByCodeAction(
  code: string
): Promise<ActionResponse<Reservation>> {
  try {
    if (!code) {
      return { success: false, message: 'Kode reservasi tidak valid' };
    }

    const reservation = await dbGetReservationByCode(code);
    if (!reservation) {
      return { success: false, message: `Reservasi dengan kode ${code} tidak ditemukan` };
    }

    return {
      success: true,
      message: 'Data reservasi berhasil diambil',
      data: reservation,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal memuat reservasi',
    };
  }
}

/**
 * Mengambil seluruh reservasi milik calon penghuni
 */
export async function fetchMyReservationsAction(
  email: string = 'anisa@example.com'
): Promise<Reservation[]> {
  try {
    return await dbGetReservationsByUserEmail(email);
  } catch (error) {
    console.error('Error in fetchMyReservationsAction:', error);
    return [];
  }
}

/**
 * Mengambil seluruh daftar reservasi untuk pengelola
 */
export async function fetchAllReservationsAction(
  statusFilter?: string,
  searchQuery?: string
): Promise<Reservation[]> {
  try {
    let list = await dbGetReservations();

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.roomCode.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          r.userPhone.includes(q)
      );
    }

    return list;
  } catch (error) {
    console.error('Error in fetchAllReservationsAction:', error);
    return [];
  }
}



/**
 * Server Action: Menghasilkan Signed URL KTP privat berumur 5 menit (300 detik)
 * Sesuai Dokumen PRD Bab 8 & Bab 11 Task 3.4
 * Otorisasi: ADMIN atau PENGELOLA
 */
export async function getSignedKtpUrlAction(
  ktpPath: string
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    await requireRole(['ADMIN', 'PENGELOLA']);
    if (!ktpPath || ktpPath.trim() === '') {
      return { success: false, error: 'Tautan KTP tidak ditemukan.' };
    }
    const signedUrl = createSignedKtpUrl(ktpPath, 300);
    return { success: true, signedUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Akses KTP tidak diizinkan.' };
  }
}



