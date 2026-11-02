import type { MetadataRoute } from 'next';
import { getRooms } from '@/actions/rooms';
import type { Room } from '@/types/room';

/**
 * Task 3.5: Dynamic Sitemap Generator
 * Menghasilkan sitemap.xml resmi hanya untuk rute-rute publik Kos Omi Sungai Bangek, Padang:
 * - Halaman beranda, katalog kamar, tentang, kontak, FAQ
 * - 67 kamar publik (/kamar/[kode]) secara dinamis dari database
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kosomi.id';
  const now = new Date();

  // 1. Halaman publik statis
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kamar`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Rute dinamis 67 kamar publik (/kamar/[kode])
  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    const allRooms = await getRooms();
    roomRoutes = allRooms.map((room: Room) => {
      const lastModDate = room.updatedAt ? new Date(room.updatedAt) : now;
      return {
        url: `${baseUrl}/kamar/${room.code}`,
        lastModified: lastModDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Sitemap generation failed to query rooms:', error);
  }

  return [...staticRoutes, ...roomRoutes];
}
