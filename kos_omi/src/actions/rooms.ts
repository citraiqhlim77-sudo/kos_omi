'use server';

import {
  dbGetRooms,
  dbGetRoomByCode,
  dbGetRoomStats,
  dbUpdateRoomStatus,
  dbUpdateRoomDetail,
  dbGetRoomTenantHistory,
  dbAddAuditLog,
} from '@/server/db';
import {
  Room,
  RoomFilterOptions,
  RoomStatus,
  TenantHistoryItem,
  UpdateRoomDetailInput,
} from '@/types/room';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireRole } from '@/lib/auth-server';
import { updateRoomDetailSchema } from '@/lib/validations/room';
import { sanitizeString } from '@/lib/security/sanitize';

export interface RoomActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 1. GET ROOMS (PRD Bab 11 Task 2.4)
 * Mengambil daftar seluruh kamar dengan opsi filter dan sorting
 */
export async function getRooms(filter?: RoomFilterOptions): Promise<Room[]> {
  try {
    return await dbGetRooms(filter);
  } catch (error) {
    console.error('Error in getRooms:', error);
    return [];
  }
}

// Alias untuk kompatibilitas modul frontend
export async function fetchRoomsAction(filter?: RoomFilterOptions): Promise<Room[]> {
  return getRooms(filter);
}

/**
 * Mengambil detail kamar berdasarkan kode spesifik (contoh: 'A-101') atau ID
 */
export async function fetchRoomByCodeAction(codeOrId: string): Promise<Room | null> {
  try {
    if (!codeOrId) return null;
    return await dbGetRoomByCode(codeOrId);
  } catch (error) {
    console.error('Error in fetchRoomByCodeAction:', error);
    return null;
  }
}

/**
 * Mengambil riwayat penghuni untuk kamar tertentu
 */
export async function fetchRoomTenantHistoryAction(codeOrId: string): Promise<TenantHistoryItem[]> {
  try {
    if (!codeOrId) return [];
    return await dbGetRoomTenantHistory(codeOrId);
  } catch (error) {
    console.error('Error in fetchRoomTenantHistoryAction:', error);
    return [];
  }
}

/**
 * Mengambil statistik real-time 67 kamar (Tersedia, Dipesan, Terisi, Perawatan)
 */
export async function fetchRoomStatsAction() {
  try {
    return await dbGetRoomStats();
  } catch (error) {
    console.error('Error in fetchRoomStatsAction:', error);
    return { total: 67, available: 0, booked: 0, occupied: 0, maintenance: 0 };
  }
}

/**
 * Mengambil kamar unggulan berstatus TERSEDIA untuk beranda publik
 */
export async function fetchFeaturedRoomsAction(limit: number = 4): Promise<Room[]> {
  try {
    const rooms = await dbGetRooms({ status: 'TERSEDIA' });
    return rooms.slice(0, limit);
  } catch (error) {
    console.error('Error in fetchFeaturedRoomsAction:', error);
    return [];
  }
}

/**
 * 2. UPDATE ROOM STATUS (PRD Bab 5.B & Bab 11 Task 2.4)
 * Otorisasi: Pengelola atau Admin.
 * Validasi ketat transisi status SOP Kos Omi:
 * - TERISI -> tidak boleh langsung ke TERSEDIA (harus via check-out).
 * - DIPESAN -> tidak boleh langsung ke TERSEDIA (harus via tolak/batal reservasi).
 * - TERISI / DIPESAN -> tidak boleh langsung ke NONAKTIF.
 * Menulis ke audit_logs dan memanggil revalidateTag("rooms").
 */
export async function updateRoomStatus(
  idOrCode: string,
  targetStatus: RoomStatus,
  reason?: string
): Promise<RoomActionResult<Room>> {
  try {
    // 1. Otorisasi peran (hanya ADMIN dan PENGELOLA)
    const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);

    const currentRoom = await dbGetRoomByCode(idOrCode);
    if (!currentRoom) {
      return { success: false, message: `Kamar ${idOrCode} tidak ditemukan` };
    }

    const currentStatus = currentRoom.status;

    // 2. Validasi Transisi Status SOP Kos Omi (PRD Bab 5.B):
    if (currentStatus === targetStatus) {
      return { success: true, message: `Status kamar sudah ${targetStatus}`, data: currentRoom };
    }

    // Kamar TERISI tidak dapat diubah langsung ke TERSEDIA tanpa proses check-out resmi
    if (currentStatus === 'TERISI' && targetStatus === 'TERSEDIA') {
      return {
        success: false,
        message: 'Kamar TERISI tidak dapat diubah manual ke TERSEDIA. Gunakan modul Proses Check-out.',
      };
    }

    // Kamar DIPESAN tidak dapat diubah langsung ke TERSEDIA tanpa pembatalan reservasi
    if (currentStatus === 'DIPESAN' && targetStatus === 'TERSEDIA') {
      return {
        success: false,
        message: 'Kamar DIPESAN tidak dapat diubah manual ke TERSEDIA. Batalkan reservasi terkait terlebih dahulu.',
      };
    }

    // Kamar TERISI atau DIPESAN tidak boleh langsung diubah ke NONAKTIF jika ada penghuni/booking aktif
    if ((currentStatus === 'TERISI' || currentStatus === 'DIPESAN') && targetStatus === 'NONAKTIF') {
      return {
        success: false,
        message: `Kamar sedang ${currentStatus}. Selesaikan hunian/reservasi sebelum mengubah ke status Perawatan (NONAKTIF).`,
      };
    }

    const ok = await dbUpdateRoomStatus(idOrCode, targetStatus);
    if (!ok) {
      return { success: false, message: 'Gagal memperbarui status kamar di database' };
    }

    const updated = await dbGetRoomByCode(idOrCode);

    // 3. Catat perubahan ke audit_logs (PRD Bab 10 & Bab 11 Task 2.4)
    await dbAddAuditLog({
      userId: currentUser.id,
      action: 'ROOM_STATUS_UPDATED',
      entityType: 'ROOM',
      entityId: currentRoom.code,
      payloadBefore: { status: currentStatus },
      payloadAfter: {
        status: targetStatus,
        reason: reason || 'Pembaruan status operasional oleh pengelola',
      },
    });

    // 4. Invalidation Cache: revalidateTag("rooms") & revalidatePath (PRD Task 2.4)
    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika dipanggil di luar konteks tag cache Next.js
    }
    revalidatePath('/pengelola/kamar');
    revalidatePath(`/pengelola/kamar/${currentRoom.code}`);
    revalidatePath('/pengelola/dashboard');
    revalidatePath('/kamar');
    revalidatePath(`/kamar/${currentRoom.code}`);
    revalidatePath('/');

    return {
      success: true,
      message: `Status kamar ${currentRoom.code} berhasil diubah menjadi ${targetStatus}`,
      data: updated || undefined,
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Terjadi kesalahan sistem saat memperbarui status kamar' };
  }
}

