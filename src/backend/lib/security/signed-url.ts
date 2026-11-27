/**
 * Layanan Signed URL KTP Berumur 5 Menit (PRD Bab 8 & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. Tautan bertanda tangan kriptografi (HMAC-SHA256) untuk berkas privat KTP
 * 2. Waktu kedaluwarsa ketat: 5 menit (300 detik)
 * 3. Pencegahan akses langsung tanpa izin / manipulasi URL parameter
 * 4. Verifikasi tanda tangan dengan proteksi timing attack (timingSafeEqual)
 */

import { createHmac, timingSafeEqual } from 'crypto';

const SIGNED_URL_SECRET =
  process.env.AUTH_SECRET || 'kos-omi-ktp-signed-url-secret-minimum-32-chars';

export interface VerifySignedUrlResult {
  valid: boolean;
  reason?: string;
  file?: string;
}

/**
 * Menghasilkan URL bertanda tangan (Signed URL) dengan masa aktif 5 menit (300 detik)
 */
export function createSignedKtpUrl(
  filePathOrKey: string,
  expiresInSeconds: number = 300,
  origin: string = ''
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const cleanPath = filePathOrKey.trim();

  const dataToSign = `ktp:${cleanPath}:${expiresAt}`;
  const signature = createHmac('sha256', SIGNED_URL_SECRET)
    .update(dataToSign)
    .digest('hex');

  const query = new URLSearchParams({
    file: cleanPath,
    expires: expiresAt.toString(),
    sig: signature,
  });

  const path = `/api/ktp/view?${query.toString()}`;
  return origin ? `${origin.replace(/\/$/, '')}${path}` : path;
}

/**
 * Memverifikasi validitas tanda tangan dan waktu kedaluwarsa Signed URL
 */
export function verifySignedKtpUrl(
  filePathOrKey: string,
  expires: string | number,
  signature: string
): VerifySignedUrlResult {
  if (!filePathOrKey || !expires || !signature) {
    return {
      valid: false,
      reason: 'Parameter signed URL tidak lengkap (file, expires, atau signature hilang).',
    };
  }

  const expiresNum = typeof expires === 'string' ? parseInt(expires, 10) : expires;
  if (isNaN(expiresNum)) {
    return { valid: false, reason: 'Format stempel waktu kedaluwarsa tidak valid.' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);

  // 1. Cek masa aktif (5 menit)
  if (nowSeconds > expiresNum) {
    return {
      valid: false,
      reason: 'Tautan akses berkas KTP telah kedaluwarsa (masa berlaku 5 menit). Silakan muat ulang halaman untuk mendapatkan tautan baru.',
    };
  }

  // 2. Hitung ulang HMAC yang diharapkan
  const dataToSign = `ktp:${filePathOrKey.trim()}:${expiresNum}`;
  const expectedSig = createHmac('sha256', SIGNED_URL_SECRET)
    .update(dataToSign)
    .digest('hex');

  // 3. Bandingkan tanda tangan secara aman (Constant-time comparison)
  try {
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSig, 'hex');

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return {
        valid: false,
        reason: 'Tanda tangan digital tautan KTP tidak sah atau URL telah dimanipulasi.',
      };
    }
  } catch {
    return {
      valid: false,
      reason: 'Format tanda tangan digital tidak valid.',
    };
  }

  return {
    valid: true,
    file: filePathOrKey,
  };
}
