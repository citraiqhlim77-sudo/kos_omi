import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock otentikasi server agar unit test berjalan terisolasi tanpa sesi browser
vi.mock('@/lib/auth-server', () => ({
  requireRole: vi.fn().mockResolvedValue({
    id: 'usr-admin-mock',
    name: 'Admin Pengelola Test',
    email: 'pengelola@kosomi.id',
    role: 'PENGELOLA',
    isActive: true,
  }),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: 'usr-admin-mock',
    name: 'Admin Pengelola Test',
    email: 'pengelola@kosomi.id',
    role: 'PENGELOLA',
    isActive: true,
  }),
}));

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { dbGetRoomByCode, dbUpdateRoomStatus, dbGetRooms } from '@/server/db';
import { checkInTenant, checkOutTenant } from '@/actions/tenancy';
import { RoomStatus } from '@/types/room';

/**
 * Task 3.7: Unit Test Transisi Status Kamar
 * Memverifikasi state machine siklus kamar Kos Omi sesuai PRD Bab 5 & Bab 11:
 * Siklus: TERSEDIA -> DIPESAN -> TERISI -> TERSEDIA (atau NONAKTIF)
 */
describe('Room Status State Machine Transitions', () => {
  const TEST_ROOM_CODE = 'A-101';

  beforeEach(async () => {
    // Reset status kamar A-101 ke TERSEDIA untuk isolasi pengujian
    await dbUpdateRoomStatus(TEST_ROOM_CODE, 'TERSEDIA');
  });

  it('harus membaca status awal kamar sebagai TERSEDIA', async () => {
    const room = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(room).not.toBeNull();
    expect(room?.status).toBe('TERSEDIA');
  });

  it('harus berhasil mengubah status kamar dari TERSEDIA menjadi DIPESAN saat reservasi disetujui', async () => {
    const updated = await dbUpdateRoomStatus(TEST_ROOM_CODE, 'DIPESAN');
    expect(updated).toBe(true);

    const room = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(room?.status).toBe('DIPESAN');
  });

  it('harus berhasil mengubah status kamar dari DIPESAN menjadi TERISI saat check-in penghuni', async () => {
    // 1. Kamar awalnya dipesan
    await dbUpdateRoomStatus(TEST_ROOM_CODE, 'DIPESAN');

    // 2. Transisi check-in menjadi TERISI
    const checkinUpdated = await dbUpdateRoomStatus(TEST_ROOM_CODE, 'TERISI');
    expect(checkinUpdated).toBe(true);

    const room = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(room?.status).toBe('TERISI');
  });

  it('harus berhasil mengembalikan status kamar dari TERISI menjadi TERSEDIA saat check-out penghuni', async () => {
    // 1. Kamar awalnya terisi
    await dbUpdateRoomStatus(TEST_ROOM_CODE, 'TERISI');

    // 2. Transisi check-out menjadi TERSEDIA kembali
    const checkoutUpdated = await dbUpdateRoomStatus(TEST_ROOM_CODE, 'TERSEDIA');
    expect(checkoutUpdated).toBe(true);

    const room = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(room?.status).toBe('TERSEDIA');
  });

  it('harus dapat menonaktifkan kamar menjadi NONAKTIF untuk pemeliharaan/perbaikan', async () => {
    const nonaktifUpdated = await dbUpdateRoomStatus(TEST_ROOM_CODE, 'NONAKTIF');
    expect(nonaktifUpdated).toBe(true);

    const room = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(room?.status).toBe('NONAKTIF');

    // Dapat diaktifkan kembali menjadi TERSEDIA
    await dbUpdateRoomStatus(TEST_ROOM_CODE, 'TERSEDIA');
    const roomReactivated = await dbGetRoomByCode(TEST_ROOM_CODE);
    expect(roomReactivated?.status).toBe('TERSEDIA');
  });

  it('harus menolak check-in jika reservasi tidak ditemukan atau belum berstatus LUNAS', async () => {
    // Simulasi pemanggilan checkInTenant dengan ID reservasi fiktif yang belum lunas
    const result = await checkInTenant('rsv-invalid-unpaid');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('harus menolak check-out jika penghuni tidak ditemukan atau memiliki tunggakan tanpa konfirmasi', async () => {
    const result = await checkOutTenant('ten-invalid-id', false);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