// Alias untuk kompatibilitas form & modal status kamar
export async function updateRoomStatusAction(
  code: string,
  targetStatus: RoomStatus,
  reason?: string
): Promise<RoomActionResult<Room>> {
  return updateRoomStatus(code, targetStatus, reason);
}

/**
 * 3. UPDATE ROOM DETAIL (PRD Bab 5.B & Bab 11 Task 2.4)
 * Otorisasi: Pengelola atau Admin.
 * Memperbarui data detail kamar (harga sewa, deposit, luas, tipe, fasilitas, deskripsi) memakai Zod schema.
 * Menulis ke audit_logs dan memanggil revalidateTag("rooms").
 */
export async function updateRoomDetail(
  idOrCode: string,
  input: UpdateRoomDetailInput | Record<string, unknown>
): Promise<RoomActionResult<Room>> {
  try {
    // 1. Otorisasi peran
    const currentUser = await requireRole(['ADMIN', 'PENGELOLA']);

    // 2. Validasi input memakai skema Zod (PRD Task 2.4)
    const validationResult = updateRoomDetailSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.message || 'Validasi formulir detail kamar gagal',
      };
    }

    const validatedData = validationResult.data;

    const currentRoom = await dbGetRoomByCode(idOrCode);
    if (!currentRoom) {
      return { success: false, message: `Kamar ${idOrCode} tidak ditemukan` };
    }

    const sanitizedDescription = sanitizeString(validatedData.description || '');
    const sanitizedFacilities = (validatedData.facilities || []).map((f) => sanitizeString(f));

    const updated = await dbUpdateRoomDetail(idOrCode, {
      monthlyPrice: validatedData.monthlyPrice,
      depositAmount: validatedData.depositAmount,
      areaSqm: validatedData.areaSqm,
      type: validatedData.type,
      facilities: sanitizedFacilities,
      description: sanitizedDescription,
    });

    if (!updated) {
      return { success: false, message: `Kamar ${idOrCode} tidak ditemukan di database` };
    }

    // 3. Catat perubahan ke audit_logs (PRD Bab 10 & Bab 11 Task 2.4)
    await dbAddAuditLog({
      userId: currentUser.id,
      action: 'ROOM_DETAIL_UPDATED',
      entityType: 'ROOM',
      entityId: currentRoom.code,
      payloadBefore: {
        monthlyPrice: currentRoom.monthlyPrice,
        depositAmount: currentRoom.depositAmount,
        type: currentRoom.type,
        facilities: currentRoom.facilities,
        areaSqm: currentRoom.areaSqm,
        description: currentRoom.description,
      },
      payloadAfter: {
        monthlyPrice: validatedData.monthlyPrice,
        depositAmount: validatedData.depositAmount,
        type: validatedData.type,
        facilities: validatedData.facilities,
        areaSqm: validatedData.areaSqm,
        description: validatedData.description,
      },
    });

    // 4. Invalidation Cache: revalidateTag("rooms") & revalidatePath (PRD Task 2.4)
    try {
      revalidateTag('rooms');
    } catch {
      // Abaikan jika dipanggil di luar konteks tag cache Next.js
    }
    revalidatePath('/pengelola/kamar');
    revalidatePath(`/pengelola/kamar/${currentRoom.code}`);
    revalidatePath('/pengelola/dashboard');
    revalidatePath('/kamar');
    revalidatePath(`/kamar/${currentRoom.code}`);
    revalidatePath('/');

    return {
      success: true,
      message: `Data kamar ${currentRoom.code} berhasil diperbarui`,
      data: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Terjadi kesalahan saat menyimpan data kamar',
    };
  }
}

// Alias untuk kompatibilitas form & modal edit kamar
export async function updateRoomDetailAction(
  code: string,
  input: UpdateRoomDetailInput
): Promise<RoomActionResult<Room>> {
  return updateRoomDetail(code, input);
}
