import type { MetadataRoute } from 'next';

/**
 * Task 3.5: Robots.txt Handler
 * Memblokir bot perayap pada area internal/otentikasi dan API (/admin, /pengelola, /keuangan, /penghuni, /calon, /login, /daftar, /api),
 * serta mengizinkan perayapan hanya pada halaman publik Kos Omi.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kosomi.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/kamar',
          '/kamar/*',
          '/tentang',
          '/kontak',
          '/faq',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/admin',
          '/pengelola/',
          '/pengelola',
          '/keuangan/',
          '/keuangan',
          '/penghuni/',
          '/penghuni',
          '/calon/',
          '/calon',
          '/login',
          '/daftar',
          '/lupa-password',
          '/reset-password',
          '/reset-password/*',
          '/reservasi/',
          '/reservasi/*',
          '/pembayaran/',
          '/pembayaran/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
