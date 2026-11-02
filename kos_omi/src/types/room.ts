export type RoomType = 'STANDAR_NON_AC' | 'STANDAR_AC' | 'DELUXE_AC';

export type RoomStatus = 'TERSEDIA' | 'DIPESAN' | 'TERISI' | 'NONAKTIF';

export interface Room {
  id: string;
  code: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  areaSqm: number;
  monthlyPrice: number;
  depositAmount: number;
  facilities: string[];
  description: string;
  photoUrls: string[];
  bedType?: string;
  windowView?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RoomFilterOptions {
  floor?: number | 'ALL';
  type?: RoomType | 'ALL';
  status?: RoomStatus | 'ALL';
  search?: string;
  sortBy?: 'code-asc' | 'price-asc' | 'price-desc' | 'floor-asc';
}

export interface TenantHistoryItem {
  id: string;
  roomCode: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  startDate: string;
  endDate?: string;
  status: 'AKTIF' | 'SELESAI' | 'RESERVASI';
  monthlyRent: number;
  depositStatus: 'DITAHAN' | 'DIKEMBALIKAN' | 'MENUNGGU_PEMERIKSAAN';
  notes?: string;
}

export interface UpdateRoomDetailInput {
  code: string;
  monthlyPrice: number;
  depositAmount: number;
  areaSqm: number;
  type: RoomType;
  facilities: string[];
  description: string;
}

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDAR_NON_AC: 'Standar Non-AC',
  STANDAR_AC: 'Standar AC',
  DELUXE_AC: 'Deluxe AC (Kamar Mandi Dalam)',
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  TERSEDIA: 'Tersedia',
  DIPESAN: 'Sedang Dipesan',
  TERISI: 'Terisi Penuh',
  NONAKTIF: 'Dalam Perawatan',
};
