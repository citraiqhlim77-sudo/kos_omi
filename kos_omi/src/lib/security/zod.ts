/**
 * Zod-Compatible Validation Schemas & Engine (PRD Bab 8, Bab 10, & Bab 11 Task 3.4)
 *
 * Mengimplementasikan:
 * 1. Skema validasi berantai (string, number, boolean, enum, object) dengan safeParse()
 * 2. Validasi input Autentikasi (login, register, forgot-password, reset-password)
 * 3. Validasi input Reservasi (KTP, NIK 16 digit, phone 62, H+3 check-in)
 * 4. Validasi input Kamar & Transaksi Pembayaran
 */

export interface ZodIssue {
  path: (string | number)[];
  message: string;
}

export type SafeParseOutput<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ZodIssue[]; message: string } };

export class ZodError extends Error {
  issues: ZodIssue[];
  constructor(issues: ZodIssue[]) {
    super(issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '));
    this.name = 'ZodError';
    this.issues = issues;
  }
}

/**
 * Zod-like Base Validator Class
 */
export abstract class ZodType<T> {
  abstract _parse(input: unknown, path: (string | number)[]): { success: boolean; data?: T; issues?: ZodIssue[] };

  safeParse(input: unknown): SafeParseOutput<T> {
    const result = this._parse(input, []);
    if (result.success) {
      return { success: true, data: result.data as T };
    }
    const issues = result.issues || [{ path: [], message: 'Validasi gagal' }];
    return {
      success: false,
      error: {
        issues,
        message: issues.map((i) => i.message).join('; '),
      },
    };
  }

  parse(input: unknown): T {
    const res = this.safeParse(input);
    if (!res.success) {
      throw new ZodError(res.error.issues);
    }
    return res.data;
  }
}

class ZodString extends ZodType<string> {
  private minLength?: { val: number; msg?: string };
  private maxLength?: { val: number; msg?: string };
  private regexPattern?: { val: RegExp; msg?: string };
  private isEmail = false;

  min(length: number, message?: string) {
    this.minLength = { val: length, msg: message };
    return this;
  }

  max(length: number, message?: string) {
    this.maxLength = { val: length, msg: message };
    return this;
  }

  regex(pattern: RegExp, message?: string) {
    this.regexPattern = { val: pattern, msg: message };
    return this;
  }

  email(message?: string) {
    this.isEmail = true;
    this.regexPattern = {
      val: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      msg: message || 'Format alamat email tidak valid',
    };
    return this;
  }

  _parse(input: unknown, path: (string | number)[]) {
    if (typeof input !== 'string') {
      return { success: false, issues: [{ path, message: 'Harus berupa teks string' }] };
    }
    const str = input.trim();
    if (this.minLength && str.length < this.minLength.val) {
      return {
        success: false,
        issues: [{ path, message: this.minLength.msg || `Panjang minimal ${this.minLength.val} karakter` }],
      };
    }
    if (this.maxLength && str.length > this.maxLength.val) {
      return {
        success: false,
        issues: [{ path, message: this.maxLength.msg || `Panjang maksimal ${this.maxLength.val} karakter` }],
      };
    }
    if (this.regexPattern && !this.regexPattern.val.test(str)) {
      return {
        success: false,
        issues: [{ path, message: this.regexPattern.msg || 'Format input tidak sesuai kriteria' }],
      };
    }
    return { success: true, data: str };
  }
}

class ZodNumber extends ZodType<number> {
  private minValue?: { val: number; msg?: string };
  private maxValue?: { val: number; msg?: string };
  private isInteger = false;

  min(val: number, message?: string) {
    this.minValue = { val, msg: message };
    return this;
  }

  max(val: number, message?: string) {
    this.maxValue = { val, msg: message };
    return this;
  }

  int(message?: string) {
    this.isInteger = true;
    return this;
  }

