import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { paymentGateway } from '@/lib/payment/gateway';

/**
 * Task 3.7: Unit Test Verifikasi Signature Midtrans
 * Memverifikasi integritas algoritma signature SHA-512 sesuai PRD Bab 7 & Bab 10:
 * Formula: SHA512(order_id + status_code + gross_amount + Server_Key)
 */
describe('Midtrans Signature Verification (SHA-512)', () => {
  const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-sample-key';

  const generateSignature = (
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string = SERVER_KEY
  ): string => {
    const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash('sha512').update(raw).digest('hex');
  };

  it('harus memvalidasi signature yang valid dan sah dengan hasil true', () => {
    const orderId = 'INV-202506-00045';
    const statusCode = '200';
    const grossAmount = '1100000.00';
    const signature = generateSignature(orderId, statusCode, grossAmount);

    const isValid = paymentGateway.verifySignature(orderId, statusCode, grossAmount, signature);
    expect(isValid).toBe(true);
  });

  it('harus menolak jika order_id dimanipulasi', () => {
    const originalOrderId = 'INV-202506-00045';
    const tamperedOrderId = 'INV-202506-00046';
    const statusCode = '200';
    const grossAmount = '1100000.00';
    const signature = generateSignature(originalOrderId, statusCode, grossAmount);

    const isValid = paymentGateway.verifySignature(tamperedOrderId, statusCode, grossAmount, signature);
    expect(isValid).toBe(false);
  });

  it('harus menolak jika status_code dimanipulasi (misal dari 201 ke 200)', () => {
    const orderId = 'INV-202506-00045';
    const statusCodeReal = '201'; // pending
    const statusCodeTampered = '200'; // settlement
    const grossAmount = '1100000.00';
    const signature = generateSignature(orderId, statusCodeReal, grossAmount);

    const isValid = paymentGateway.verifySignature(orderId, statusCodeTampered, grossAmount, signature);
    expect(isValid).toBe(false);
  });

  it('harus menolak jika gross_amount nominal pembayaran diubah penyerang', () => {
    const orderId = 'INV-202506-00045';
    const statusCode = '200';
    const realAmount = '1100000.00';
    const tamperedAmount = '10000.00'; // Mencoba bayar Rp 10.000 bukan Rp 1.100.000
    const signature = generateSignature(orderId, statusCode, realAmount);

    const isValid = paymentGateway.verifySignature(orderId, statusCode, tamperedAmount, signature);
    expect(isValid).toBe(false);
  });

  it('harus menolak jika signature dibuat menggunakan Server Key palsu', () => {
    const orderId = 'INV-202506-00045';
    const statusCode = '200';
    const grossAmount = '1100000.00';
    const fakeServerKey = 'FAKE-SERVER-KEY-12345';
    const fakeSignature = generateSignature(orderId, statusCode, grossAmount, fakeServerKey);

    const isValid = paymentGateway.verifySignature(orderId, statusCode, grossAmount, fakeSignature);
    expect(isValid).toBe(false);
  });

  it('harus mendukung perbandingan hex signature case-insensitive (huruf besar/kecil)', () => {
    const orderId = 'INV-202506-00048';
    const statusCode = '200';
    const grossAmount = '2200000.00';
    const signature = generateSignature(orderId, statusCode, grossAmount);

    const upperCaseSignature = signature.toUpperCase();
    const lowerCaseSignature = signature.toLowerCase();

    expect(paymentGateway.verifySignature(orderId, statusCode, grossAmount, upperCaseSignature)).toBe(true);
    expect(paymentGateway.verifySignature(orderId, statusCode, grossAmount, lowerCaseSignature)).toBe(true);
  });

  it('harus mengembalikan false jika parameter kosong atau tidak lengkap', () => {
    const signature = generateSignature('INV-1', '200', '1000');

    expect(paymentGateway.verifySignature('', '200', '1000', signature)).toBe(false);
    expect(paymentGateway.verifySignature('INV-1', '', '1000', signature)).toBe(false);
    expect(paymentGateway.verifySignature('INV-1', '200', '', signature)).toBe(false);
    expect(paymentGateway.verifySignature('INV-1', '200', '1000', '')).toBe(false);
  });
});
