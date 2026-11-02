import type { Metadata } from 'next';
import { KontakClient } from '@/components/kontak/KontakClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kontak & Lokasi Pengelola Kos Omi Sungai Bangek, Padang',
    description:
      'Hubungi kantor pengelola Kos Omi Sungai Bangek, Padang untuk reservasi 67 kamar, survei lokasi kamar, atau pertanyaan sistem pembayaran. Dekat Kampus III UIN Imam Bonjol Padang.',
    alternates: {
      canonical: 'https://kosomi.id/kontak',
    },
    openGraph: {
      title: 'Kontak & Lokasi Pengelola Kos Omi Sungai Bangek, Padang',
      description:
        'Layanan pelanggan, jadwal survei kamar, WhatsApp resmi, dan alamat fisik kantor pengelola Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).',
      url: 'https://kosomi.id/kontak',
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'Lokasi dan Kontak Kos Omi Sungai Bangek, Padang',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kontak Pengelola Kos Omi Sungai Bangek, Padang',
      description: 'Hubungi pengelola Kos Omi untuk survei lokasi dan informasi 67 kamar di Sungai Bangek Padang.',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default function KontakPage() {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Kontak & Lokasi Kos Omi Sungai Bangek, Padang',
    url: 'https://kosomi.id/kontak',
    description: 'Halaman kontak resmi pengelola 67 kamar Kos Omi Sungai Bangek, Padang dekat UIN Imam Bonjol.',
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Kos Omi Sungai Bangek, Padang',
      telephone: '+6281234567890',
      email: 'kontak@kosomi.id',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah',
        addressLocality: 'Padang',
        addressRegion: 'Sumatera Barat',
        postalCode: '25586',
        addressCountry: 'ID',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <KontakClient />
    </>
  );
}
