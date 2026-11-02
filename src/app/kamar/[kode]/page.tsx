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
  Users,
  Dumbbell,
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
      description: 'Kamar tidak terdaftar dalam sistem Kos Omi Sungai Bangek, Padang.',
    };
  }

  return {
    title: `Kamar ${room.code} (Lantai ${room.floor}) - Kos Omi Sungai Bangek, Padang`,
    description: `Detail Kamar ${room.code} Lantai ${room.floor} Kos Omi Sungai Bangek, Padang. Tarif Rp 5.000.000/semester per kamar (kapasitas 1 kamar 2 orang). Dilengkapi Kasur/Lemari, Kamar Mandi Dalam, Ruang Belajar Umum, Dapur & Area Cuci, CCTV, Wi-Fi, TV, Kulkas, Alat Olahraga, Parkir Motor Dalam, dan Keamanan 24 Jam.`,
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
        <h1 className="text-2xl font-extrabold text-zinc-900">Kamar Tidak Ditemukan</h1>
        <p className="text-sm text-zinc-600 max-w-md mx-auto">
          Kamar dengan kode <strong>{kode}</strong> tidak ditemukan. Silakan kembali ke katalog kamar Kos Omi.
        </p>
        <NextLink
          href="/kamar"
          className="inline-flex items-center gap-2 bg-[hsl(186,72%,24%)] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[hsl(186,74%,18%)] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Katalog Kamar
        </NextLink>
      </div>
    );
  }

  const isAvailable = room.status === 'TERSEDIA';

  const allAvailableRooms = await fetchRoomsAction({ status: 'TERSEDIA' });
  const alternativeRooms = allAvailableRooms
    .filter((r) => r.code !== room.code)
    .slice(0, 3);

  return (
    <div className="bg-zinc-50 min-h-screen py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* BREADCRUMB NAV */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <NextLink href="/" className="hover:text-[hsl(186,72%,24%)] transition-colors">
            Beranda
          </NextLink>
          <ChevronRight size={14} className="text-zinc-400" />
          <NextLink href="/kamar" className="hover:text-[hsl(186,72%,24%)] transition-colors">
            Katalog Kamar
          </NextLink>
          <ChevronRight size={14} className="text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Kamar {room.code}</span>
        </nav>

        {/* HEADER UTAMA KAMAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={room.status} size="md" />
              <span className="text-xs bg-white border border-zinc-200 text-zinc-700 font-semibold px-2.5 py-1 rounded-md">
                Lantai {room.floor}
              </span>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Kapasitas 1 Kamar 2 Orang
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
              Kamar No. {room.code}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 flex items-center gap-1.5 font-medium">
              <Building size={15} className="text-zinc-400" />
              Kos Omi • Lantai {room.floor} • Sungai Bangek, Padang
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-xs text-zinc-500">Harga Sewa per Kamar (2 Orang)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[hsl(186,72%,24%)] font-heading tabular-nums">
              {formatRupiah(room.monthlyPrice)}
              <span className="text-xs sm:text-sm text-zinc-400 font-normal"> / semester</span>
            </p>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <RoomPhotoGallery photos={room.photoUrls} roomCode={room.code} />

            {/* Spesifikasi Singkat */}
            <Card className="p-6">
              <h2 className="font-heading font-bold text-lg text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
                Spesifikasi Kamar Lantai {room.floor}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Users size={14} /> Kapasitas Kamar
                  </span>
                  <p className="font-bold text-zinc-800 text-sm">2 Orang / Kamar</p>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Bed size={14} /> Perabot Kamar
                  </span>
                  <p className="font-bold text-zinc-800 text-sm">Kasur & Lemari</p>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <ShowerHead size={14} /> Kamar Mandi
                  </span>
                  <p className="font-bold text-zinc-800 text-sm">Kamar Mandi Dalam</p>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Maximize2 size={14} /> Luas Kamar
                  </span>
                  <p className="font-bold text-zinc-800 text-sm">{room.areaSqm} m²</p>
                </div>
              </div>
            </Card>

            {/* Deskripsi Kamar */}
            <div className="space-y-3 bg-white p-6 rounded-xl border border-zinc-200">
              <h2 className="font-heading font-bold text-lg text-zinc-900">Deskripsi Kamar</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">{room.description}</p>
            </div>

            {/* 9 Daftar Fasilitas Kamar & Kos */}
            <Card className="p-6">
              <h2 className="font-heading font-bold text-lg text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
                9 Fasilitas Lengkap Kamar & Gedung Kos Omi
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-700">
                {room.facilities.map((fac, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ringkasan Keunggulan */}
            <div className="bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
              <h2 className="font-heading font-bold text-lg text-zinc-900">
                Fasilitas Bersama Penghuni Kos Omi
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600">
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-sm">
                    <Wifi size={16} className="text-[hsl(186,72%,24%)]" /> Wi-Fi, TV & Kulkas
                  </div>
                  <p>Dilengkapi akses internet Wi-Fi, televisi, kulkas, serta ruang belajar umum.</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-sm">
                    <ShieldCheck size={16} className="text-emerald-600" /> CCTV & Keamanan 24 Jam
                  </div>
                  <p>Dilengkapi kamera pengawas CCTV, keamanan 24 jam, dan parkir motor dalam.</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-sm">
                    <Dumbbell size={16} className="text-amber-600" /> Olahraga & Dapur Umum
                  </div>
                  <p>Tersedia fasilitas alat olahraga serta dapur dan area cuci umum yang bersih.</p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Rincian Biaya & Reservasi */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="p-6 space-y-5 bg-white border-[hsl(240,6%,90%)]">
              <h2 className="font-heading font-bold text-lg text-zinc-900 pb-2 border-b border-zinc-100">
                Rincian Biaya Sewa Kamar
              </h2>

              <div className="space-y-3 text-xs text-zinc-600">
                <div className="flex justify-between items-center">
                  <span>Tarif Sewa per Semester (Lantai {room.floor})</span>
                  <span className="font-bold text-zinc-800 tabular-nums">{formatRupiah(room.monthlyPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kapasitas Penghuni</span>
                  <span className="font-bold text-zinc-800">2 Orang / Kamar</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Biaya Administrasi</span>
                  <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100 text-sm font-extrabold text-[hsl(186,72%,24%)]">
                  <span>Total Sewa 1 Semester</span>
                  <span className="tabular-nums">{formatRupiah(room.monthlyPrice)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {isAvailable ? (
                  <>
                    <NextLink
                      href={`/reservasi/${room.code}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg transition-all active:scale-[0.99]"
                    >
                      Reservasi Kamar Ini
                      <ArrowRight size={16} />
                    </NextLink>
                    <p className="text-[11px] text-center text-zinc-500">
                      Mendukung BRI, BCA, BSI, Nagari, SeaBank, DANA, ShopeePay & QRIS
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3.5 px-4 rounded-lg bg-zinc-100 text-zinc-400 font-semibold text-sm cursor-not-allowed text-center"
                    >
                      Kamar Sedang Tidak Tersedia
                    </button>
                    <p className="text-xs text-center text-zinc-500">
                      Status kamar saat ini: <strong>{room.status === 'DIPESAN' ? 'Sedang Dipesan' : room.status === 'TERISI' ? 'Terisi Penuh' : 'Dalam Perawatan'}</strong>.
                    </p>
                  </div>
                )}

                <a
                  href={`https://wa.me/6281374329562?text=Halo%20Ibu%20Kos%20Omi,%20saya%20tertarik%20dengan%20Kamar%20${room.code}%20(Lantai%20${room.floor}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone size={14} className="text-emerald-600" />
                  Tanya Ibu Kos via WhatsApp (+62 813-7432-9562)
                </a>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <Lock size={13} className="text-sky-600" />
                <span>Pembayaran Transfer Bank, E-Wallet & QRIS</span>
              </div>
            </Card>

            <Card className="p-5 space-y-3 bg-white text-xs">
              <h3 className="font-heading font-bold text-zinc-900 text-sm">Ketentuan Sewa Kamar</h3>
              <ul className="space-y-2 text-zinc-600">
                <li className="flex items-start gap-2">
                  <Calendar size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>Tarif Rp 5.000.000 per semester per kamar untuk Lantai 1 & Lantai 2.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                  <span>Kapasitas 1 kamar untuk 2 orang penghuni (dilengkapi kasur, lemari, kamar mandi dalam).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Keamanan kos 24 jam penuh dilengkapi CCTV dan parkir motor dalam.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* KAMAR ALTERNATIF */}
        {alternativeRooms.length > 0 && (
          <div className="pt-10 border-t border-zinc-200 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Pilihan Kamar Tersedia Lainnya
              </h2>
              <NextLink
                href="/kamar"
                className="text-xs font-semibold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-1"
              >
                Lihat Semua Kamar <ArrowRight size={13} />
              </NextLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {alternativeRooms.map((alt) => (
                <Card key={alt.id} className="overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
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
                        <h3 className="font-heading font-bold text-zinc-900">Kamar No. {alt.code}</h3>
                        <span className="text-xs text-zinc-500 font-medium">Lantai {alt.floor}</span>
                      </div>
                      <p className="text-xs text-zinc-500">Kamar Mandi Dalam • Isi 2 Orang</p>
                      <p className="text-sm font-bold text-[hsl(186,72%,24%)] tabular-nums pt-1">
                        {formatRupiah(alt.monthlyPrice)} / semester
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <NextLink
                      href={`/reservasi/${alt.code}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[hsl(186,72%,24%)] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[hsl(186,74%,18%)] transition-colors"
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
