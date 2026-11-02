import type { RoomType } from '@/types/room';

/**
 * Validasi Skema Detail Kamar (Zod-compatible safeParse API)
 * Sesuai PRD Bab 5.B & Bab 11 Task 2.4:
 * - monthlyPrice: angka minimal Rp 100.000
 * - depositAmount: angka minimal Rp 0 (tidak boleh negatif)
 * - areaSqm: luas kamar minimal 1 m²
 * - type: salah satu dari STANDAR_NON_AC, STANDAR_AC, DELUXE_AC
 * - facilities: daftar fasilitas (opsional, array string)
 * - description: deskripsi kamar (opsional, string)
 */

export interface RoomDetailSchemaInput {
  monthlyPrice: number;
  depositAmount: number;
  areaSqm: number;
  type: RoomType;
  facilities?: string[];
  description?: string;
}

export interface ValidationErrorItem {
  path: (string | number)[];
  message: string;
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        message: string;
        errors: ValidationErrorItem[];
      };
    };

export const updateRoomDetailSchema = {
  safeParse(input: unknown): SafeParseResult<RoomDetailSchemaInput> {
    if (!input || typeof input !== 'object') {
      return {
        success: false,
        error: {
          message: 'Data formulir kamar wajib diisi',
          errors: [{ path: [''], message: 'Data formulir kamar wajib diisi' }],
        },
      };
    }

    const raw = input as Record<string, unknown>;
    const errors: ValidationErrorItem[] = [];

    // 1. Validasi Harga Sewa Bulanan
    const monthlyPrice = Number(raw.monthlyPrice);
    if (isNaN(monthlyPrice) || monthlyPrice < 100000) {
      errors.push({
        path: ['monthlyPrice'],
        message: 'Harga sewa bulanan minimal Rp 100.000',
      });
    }

    // 2. Validasi Deposit
    const depositAmount = Number(raw.depositAmount);
    if (isNaN(depositAmount) || depositAmount < 0) {
      errors.push({
        path: ['depositAmount'],
        message: 'Nominal deposit tidak boleh bernilai negatif',
      });
    }

    // 3. Validasi Luas Kamar
    const areaSqm = Number(raw.areaSqm);
    if (isNaN(areaSqm) || areaSqm < 1) {
      errors.push({
        path: ['areaSqm'],
        message: 'Luas kamar minimal 1 m²',
      });
    }

    // 4. Validasi Tipe Kamar
    const validTypes: RoomType[] = ['STANDAR_NON_AC', 'STANDAR_AC', 'DELUXE_AC'];
    const type = raw.type as RoomType;
    if (!validTypes.includes(type)) {
      errors.push({
        path: ['type'],
        message: 'Tipe kamar wajib dipilih (Standar Non-AC, Standar AC, atau Deluxe AC)',
      });
    }

    // 5. Validasi Fasilitas (Array)
    let facilities: string[] = [];
    if (raw.facilities !== undefined) {
      if (!Array.isArray(raw.facilities)) {
        errors.push({
          path: ['facilities'],
          message: 'Daftar fasilitas harus berupa array',
        });
      } else {
        facilities = raw.facilities.map((f) => String(f).trim()).filter(Boolean);
      }
    }

    // 6. Validasi Deskripsi (String)
    let description = '';
    if (raw.description !== undefined) {
      if (typeof raw.description !== 'string') {
        errors.push({
          path: ['description'],
          message: 'Deskripsi kamar harus berupa teks',
        });
      } else {
        description = raw.description.trim();
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: errors.map((e) => e.message).join('. '),
          errors,
        },
      };
    }

    return {
      success: true,
      data: {
        monthlyPrice,
        depositAmount,
        areaSqm,
        type,
        facilities,
        description,
      },
    };
  },
};
