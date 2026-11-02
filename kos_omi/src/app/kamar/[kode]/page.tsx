import React from 'react';
import { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import { fetchRoomByCodeAction, fetchRoomsAction } from '@/actions/rooms';
import { formatRupiah } from '@/data/rooms';
import { ROOM_TYPE_LABELS } from '@/types/room';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { RoomPhotoGallery } from '@/components/kamar/RoomPhotoGallery';
import {
  Maximize2,
  Bed,
  ShowerHead,
  Zap,
  Wifi,
  ShieldCheck,
  Calendar,
  Lock,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Phone,
  Building,
  ArrowLeft,
  AlertCircle,
  Wind,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ kode: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kode } = await params;
  const room = await fetchRoomByCodeAction(kode);

  if (!room) {
    return {
      title: 'Kamar Tidak Ditemukan - Kos Omi Sungai Bangek, Padang',
      description: 'Kamar tidak terdaftar dalam sistem 67 kamar Kos Omi Sungai Bangek, Padang.',
    };
  }

  const roomTitle = `Kamar ${room.code} (${ROOM_TYPE_LABELS[room.type]}) - Kos Omi Sungai Bangek, Padang`;
  const roomDesc = `Detail spesifikasi Kamar ${room.code} Lantai ${room.floor} tipe ${ROOM_TYPE_LABELS[room.type]} Kos Omi Sungai Bangek, Padang (dekat Kampus III UIN Imam Bonjol). Tarif ${formatRupiah(room.monthlyPrice)}/bulan. Status: ${room.status}. Dilengkapi ${room.facilities?.slice(0, 4).join(', ') || 'fasilitas lengkap'}. Cek ketersediaan dan reservasi online resmi.`;
  const roomImage = room.photoUrls?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop';
  const roomUrl = `https://kosomi.id/kamar/${room.code}`;

  return {
    title: roomTitle,
    description: roomDesc,
    alternates: {
      canonical: roomUrl,
    },
    openGraph: {
      title: roomTitle,
      description: roomDesc,
      url: roomUrl,
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: roomImage,
          width: 1200,
          height: 630,
          alt: `Foto Kamar ${room.code} Kos Omi Sungai Bangek, Padang`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: roomTitle,
      description: roomDesc,
      images: [roomImage],
    },
  };
}

