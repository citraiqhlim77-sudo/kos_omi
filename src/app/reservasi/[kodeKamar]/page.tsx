import React from 'react';
import { Metadata } from 'next';
import NextLink from 'next/link';
import { fetchRoomByCodeAction, fetchRoomsAction } from '@/actions/rooms';
import { ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { ReservationFormClient } from '@/components/reservasi/ReservationFormClient';
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface ReservationPageProps {
  params: Promise<{ kodeKamar: string }>;
}

export async function generateMetadata({ params }: ReservationPageProps): Promise<Metadata> {
  const { kodeKamar } = await params;
  const room = await fetchRoomByCodeAction(kodeKamar);

  if (!room) {
    return {
      title: 'Reservasi Kamar - Kos Omi Sungai Bangek, Padang',
      description: 'Formulir pengajuan sewa kamar di Kos Omi Sungai Bangek, Padang dekat UIN Imam Bonjol.',
    };
  }

  const title = `Formulir Reservasi Kamar ${room.code} - Kos Omi Sungai Bangek`;
  const description = `Ajukan reservasi resmi Kamar ${room.code} (${ROOM_TYPE_LABELS[room.type]}) Kos Omi Sungai Bangek, Padang (dekat UIN Imam Bonjol). Tarif sewa ${formatRupiah(room.monthlyPrice)}/bulan dengan verifikasi KTP instan.`;
  const url = `https://kosomi.id/reservasi/${room.code}`;
  const image = room.photoUrls?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop';

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Reservasi Kamar ${room.code} Kos Omi Sungai Bangek, Padang`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ReservasiKamarPage({ params }: ReservationPageProps) {
  const { kodeKamar } = await params;
  const room = await fetchRoomByCodeAction(kodeKamar);

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Kamar Tidak Ditemukan</h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          Kamar dengan kode <strong>{kodeKamar}</strong> tidak ditemukan dalam sistem Kos Omi.
        </p>
        <NextLink
          href="/kamar"
          className="inline-flex items-center gap-2 bg-[hsl(186,72%,24%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[hsl(186,74%,18%)]"
        >
          <ArrowLeft size={16} />
          Kembali ke Katalog Kamar
        </NextLink>
      </div>
    );
  }

  if (room.status !== 'TERSEDIA') {
    const availableAlternatives = await fetchRoomsAction({ status: 'TERSEDIA' });

    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Kamar Sedang Tidak Tersedia</h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          Kamar <strong>{room.code}</strong> saat ini berstatus <strong>{room.status === 'DIPESAN' ? 'Sedang Dipesan' : room.status === 'TERISI' ? 'Terisi Penuh' : 'Dalam Perawatan'}</strong> dan belum dapat diajukan reservasi baru.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <NextLink
            href="/kamar"
            className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[hsl(186,74%,18%)]"
          >
            Pilih Kamar Tersedia Lainnya ({availableAlternatives.length} Tersedia)
          </NextLink>
          <NextLink
            href={`/kamar/${room.code}`}
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 text-zinc-700 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-50"
          >
            Lihat Informasi Kamar {room.code}
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <NextLink href="/" className="hover:text-[hsl(186,72%,24%)] transition-colors">
            Beranda
          </NextLink>
          <ChevronRight size={14} className="text-zinc-400" />
          <NextLink href="/kamar" className="hover:text-[hsl(186,72%,24%)] transition-colors">
            Katalog Kamar
          </NextLink>
          <ChevronRight size={14} className="text-zinc-400" />
          <NextLink href={`/kamar/${room.code}`} className="hover:text-[hsl(186,72%,24%)] transition-colors">
            Kamar {room.code}
          </NextLink>
          <ChevronRight size={14} className="text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Formulir Reservasi</span>
        </nav>

        {/* PAGE TITLE */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            Formulir Pengajuan Reservasi Kamar {room.code}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Lengkapi data diri dan jadwal masuk Anda. Tim Pengelola Kos Omi akan memverifikasi berkas Anda dalam waktu maksimal 2x24 jam.
          </p>
        </div>

        {/* CLIENT FORM COMPONENT */}
        <ReservationFormClient room={room} />
      </div>
    </div>
  );
}