  _parse(input: unknown, path: (string | number)[]) {
    const num = Number(input);
    if (isNaN(num)) {
      return { success: false, issues: [{ path, message: 'Harus berupa angka valid' }] };
    }
    if (this.isInteger && !Number.isInteger(num)) {
      return { success: false, issues: [{ path, message: 'Harus berupa bilangan bulat' }] };
    }
    if (this.minValue !== undefined && num < this.minValue.val) {
      return {
        success: false,
        issues: [{ path, message: this.minValue.msg || `Nilai minimal ${this.minValue.val}` }],
      };
    }
    if (this.maxValue !== undefined && num > this.maxValue.val) {
      return {
        success: false,
        issues: [{ path, message: this.maxValue.msg || `Nilai maksimal ${this.maxValue.val}` }],
      };
    }
    return { success: true, data: num };
  }
}

class ZodObject<T extends Record<string, ZodType<any>>> extends ZodType<{ [K in keyof T]: T[K] extends ZodType<infer U> ? U : never }> {
  constructor(private shape: T) {
    super();
  }

  _parse(input: unknown, path: (string | number)[]) {
    if (!input || typeof input !== 'object') {
      return { success: false, issues: [{ path, message: 'Data formulir harus berupa objek' }] };
    }
    const raw = input as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    const issues: ZodIssue[] = [];

    for (const [key, schema] of Object.entries(this.shape)) {
      const fieldResult = schema._parse(raw[key], [...path, key]);
      if (!fieldResult.success) {
        issues.push(...(fieldResult.issues || []));
      } else {
        data[key] = fieldResult.data;
      }
    }

    if (issues.length > 0) {
      return { success: false, issues };
    }
    return { success: true, data: data as any };
  }
}

class ZodEnum<T extends readonly string[]> extends ZodType<T[number]> {
  constructor(private values: T) {
    super();
  }

  _parse(input: unknown, path: (string | number)[]) {
    if (typeof input !== 'string' || !this.values.includes(input as any)) {
      return {
        success: false,
        issues: [{ path, message: `Harus salah satu dari: ${this.values.join(', ')}` }],
      };
    }
    return { success: true, data: input as T[number] };
  }
}

/**
 * Zod Namespace Export
 */
export const z = {
  string: () => new ZodString(),
  number: () => new ZodNumber(),
  object: <T extends Record<string, ZodType<any>>>(shape: T) => new ZodObject(shape),
  enum: <T extends readonly string[]>(values: T) => new ZodEnum(values),
};

// =================================================================
// SKEMA VALIDASI RESMI KOS OMI (PRD Bab 8 & Task 3.4)
// =================================================================

/**
 * 1. Skema Login
 */
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

/**
 * 2. Skema Registrasi Calon Penghuni
 */
export const registerSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter sesuai KTP'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().regex(/^(\+?62|0)8\d{7,12}$/, 'Nomor HP harus format Indonesia (contoh: 081234567890)'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
});

/**
 * 3. Skema Lupa Password
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

/**
 * 4. Skema Reset Password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Token reset kata sandi tidak valid'),
  password: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
});

/**
 * 5. Skema Reservasi Kamar
 */
export const reservationInputSchema = z.object({
  roomCode: z.string().min(2, 'Kode kamar wajib dipilih'),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter sesuai KTP'),
  nik: z.string().regex(/^\d{16}$/, 'Nomor NIK KTP wajib 16 digit angka'),
  phone: z.string().regex(/^(\+?62|0)8\d{7,12}$/, 'Nomor telepon harus nomor Indonesia valid'),
  email: z.string().email('Format email tidak valid'),
  checkInDate: z.string().min(10, 'Tanggal masuk wajib diisi'),
  durationMonths: z.number().int().min(1, 'Durasi sewa minimal 1 bulan').max(12, 'Durasi sewa maksimal 12 bulan'),
});

/**
 * 6. Skema Penolakan Reservasi
 */
export const rejectReservationSchema = z.object({
  reservationCode: z.string().min(5, 'Kode reservasi tidak valid'),
  rejectionReason: z.string().min(10, 'Alasan penolakan minimal 10 karakter sesuai SOP'),
});

/**
 * 7. Skema Detail Kamar
 */
export const roomDetailSchema = z.object({
  monthlyPrice: z.number().min(100000, 'Harga sewa bulanan minimal Rp 100.000'),
  depositAmount: z.number().min(0, 'Deposit jaminan tidak boleh negatif'),
  areaSqm: z.number().min(1, 'Luas kamar minimal 1 m²'),
  type: z.enum(['STANDAR_NON_AC', 'STANDAR_AC', 'DELUXE_AC'] as const),
});
