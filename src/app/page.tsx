import type { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import { formatRupiah } from '@/data/rooms';
import { fetchFeaturedRoomsAction, fetchRoomStatsAction } from '@/actions/rooms';
import { StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Wifi,
  Shield,
  UtensilsCrossed,
  ShowerHead,
  Bike,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Lock,
  Bed,
  BookOpen,
  Dumbbell,
  Camera,
  Phone,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const stats = await fetchRoomStatsAction();
  const availableCount = stats?.available ?? 0;

  return {
    title: `Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Kosong Siap Huni`,
    description: `Hunian nyaman Kos Omi di Sungai Bangek, Koto Tangah, Kota Padang dekat Kampus III UIN Imam Bonjol Padang. Tarif Rp 5.000.000/semester per kamar (Lantai 1 & 2, kapasitas 2 orang/kamar). Fasilitas lengkap: Kasur/Lemari, Kamar Mandi Dalam, Ruang Belajar Umum, Dapur & Area Cuci, CCTV, Wi-Fi, TV, Kulkas, Alat Olahraga, Parkir Motor Dalam, Keamanan 24 Jam.`,
    alternates: {
      canonical: 'https://kosomi.id',
    },
    openGraph: {
      title: `Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Siap Huni`,
      description: `Cek ketersediaan kamar secara real-time di Sungai Bangek Padang (dekat UIN Imam Bonjol). Rp 5.000.000/semester per kamar (isi 2 orang). Hubungi Ibu Kos: +62 813-7432-9562.`,
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
  };
}

export default async function HomePage() {
  const [stats, availableRooms] = await Promise.all([
    fetchRoomStatsAction(),
    fetchFeaturedRoomsAction(4),
  ]);

  // 9 Fasilitas Resmi Kos Omi
  const facilities = [
    {
      title: 'Kasur & Lemari Pakaian',
      desc: 'Setiap kamar dilengkapi kasur nyaman dan lemari pakaian untuk kapasitas 2 orang penghuni per kamar.',
      icon: Bed,
    },
    {
      title: 'Kamar Mandi Dalam',
      desc: 'Seluruh kamar di Lantai 1 dan Lantai 2 memiliki fasilitas kamar mandi dalam pribadi yang bersih dan terawat.',
      icon: ShowerHead,
    },
    {
      title: 'Ruang Belajar Umum',
      desc: 'Area belajar bersama yang tenang dan kondusif bagi mahasiswa untuk mengerjakan tugas kuliah dan diskusi.',
      icon: BookOpen,
    },
    {
      title: 'Dapur dan Area Cuci Umum',
      desc: 'Tersedia fasilitas dapur bersama untuk memasak serta area cuci dan jemur pakaian yang bersih dan memadai.',
      icon: UtensilsCrossed,
    },
    {
      title: 'Dilengkapi CCTV',
      desc: 'Pengawasan kamera CCTV aktif di berbagai titik strategis gedung kos untuk menjaga ketertiban dan rasa aman.',
      icon: Camera,
    },
    {
      title: 'Wi-Fi, TV, & Kulkas',
      desc: 'Akses internet Wi-Fi cepat untuk kuliah online, serta fasilitas televisi dan kulkas bersama bagi penghuni.',
      icon: Wifi,
    },
    {
      title: 'Alat Olahraga',
      desc: 'Dilengkapi sarana alat olahraga di lingkungan kos agar penghuni tetap sehat dan bugar di sela aktivitas kuliah.',
      icon: Dumbbell,
    },
    {
      title: 'Parkir Motor Dalam',
      desc: 'Area parkir motor di dalam lingkungan gedung yang aman dan terlindung dari panas maupun hujan.',
      icon: Bike,
    },
    {
      title: 'Keamanan 24 Jam',
      desc: 'Lingkungan kos yang terjaga selama 24 jam penuh dengan pengawasan pengelola untuk kenyamanan penghuni.',
      icon: Shield,
    },
  ];

  const roomTypes = [
    {
      floor: 1,
      type: 'DELUXE_AC',
      name: 'Lantai 1 (Kamar No. 1 – 33)',
      price: 5000000,
      size: 'Isi 1 Kamar 2 Orang',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=85',
      highlights: [
        'Kasur & Lemari (Kapasitas 2 Orang)',
        'Kamar Mandi Dalam Pribadi',
        'Akses Mudah Dekat Parkir & Dapur',
        'Wi-Fi, TV, Kulkas & Ruang Belajar',
      ],
      bath: 'Lantai 1 • Kamar Mandi Dalam',
    },
    {
      floor: 2,
      type: 'STANDAR_AC',
      name: 'Lantai 2 (Kamar No. 34 – 67)',
      price: 5000000,
      size: 'Isi 1 Kamar 2 Orang',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=85',
      highlights: [
        'Kasur & Lemari (Kapasitas 2 Orang)',
        'Kamar Mandi Dalam Pribadi',
        'Sirkulasi Udara Sejuk & Tenang',
        'Wi-Fi, TV, Kulkas & Alat Olahraga',
      ],
      bath: 'Lantai 2 • Kamar Mandi Dalam',
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Kos Omi Sungai Bangek, Padang',
    url: 'https://kosomi.id',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
    description: 'Hunian kos nyaman di Sungai Bangek, Kota Padang dekat Kampus III UIN Imam Bonjol Padang. Harga Rp 5.000.000/semester per kamar (Lantai 1 & 2, isi 1 kamar 2 orang).',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '59F5+25 Balai Gadang, Jalan Ekora, Sungai Bangek, Kec. Koto Tangah',
      addressLocality: 'Padang',
      addressRegion: 'Sumatera Barat',
      postalCode: '25586',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -0.827438,
      longitude: 100.357938,
    },
    telephone: '+6281374329562',
    priceRange: 'Rp 5.000.000 / Semester',
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* 1. HERO SECTION */}
      <section className="bg-zinc-50 border-b border-[hsl(240,6%,90%)] pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[hsl(186,72%,24%)] text-xs font-bold px-3.5 py-1.5 rounded-full">
                <span>Sungai Bangek, Padang • Dekat UIN Imam Bonjol</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[hsl(240,6%,10%)] leading-tight tracking-tight">
                Kos Omi
              </h1>

              <p className="text-base sm:text-lg text-[hsl(240,4%,46%)] leading-relaxed max-w-xl">
                Hunian kos nyaman di Sungai Bangek, dekat Kampus III UIN Imam Bonjol Padang. Tersedia 67 kamar (Lantai 1 & 2) siap huni dengan fasilitas lengkap.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <NextLink
                  href="/kamar"
                  className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-semibold text-base px-6 py-3.5 rounded-lg transition-all"
                >
                  Lihat Katalog Kamar
                  <ArrowRight size={18} />
                </NextLink>
                <a
                  href="https://wa.me/6281374329562?text=Halo%20Ibu%20Kos%20Omi,%20saya%20ingin%20bertanya%20tentang%20ketersediaan%20kamar%20kos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-6 py-3.5 rounded-lg transition-all"
                >
                  <Phone size={18} />
                  Hubungi Ibu Kos (+62 813-7432-9562)
                </a>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-zinc-600 font-medium border-t border-zinc-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>1 Kamar Kapasitas 2 Orang</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Kamar Mandi Dalam</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-sky-600" />
                  <span>BRI, BCA, BSI, Nagari, SeaBank, DANA, ShopeePay, QRIS</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-white">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=85"
                    alt="Kamar Kos Omi Sungai Bangek, Dekat Kampus III UIN Imam Bonjol Padang"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-white flex items-center justify-between border-t border-zinc-100">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">Lantai 1 & Lantai 2 (Isi 2 Orang)</p>
                    <p className="font-heading font-bold text-zinc-900 text-base">Kasur, Lemari & Kamar Mandi Dalam</p>
                  </div>
                  <p className="font-heading font-bold text-[hsl(186,72%,24%)] text-lg tabular-nums">
                    Rp 5.000.000<span className="text-xs text-zinc-400 font-normal">/smt</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS RINGKAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-16">
        <div className="bg-white rounded-xl border border-[hsl(240,6%,90%)] p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-[hsl(186,72%,24%)] font-heading tabular-nums">{stats.total}</p>
            <p className="text-xs md:text-sm text-zinc-600 font-medium">Total Kamar Kos</p>
          </div>
          <div className="space-y-1 border-l border-zinc-100">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-600 font-heading tabular-nums">{stats.available}</p>
            <p className="text-xs md:text-sm text-zinc-600 font-medium">Kamar Siap Huni</p>
          </div>
          <div className="space-y-1 border-l border-zinc-100">
            <p className="text-3xl md:text-4xl font-extrabold text-amber-600 font-heading tabular-nums">{stats.booked}</p>
            <p className="text-xs md:text-sm text-zinc-600 font-medium">Sedang Dipesan</p>
          </div>
          <div className="space-y-1 border-l border-zinc-100">
            <p className="text-3xl md:text-4xl font-extrabold text-zinc-700 font-heading tabular-nums">{stats.occupied}</p>
            <p className="text-xs md:text-sm text-zinc-600 font-medium">Kamar Terisi</p>
          </div>
        </div>
      </section>

      {/* 3. PILIHAN LANTAI & HARGA KAMAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            Pilihan Lantai Kamar
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Tarif seragam <strong>Rp 5.000.000 / semester</strong> per kamar (kapasitas 2 orang).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roomTypes.map((item) => (
            <Card key={item.floor} className="overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-md text-xs font-bold text-zinc-800">
                    {item.size}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-zinc-900">{item.name}</h3>
                    <p className="text-xs text-sky-700 font-semibold mt-0.5">{item.bath}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <p className="text-xs font-semibold text-zinc-500">Fasilitas Kamar & Gedung:</p>
                    <ul className="space-y-1.5 text-xs text-zinc-700">
                      {item.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Harga Sewa per Kamar (2 Orang)</p>
                  <p className="font-heading font-extrabold text-xl text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(item.price)}
                    <span className="text-xs text-zinc-500 font-normal"> / semester</span>
                  </p>
                </div>
                <NextLink
                  href="/kamar"
                  className="inline-flex items-center gap-1.5 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                >
                  Pilih Kamar Lantai {item.floor}
                  <ArrowRight size={14} />
                </NextLink>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. KAMAR TERSEDIA UNGGULAN */}
      <section className="bg-zinc-50 py-16 border-y border-[hsl(240,6%,90%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
                Katalog Kamar Kos Omi
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base">
                Pilih nomor kamar yang tersedia di Lantai 1 (No. 1–33) atau Lantai 2 (No. 34–67).
              </p>
            </div>
            <NextLink
              href="/kamar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(186,72%,24%)] hover:underline shrink-0"
            >
              Lihat Seluruh Katalog Kamar
              <ArrowRight size={16} />
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                    <Image
                      src={room.photoUrls[0]}
                      alt={`Kamar ${room.code}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <StatusBadge status={room.status} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-lg text-zinc-900">Kamar No. {room.code}</span>
                      <span className="text-xs text-zinc-500 font-medium">Lantai {room.floor}</span>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-1">
                      Kamar Mandi Dalam • Isi 2 Orang
                    </p>

                    <p className="text-xs text-zinc-500">Kasur & Lemari Lengkap</p>
                  </div>
                </div>

                <div className="p-4 pt-0 mt-auto border-t border-zinc-100 flex items-center justify-between">
                  <p className="font-heading font-bold text-base text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(room.monthlyPrice)}
                    <span className="text-xs text-zinc-400 font-normal">/smt</span>
                  </p>
                  <NextLink
                    href={`/kamar/${room.code}`}
                    className="text-xs font-semibold text-zinc-800 hover:text-[hsl(186,72%,24%)] py-1.5 px-2.5 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white transition-colors"
                  >
                    Detail
                  </NextLink>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 9 FASILITAS LENGKAP KOS OMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            9 Fasilitas Lengkap Kos Omi Sungai Bangek
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Seluruh fasilitas di bawah ini telah tersedia untuk menunjang kenyamanan belajar, olahraga, dan istirahat penghuni.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <Card key={idx} className="p-6 space-y-4 hover:border-sky-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-lg text-zinc-900">{fac.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{fac.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. ALUR RESERVASI & PEMBAYARAN */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Alur Reservasi & Pembayaran Mudah
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Mendukung pembayaran via Transfer Bank (BRI, BCA, BSI, Bank Nagari, SeaBank), E-Wallet (DANA, ShopeePay), dan QRIS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-800/80 p-6 rounded-xl border border-zinc-700 space-y-3">
              <span className="text-xs font-bold text-sky-400">Langkah 1</span>
              <h3 className="font-heading font-bold text-lg text-white">Pilih Kamar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pilih kamar berstatus Tersedia di Lantai 1 atau Lantai 2 sesuai keinginan Anda.
              </p>
            </div>

            <div className="bg-zinc-800/80 p-6 rounded-xl border border-zinc-700 space-y-3">
              <span className="text-xs font-bold text-sky-400">Langkah 2</span>
              <h3 className="font-heading font-bold text-lg text-white">Isi Data & KTP</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Lengkapi formulir pemesanan kamar dan unggah foto identitas KTP untuk diverifikasi pengelola.
              </p>
            </div>

            <div className="bg-zinc-800/80 p-6 rounded-xl border border-zinc-700 space-y-3">
              <span className="text-xs font-bold text-sky-400">Langkah 3</span>
              <h3 className="font-heading font-bold text-lg text-white">Bayar via Bank / E-Wallet / QRIS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bayar tagihan Rp 5.000.000/semester melalui BRI, BCA, BSI, Bank Nagari, SeaBank, DANA, ShopeePay, atau QRIS.
              </p>
            </div>

            <div className="bg-zinc-800/80 p-6 rounded-xl border border-zinc-700 space-y-3">
              <span className="text-xs font-bold text-sky-400">Langkah 4</span>
              <h3 className="font-heading font-bold text-lg text-white">Check-in Kamar</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Datang ke Kos Omi pada tanggal masuk yang ditentukan dan terima kunci kamar Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOKASI STRATEGIS & KONTAK IBU KOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[hsl(180,33%,95%)] border border-[hsl(240,6%,90%)] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(186,72%,24%)] bg-white px-3 py-1 rounded-full">
                <MapPin size={14} />
                <span>Sungai Bangek, Kota Padang</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
                Lokasi Strategis Dekat Kampus UIN Imam Bonjol Padang
              </h2>
              <p className="text-zinc-700 text-sm sm:text-base leading-relaxed">
                Beralamat di <strong>Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang)</strong>. Sangat dekat dengan Kampus III UIN Imam Bonjol Padang. Anda juga dapat melihat peta lokasi interaktif di halaman Tentang Kos.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs font-medium text-zinc-700">
                <NextLink
                  href="/tentang#lokasi-maps"
                  className="bg-[hsl(186,72%,24%)] text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-[hsl(186,74%,18%)] transition-colors inline-flex items-center gap-1.5"
                >
                  <MapPin size={14} />
                  Lihat Google Maps di Halaman Tentang Kos
                </NextLink>
              </div>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-xl border border-zinc-200">
              <h3 className="font-heading font-bold text-lg text-zinc-900">Hubungi Ibu Kos Omi</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Ingin bertanya langsung mengenai kamar Lantai 1 & Lantai 2 atau menjadwalkan survei lokasi? Silakan hubungi Ibu Kos melalui WhatsApp:
              </p>
              <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 block">Nomor WhatsApp & Telepon Ibu Kos</span>
                  <span className="font-heading font-extrabold text-base text-zinc-900">+62 813-7432-9562</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  Aktif
                </span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/6281374329562?text=Halo%20Ibu%20Kos%20Omi,%20saya%20ingin%20bertanya%20mengenai%20kamar%20kos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone size={14} />
                  Chat WhatsApp Ibu Kos (+62 813-7432-9562)
                </a>
                <NextLink
                  href="/kontak"
                  className="inline-flex items-center justify-center gap-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  Halaman Kontak & Peta
                </NextLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