export default async function DetailKamarPage({ params }: PageProps) {
  const { kode } = await params;
  const room = await fetchRoomByCodeAction(kode);

  if (!room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Kamar Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Kamar dengan kode <strong>{kode}</strong> tidak terdaftar dalam sistem 67 kamar Kos Omi. Silakan periksa kembali kode kamar atau buka katalog lengkap kami.
        </p>
        <NextLink
          href="/kamar"
          className="inline-flex items-center gap-2 bg-[hsl(217,91%,45%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-[hsl(217,91%,38%)] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Katalog Kamar
        </NextLink>
      </div>
    );
  }

  const isAvailable = room.status === 'TERSEDIA';

  // Rekomendasi kamar alternatif yang berstatus TERSEDIA
  const allAvailableRooms = await fetchRoomsAction({ status: 'TERSEDIA' });
  const alternativeRooms = allAvailableRooms
    .filter((r) => r.code !== room.code)
    .slice(0, 3);

  // JSON-LD Structured Data Schema.org tipe Accommodation (PRD Task 3.5)
  const accommodationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    '@id': `https://kosomi.id/kamar/${room.code}#accommodation`,
    name: `Kamar ${room.code} (${ROOM_TYPE_LABELS[room.type]}) - Kos Omi Sungai Bangek, Padang`,
    description: room.description || `Kamar kos tipe ${ROOM_TYPE_LABELS[room.type]} Lantai ${room.floor} di Kos Omi Sungai Bangek, Kota Padang dekat Kampus III UIN Imam Bonjol.`,
    url: `https://kosomi.id/kamar/${room.code}`,
    identifier: room.code,
    accommodationCategory: ROOM_TYPE_LABELS[room.type],
    floorLevel: `Lantai ${room.floor}`,
    numberOfRooms: 1,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: room.sizeSqMeter || (room.type === 'DELUXE' ? 16 : 12),
      unitCode: 'MTK',
    },
    permittedUsage: 'Residential',
    image:
      room.photoUrls && room.photoUrls.length > 0
        ? room.photoUrls
        : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah',
      addressLocality: 'Padang',
      addressRegion: 'Sumatera Barat',
      postalCode: '25586',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -0.8242,
      longitude: 100.3705,
    },
    amenityFeature: (room.facilities || []).map((facility) => ({
      '@type': 'LocationFeatureSpecification',
      name: facility,
      value: true,
    })),
    offers: {
      '@type': 'Offer',
      price: room.monthlyPrice,
      priceCurrency: 'IDR',
      availability:
        room.status === 'TERSEDIA'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://kosomi.id/kamar/${room.code}`,
      validFrom: '2026-01-01',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: room.monthlyPrice,
        priceCurrency: 'IDR',
        unitText: 'MONTH',
      },
    },
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-14">
      {/* Schema.org Accommodation JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(accommodationJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* BREADCRUMB NAV */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <NextLink href="/" className="hover:text-[hsl(217,91%,45%)] transition-colors">
            Beranda
          </NextLink>
          <ChevronRight size={14} className="text-slate-400" />
          <NextLink href="/kamar" className="hover:text-[hsl(217,91%,45%)] transition-colors">
            Katalog Kamar
          </NextLink>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-900 font-semibold">Kamar {room.code}</span>
        </nav>

        {/* HEADER UTAMA KAMAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={room.status} size="md" />
              <span className="text-xs bg-white border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-md shadow-sm">
                Lantai {room.floor}
              </span>
              <span className="text-xs text-sky-800 font-semibold bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                {ROOM_TYPE_LABELS[room.type]}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
              Kamar {room.code} - {ROOM_TYPE_LABELS[room.type]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
              <Building size={15} className="text-slate-400" />
              Gedung Kos Omi, Jl. Sungai Bangek, Kel. Balai Gadang, Koto Tangah, Kota Padang (Dekat UIN Imam Bonjol)
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-xs text-slate-500">Harga Sewa Bulanan</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[hsl(217,91%,45%)] font-heading tabular-nums">
              {formatRupiah(room.monthlyPrice)}
              <span className="text-xs sm:text-sm text-slate-400 font-normal">/bulan</span>
            </p>
          </div>
        </div>

        {/* KONTEN UTAMA: GALERI & SPESIFIKASI + SIDEBAR PEMBAYARAN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI (8 KOLOM): Galeri, Deskripsi, Spesifikasi, Fasilitas */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Galeri Foto Interaktif */}
            <RoomPhotoGallery photos={room.photoUrls} roomCode={room.code} />

            {/* 2. Spesifikasi Singkat */}
            <Card className="p-6">
              <h2 className="font-heading font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Spesifikasi Ruangan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Maximize2 size={14} /> Luas Kamar
                  </span>
                  <p className="font-bold text-slate-800 text-sm">{room.areaSqm} m²</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Bed size={14} /> Tipe Ranjang
                  </span>
                  <p className="font-bold text-slate-800 text-sm">{room.bedType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShowerHead size={14} /> Kamar Mandi
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {room.type === 'DELUXE_AC' ? 'Dalam (Shower + WH)' : 'Luar Bersih (Rasio 1:2)'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wind size={14} /> Pendingin
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {room.type === 'STANDAR_NON_AC' ? 'Kipas Angin Dinding' : 'AC Daikin 1/2 PK'}
                  </p>
                </div>
              </div>
            </Card>

            {/* 3. Deskripsi Kamar */}
            <div className="space-y-3 bg-white p-6 rounded-xl border border-slate-200">
              <h2 className="font-heading font-bold text-lg text-slate-900">Deskripsi Kamar</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{room.description}</p>
              <div className="pt-2 text-xs text-slate-500 font-medium">
                Pemandangan Jendela: <strong>{room.windowView}</strong>
              </div>
            </div>

            {/* 4. Daftar Fasilitas Kamar */}
            <Card className="p-6">
              <h2 className="font-heading font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Fasilitas Lengkap di Dalam Kamar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                {room.facilities.map((fac, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 5. Fasilitas Bersama Gedung Kos Omi */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Fasilitas Bersama Gedung (Gratis)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <Wifi size={16} className="text-[hsl(217,91%,45%)]" /> Wi-Fi 100 Mbps
                  </div>
                  <p>Akses internet serat optik stabil di seluruh lantai tanpa kuota.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <ShieldCheck size={16} className="text-emerald-600" /> Keamanan CCTV
                  </div>
                  <p>Kartu akses mandiri 24 jam dan kamera pengawas di tiap lorong.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <Zap size={16} className="text-amber-600" /> Air Bersih & Dapur
                  </div>
                  <p>Gratis pemakaian air PDAM/sumur artesis dan dapur bersama di tiap lantai.</p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (4 KOLOM): Panel Rincian Biaya & Reservasi */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="p-6 space-y-5 bg-white border-[hsl(214,20%,90%)] shadow-sm">
              <h2 className="font-heading font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">
                Rincian Biaya Booking Awal
              </h2>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Sewa Bulan Pertama ({ROOM_TYPE_LABELS[room.type].split(' ')[0]})</span>
                  <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(room.monthlyPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Deposit Jaminan (1 Bulan, Dapat Dikembalikan)</span>
                  <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(room.depositAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Biaya Administrasi Sistem</span>
                  <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-extrabold text-[hsl(217,91%,45%)]">
                  <span>Total Pembayaran Awal</span>
                  <span className="tabular-nums">{formatRupiah(room.monthlyPrice + room.depositAmount)}</span>
                </div>
              </div>

              {/* Status dan Tombol Aksi */}
              <div className="space-y-3">
                {isAvailable ? (
                  <>
                    <NextLink
                      href={`/reservasi/${room.code}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg shadow-sm transition-all active:scale-[0.99]"
                    >
                      Reservasi Kamar Ini
                      <ArrowRight size={16} />
                    </NextLink>
                    <p className="text-[11px] text-center text-slate-500">
                      Verifikasi KTP 2x24 jam · Pembayaran aman via Midtrans
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 rounded-lg bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
                    >
                      Kamar Sedang Tidak Tersedia
                    </button>
                    <p className="text-xs text-center text-slate-500">
                      Status kamar saat ini: <strong>{room.status === 'DIPESAN' ? 'Sedang Dipesan' : room.status === 'TERISI' ? 'Terisi Penuh' : 'Dalam Perawatan'}</strong>. Anda dapat memilih kamar alternatif yang masih kosong di bawah ini.
                    </p>
                  </div>
                )}

                {/* WhatsApp Chat Button */}
                <a
                  href={`https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20tertarik%20dengan%20Kamar%20${room.code}%20(${ROOM_TYPE_LABELS[room.type]}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone size={14} className="text-emerald-600" />
                  Tanya Pengelola via WhatsApp
                </a>
              </div>

              {/* Security Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Lock size={13} className="text-sky-600" />
                <span>Pembayaran Resmi Midtrans Snap (QRIS & VA)</span>
              </div>
            </Card>

            {/* Aturan Singkat */}
            <Card className="p-5 space-y-3 bg-white text-xs">
              <h3 className="font-heading font-bold text-slate-900 text-sm">Ketentuan Singkat Sewa</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>Jatuh tempo sewa bulanan setiap tanggal 5.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>Pilihan masa sewa: 1, 3, 6, atau 12 bulan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Deposit dikembalikan 100% saat check-out resmi tanpa tunggakan.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* KAMAR ALTERNATIF TERSEDIA */}
        {alternativeRooms.length > 0 && (
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Pilihan Kamar Tersedia Lainnya
              </h2>
              <NextLink
                href="/kamar"
                className="text-xs font-semibold text-[hsl(217,91%,45%)] hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua Kamar <ArrowRight size={13} />
              </NextLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {alternativeRooms.map((alt) => (
                <Card key={alt.id} className="overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <Image
                        src={alt.photoUrls[0]}
                        alt={`Kamar ${alt.code}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <StatusBadge status={alt.status} size="sm" />
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-heading font-bold text-slate-900">Kamar {alt.code}</h3>
                        <span className="text-xs text-slate-500 font-medium">Lantai {alt.floor}</span>
                      </div>
                      <p className="text-xs text-slate-500">{ROOM_TYPE_LABELS[alt.type]}</p>
                      <p className="text-sm font-bold text-[hsl(217,91%,45%)] tabular-nums pt-1">
                        {formatRupiah(alt.monthlyPrice)}/bln
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <NextLink
                      href={`/reservasi/${alt.code}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[hsl(217,91%,45%)] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[hsl(217,91%,38%)] transition-colors"
                    >
                      Reservasi Kamar Ini
                      <ArrowRight size={13} />
                    </NextLink>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
