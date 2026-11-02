import type { Metadata } from 'next';
import { FaqClient } from '@/components/faq/FaqClient';
import { FAQ_DATA } from '@/data/faq';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tanya Jawab (FAQ) - Kos Omi Sungai Bangek, Padang',
    description:
      'Pertanyaan yang sering diajukan seputar reservasi kamar, verifikasi KTP, pembayaran resmi Midtrans, ketentuan deposit, dan tata tertib hunian 67 kamar Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol).',
    alternates: {
      canonical: 'https://kosomi.id/faq',
    },
    openGraph: {
      title: 'Tanya Jawab (FAQ) Kos Omi Sungai Bangek, Padang',
      description:
        'Jawaban lengkap mengenai alur reservasi, ketentuan sewa, pembayaran online, fasilitas, dan tata tertib di Kos Omi Sungai Bangek, Padang.',
      url: 'https://kosomi.id/faq',
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'FAQ Kos Omi Sungai Bangek, Padang',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tanya Jawab (FAQ) Kos Omi Sungai Bangek, Padang',
      description: 'Panduan dan jawaban lengkap seputar sewa kamar di Kos Omi Sungai Bangek Padang dekat UIN Imam Bonjol.',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default function FAQPage() {
  // Schema.org Structured Data FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqClient />
    </>
  );
}
