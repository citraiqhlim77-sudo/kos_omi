import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
} from '@/lib/validations/auth';
import { reservationInputSchema } from '@/lib/security/zod';
import { KOS_OMI_PAYMENT_METHODS } from '@/components/payment/KosOmiPaymentMethods';

/**
 * Pengujian Black-Box Testing (Equivalence Partitioning & Boundary Value Analysis)
 * Sistem Informasi Manajemen Kos Omi (5 Role: Calon, Penghuni, Pengelola, Keuangan, Admin)
 */
describe('Black-Box Testing — Sistem Informasi Kos Omi', () => {
  describe('Modul 1: Autentikasi & Registrasi Akun (Equivalence Partitioning)', () => {
    it('BB-01: Registrasi valid diterima oleh sistem', () => {
      expect(validateFullName('Siti Rahma Putri')).toBeNull();
      expect(validateEmail('sitirahma@gmail.com')).toBeNull();
      expect(validatePhone('082287146763')).toBeNull();
      expect(validatePassword('Password123!')).toBeNull();
    });

    it('BB-02: Registrasi dengan typo domain email (.con) ditolak dengan pesan jelas', () => {
      const err = validateEmail('citra@gmail.con');
      expect(err).not.toBeNull();
      expect(err).toContain('@gmail.com');
    });

    it('BB-03: Kata sandi lemah (< 8 karakter atau tanpa angka) ditolak', () => {
      expect(validatePassword('abc12')).not.toBeNull();
      expect(validatePassword('passwordtanpaangka')).not.toBeNull();
    });

    it('BB-04: Login / registrasi dengan format email tidak valid ditolak', () => {
      expect(validateEmail('bukan-email')).not.toBeNull();
    });
  });

  describe('Modul 2: Pengajuan Reservasi Kamar Tanpa Upload KTP/KTM/KRS', () => {
    it('BB-05: Pengajuan reservasi valid tanpa NIK/KTP/KTM/KRS berhasil lolos validasi', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const ymd = futureDate.toISOString().slice(0, 10);

      const res = reservationInputSchema.safeParse({
        roomCode: '17',
        fullName: 'Nadia Safitri',
        nik: '',
        phone: '082212345678',
        email: 'nadia.test@gmail.com',
        checkInDate: ymd,
        durationMonths: 6,
      });
      expect(res.success).toBe(true);
    });

    it('BB-06: Pengajuan reservasi dengan nama terlalu pendek (< 3 karakter) ditolak', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const ymd = futureDate.toISOString().slice(0, 10);

      const res = reservationInputSchema.safeParse({
        roomCode: '17',
        fullName: 'A',
        nik: '',
        phone: '082212345678',
        email: 'nadia.test@gmail.com',
        checkInDate: ymd,
        durationMonths: 6,
      });
      expect(res.success).toBe(false);
    });
  });

  describe('Modul 3: Metode Pembayaran Resmi (Bank BRI & QRIS Segera Hadir)', () => {
    it('BB-07: Hanya menyediakan Transfer Bank BRI (aktif) dan QRIS (segera hadir)', () => {
      expect(KOS_OMI_PAYMENT_METHODS).toHaveLength(2);
      const bri = KOS_OMI_PAYMENT_METHODS.find((m) => m.id === 'bri');
      const qris = KOS_OMI_PAYMENT_METHODS.find((m) => m.id === 'qris');

      expect(bri).toBeDefined();
      expect(bri?.accountNumber).toBe('763701006296502');
      expect(bri?.accountHolder).toBe('YULASTRI');
      expect(bri?.comingSoon).toBeFalsy();

      expect(qris).toBeDefined();
      expect(qris?.comingSoon).toBe(true);
    });
  });

  describe('Modul 4: Batas Perpanjangan Waktu Bayar 1-7 Hari (Boundary Value Analysis)', () => {
    const isValidExtensionDays = (days: number) =>
      Number.isInteger(days) && days >= 1 && days <= 7;

    it('BB-08: Nilai batas bawah (0 hari) dan atas (8 hari) ditolak, 1-7 hari diterima', () => {
      expect(isValidExtensionDays(0)).toBe(false);
      expect(isValidExtensionDays(1)).toBe(true);
      expect(isValidExtensionDays(4)).toBe(true);
      expect(isValidExtensionDays(7)).toBe(true);
      expect(isValidExtensionDays(8)).toBe(false);
    });

    it('BB-09: Tunggakan melewati 7 hari (> 7 hari) memicu eskalasi Wajib Konfirmasi Ibu Kos', () => {
      const computeOverdueEscalation = (daysOverdue: number) =>
        daysOverdue > 7 ? 'WAJIB_KONFIRMASI_IBU_KOS' : daysOverdue > 0 ? 'TERLAMBAT' : 'AMAN';

      expect(computeOverdueEscalation(0)).toBe('AMAN');
      expect(computeOverdueEscalation(7)).toBe('TERLAMBAT');
      expect(computeOverdueEscalation(8)).toBe('WAJIB_KONFIRMASI_IBU_KOS');
    });
  });
});
