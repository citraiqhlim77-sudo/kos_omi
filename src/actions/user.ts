'use server';

import { CalonUser } from '@/types/reservation';

const DEMO_USERS: Record<string, CalonUser> = {
  anisa: {
    id: 'usr-anisa',
    name: 'Anisa Permata',
    email: 'anisa@example.com',
    phone: '081298765432',
    nik: '1371016508980002',
    occupation: 'Mahasiswi Pascasarjana UIN Imam Bonjol Padang',
    emergencyContactName: 'Bambang Permata',
    emergencyContactPhone: '081122334455',
    emergencyContactRelation: 'Orang Tua (Ayah)',
    ktpUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  },
  bagas: {
    id: 'usr-bagas',
    name: 'Zahra Aulia Putri',
    email: 'zahra@example.com',
    phone: '081234567890',
    nik: '1371021405970001',
    occupation: 'Mahasiswi UIN Imam Bonjol Padang',
    emergencyContactName: 'Dewi Lestari',
    emergencyContactPhone: '081398761234',
    emergencyContactRelation: 'Kakak Kandung',
    ktpUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString(),
  },
};

export async function getCurrentUserAction(userIdOrKey: string = 'anisa'): Promise<CalonUser> {
  return DEMO_USERS[userIdOrKey] || DEMO_USERS.anisa;
}
