/**
 * Validasi Form Autentikasi Kos Omi (Client & Server compatible)
 */

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Alamat email wajib diisi';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Format alamat email tidak valid (contoh: nama@domain.com)';
  }
  return null;
}

export function validatePassword(password: string, minLength = 8): string | null {
  if (!password) {
    return 'Kata sandi wajib diisi';
  }
  if (password.length < minLength) {
    return `Kata sandi minimal ${minLength} karakter`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Kata sandi harus mengandung kombinasi huruf dan angka';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return 'Nomor WhatsApp / HP wajib diisi';
  }
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (!/^(08|628|\+628)[0-9]{8,12}$/.test(cleanPhone)) {
    return 'Nomor WhatsApp harus berformat Indonesia valid (contoh: 081234567890)';
  }
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Nama lengkap sesuai KTP wajib diisi';
  }
  if (name.trim().length < 3) {
    return 'Nama lengkap minimal 3 karakter';
  }
  return null;
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: string;
  colorClass: string;
} {
  if (!password) return { score: 0, label: 'Belum diisi', colorClass: 'bg-slate-200' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score: 1, label: 'Lemah', colorClass: 'bg-rose-500' };
  } else if (score === 2) {
    return { score: 2, label: 'Cukup', colorClass: 'bg-amber-500' };
  } else if (score === 3) {
    return { score: 3, label: 'Kuat', colorClass: 'bg-emerald-500' };
  } else {
    return { score: 4, label: 'Sangat Kuat', colorClass: 'bg-emerald-600' };
  }
}
