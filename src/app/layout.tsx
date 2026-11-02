import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

// Satu keluarga font untuk seluruh web: Geist (modern, bersih, profesional)
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kos Omi Sungai Bangek - Hunian Modern 67 Kamar Dekat UIN Imam Bonjol Padang',
    template: '%s | Kos Omi Sungai Bangek, Padang',
  },
  description:
    'Sistem manajemen dan reservasi kamar kos online Kos Omi Sungai Bangek, Kota Padang. Hunian 5 lantai dengan 67 kamar di sekitar Kampus III UIN Imam Bonjol Padang. Cek ketersediaan kamar real-time dan pembayaran aman via Midtrans Snap.',
  keywords: [
    'Kos Omi',
    'Kos Omi Sungai Bangek',
    'Kos Omi Sungai Bangek Padang',
    'Kos Dekat UIN Imam Bonjol Padang',
    'Kos Sungai Bangek Padang',
    'Kos Koto Tangah Padang',
    'Kos Mahasiswa UIN Padang',
    'Sewa Kos Bulanan Padang',
    'Reservasi Kamar Kos Online Padang',
  ],
  authors: [{ name: 'Pengelola Kos Omi Sungai Bangek, Padang' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://kosomi.id'),
  openGraph: {
    title: 'Kos Omi Sungai Bangek - Hunian Nyaman & Modern 67 Kamar Dekat UIN Imam Bonjol Padang',
    description:
      'Cek kamar kosong di sekitar Kampus III UIN Imam Bonjol Padang, ajukan reservasi online, dan bayar aman via Midtrans Snap. Fasilitas lengkap: Wi-Fi, CCTV 24 jam, perabot lengkap, dan kamar mandi dalam.',
    url: 'https://kosomi.id',
    siteName: 'Kos Omi Sungai Bangek, Padang',
    type: 'website',
    locale: 'id_ID',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Kos Omi Sungai Bangek Padang - Dekat Kampus III UIN Imam Bonjol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kos Omi Sungai Bangek - Hunian Modern Dekat UIN Imam Bonjol Padang',
    description:
      'Cek kamar kosong di Sungai Bangek Padang, ajukan reservasi online, dan bayar aman via Midtrans Snap.',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { WebVitals } from '@/components/analytics/WebVitals';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={geist.variable}>
      <body className="antialiased font-sans text-[hsl(240,6%,10%)] bg-white min-h-screen flex flex-col">
        <WebVitals />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

