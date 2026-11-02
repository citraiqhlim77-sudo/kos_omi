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
  SunMedium,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Lock,
  Sparkles,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const stats = await fetchRoomStatsAction();
  const availableCount = stats?.available ?? 0;

  return {
    title: `Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Kosong Siap Huni`,
    description: `Hunian modern 67 kamar di Sungai Bangek, Koto Tangah, Kota Padang dekat Kampus III UIN Imam Bonjol Padang. Tersedia ${availableCount} kamar kosong siap huni dengan Wi-Fi kencang, CCTV 24 jam, kamar mandi dalam, dan fasilitas lengkap. Reservasi online instan & aman.`,
    alternates: {
      canonical: 'https://kosomi.id',
    },
    openGraph: {
      title: `Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Siap Huni`,
      description: `Cek ketersediaan 67 kamar secara real-time di Sungai Bangek Padang (dekat UIN Imam Bonjol). Reservasi online instan, verifikasi KTP cepat, dan pembayaran resmi Midtrans.`,
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
      title: `Kos Omi Sungai Bangek, Padang - ${availableCount} Kamar Tersedia`,
      description: `Hunian modern 67 kamar di Sungai Bangek Padang dekat UIN Imam Bonjol. Cek kamar kosong dan booking online.`,
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default async function HomePage() {
  // Ambil data statistik dan kamar unggulan real-time dari Server Action / Database
  const [stats, availableRooms] = await Promise.all([
    fetchRoomStatsAction(),
    fetchFeaturedRoomsAction(4),
  ]);

  const facilities = [
    {
      title: 'Wi-Fi 100 Mbps Dedicated',
      desc: 'Koneksi internet tanpa kuota di seluruh lantai, stabil untuk kuliah online dan remote work.',
      icon: Wifi,
    },
    {
      title: 'Keamanan & CCTV 24 Jam',
      desc: 'Gerbang akses kartu digital mandiri dan pengawasan kamera CCTV di seluruh koridor dan area parkir.',
      icon: Shield,
    },
    {
      title: 'Dapur Bersama Lengkap',
      desc: 'Tersedia kompor gas, kulkas bersama, wastafel cuci piring, dan dispenser air minum di tiap lantai.',
      icon: UtensilsCrossed,
    },
    {
      title: 'Kamar Mandi Bersih & Rapi',
      desc: 'Pilihan kamar mandi dalam dengan water heater atau kamar mandi luar dengan rasio 1:2.',
      icon: ShowerHead,
    },
    {
      title: 'Parkir Motor Terlindung',
      desc: 'Area parkir motor tertutup di dalam gerbang gedung, aman dari terik matahari dan hujan.',
      icon: Bike,
    },
    {
      title: 'Rooftop Communal Space',
      desc: 'Area santai terbuka di lantai 5 dengan panorama perbukitan Sungai Bangek dan suasana sejuk Kota Padang.',
      icon: SunMedium,
    },
  ];

  const roomTypes = [
    {
      type: 'STANDAR_NON_AC',
      name: 'Standar Non-AC',
      price: 750000,
      size: '11 - 12 m²',
      image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      highlights: ['Ventilasi Jendela Luar', 'Kipas Angin Dinding', 'Kasur Springbed', 'Meja & Lemari'],
      bath: 'Kamar Mandi Luar Bersih',
    },
    {
      type: 'STANDAR_AC',
      name: 'Standar AC',
      price: 1100000,
      size: '13 - 14 m²',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      highlights: ['AC Daikin 1/2 PK Dingin', 'Kasur Springbed 100x200', 'Meja Belajar Luas', 'Lemari 2 Pintu'],
      bath: 'Kamar Mandi Luar Bersih',
    },
    {
      type: 'DELUXE_AC',
      name: 'Deluxe AC',
      price: 1450000,
      size: '16 - 18 m²',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      highlights: ['Kamar Mandi Dalam', 'Pemanas Air (Water Heater)', 'AC Daikin 1/2 PK', 'Springbed 120x200'],
      bath: 'Kamar Mandi Dalam Pribadi',
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Kos Omi Sungai Bangek, Padang',
    url: 'https://kosomi.id',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop',
    description: 'Hunian modern 67 kamar 5 lantai di Sungai Bangek, Kota Padang di sekitar Kampus III UIN Imam Bonjol Padang dengan sistem manajemen digital, Wi-Fi kencang, dan keamanan 24 jam.',
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
    telephone: '+6281234567890',
    priceRange: 'Rp 750.000 - Rp 1.500.000',
    numberOfRooms: 67,
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* 1. HERO SECTION */}
      <section className="bg-slate-50 border-b border-[hsl(214,20%,90%)] pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Teks Hero */}
            <div className="lg:col-span-7 space-y-6">

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[hsl(222,47%,11%)] leading-tight tracking-tight">
                Kos Omi Sungai Bangek, Padang Dekat UIN Imam Bonjol
              </h1>

              <p className="text-base sm:text-lg text-[hsl(215,16%,47%)] leading-relaxed max-w-2xl">
                Hunian modern 67 kamar di sekitar Kampus III UIN Imam Bonjol Padang. Siap huni dengan perabot lengkap, Wi-Fi kencang, pengawasan CCTV 24 jam, dan pembayaran resmi Midtrans Snap.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <NextLink
                  href="/kamar"
                  className="inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white font-semibold text-base px-6 py-3.5 rounded-lg shadow-sm transition-all"
                >
                  Lihat 67 Kamar
                  <ArrowRight size={18} />
                </NextLink>
                <NextLink
                  href="/daftar"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-[hsl(222,47%,11%)] border border-[hsl(214,20%,90%)] font-semibold text-base px-6 py-3.5 rounded-lg shadow-sm transition-all"
                >
                  Daftar Akun Calon Penghuni
                </NextLink>
              </div>

              {/* Jaminan Trust Indicator */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Ketersediaan Real-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Bebas Biaya Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-sky-600" />
                  <span>Midtrans Snap QRIS & VA</span>
                </div>
              </div>
            </div>

            {/* Media Hero */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80"
                    alt="Kamar Deluxe Kos Omi Sungai Bangek, Padang Dekat UIN Imam Bonjol"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Kamar Pilihan Utama</p>
                    <p className="font-heading font-bold text-slate-900 text-base">Tipe Deluxe AC (Kamar Mandi Dalam)</p>
                  </div>
                  <p className="font-heading font-bold text-[hsl(217,91%,45%)] text-lg tabular-nums">
                    Rp 1.450.000<span className="text-xs text-slate-400 font-normal">/bln</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS RINGKAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-16">
        <div className="bg-white rounded-xl border border-[hsl(214,20%,90%)] shadow-sm p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-extrabold text-[hsl(217,91%,45%)] font-heading tabular-nums">{stats.total}</p>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Total Kamar Gedung</p>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <p className="text-3xl md:text-4xl font-extrabold text-emerald-600 font-heading tabular-nums">{stats.available}</p>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Kamar Siap Huni</p>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <p className="text-3xl md:text-4xl font-extrabold text-amber-600 font-heading tabular-nums">{stats.booked}</p>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Sedang Dipesan</p>
          </div>
          <div className="space-y-1 border-l border-slate-100">
            <p className="text-3xl md:text-4xl font-extrabold text-slate-700 font-heading tabular-nums">{stats.occupied}</p>
            <p className="text-xs md:text-sm text-slate-600 font-medium">Kamar Terisi</p>
          </div>
        </div>
      </section>

      {/* 3. TIGA PILIHAN TIPE KAMAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
            Tiga Pilihan Tipe Kamar Sesuai Kebutuhan Anda
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Seluruh kamar dirancang bersih, tenang, dan siap huni dengan perabot lengkap serta sirkulasi udara yang baik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roomTypes.map((item) => (
            <Card key={item.type} className="overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 shadow-sm">
                    {item.size}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">{item.name}</h3>
                    <p className="text-xs text-sky-700 font-medium mt-0.5">{item.bath}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fasilitas Utama:</p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
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

              <div className="p-6 pt-0 mt-auto border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Mulai dari</p>
                  <p className="font-heading font-extrabold text-xl text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(item.price)}
                    <span className="text-xs text-slate-400 font-normal">/bln</span>
                  </p>
                </div>
                <NextLink
                  href={`/kamar?type=${item.type}`}
                  className="inline-flex items-center gap-1.5 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                >
                  Pilih Kamar
                  <ArrowRight size={14} />
                </NextLink>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. KAMAR TERSEDIA UNGGULAN */}
      <section className="bg-slate-50 py-16 border-y border-[hsl(214,20%,90%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
                Kamar Siap Huni yang Tersedia Hari Ini
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Data ketersediaan terhubung langsung secara real-time dengan sistem reservasi Kos Omi.
              </p>
            </div>
            <NextLink
              href="/kamar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(217,91%,45%)] hover:underline shrink-0"
            >
              Lihat Seluruh 67 Kamar
              <ArrowRight size={16} />
            </NextLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
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
                      <span className="font-heading font-extrabold text-lg text-slate-900">Kamar {room.code}</span>
                      <span className="text-xs text-slate-500 font-medium">Lantai {room.floor}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {room.type === 'DELUXE_AC'
                        ? 'Deluxe AC · Kamar Mandi Dalam'
                        : room.type === 'STANDAR_AC'
                        ? 'Standar AC'
                        : 'Standar Non-AC'}
                    </p>

                    <p className="text-xs text-slate-500">Luas: {room.areaSqm} m²</p>
                  </div>
                </div>

                <div className="p-4 pt-0 mt-auto border-t border-slate-100 flex items-center justify-between">
                  <p className="font-heading font-bold text-base text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(room.monthlyPrice)}
                    <span className="text-xs text-slate-400 font-normal">/bln</span>
                  </p>
                  <NextLink
                    href={`/kamar/${room.code}`}
                    className="text-xs font-semibold text-slate-800 hover:text-[hsl(217,91%,45%)] py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                  >
                    Detail
                  </NextLink>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FASILITAS UNGGULAN GEDUNG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
            Fasilitas Lengkap untuk Kenyamanan Belajar dan Bekerja
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Dikelola secara profesional agar penghuni dapat fokus pada produktivitas dan istirahat berkualitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <Card key={idx} className="p-6 space-y-4 hover:border-sky-300 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[hsl(214,95%,96%)] text-[hsl(217,91%,45%)] flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-lg text-slate-900">{fac.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{fac.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. ALUR RESERVASI MUDAH */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Alur Reservasi Online Transparan Tanpa Perantara
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Hanya 4 langkah mudah dari memilih kamar hingga siap menerima kunci dan check-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Langkah 1</span>
              <h3 className="font-heading font-bold text-lg text-white">Pilih Kamar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih kamar berstatus Tersedia di katalog dengan memfilter lantai dan tipe sesuai preferensi Anda.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Langkah 2</span>
              <h3 className="font-heading font-bold text-lg text-white">Verifikasi KTP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isi rencana tanggal masuk, durasi sewa, dan unggah foto KTP untuk verifikasi pengelola dalam 2x24 jam.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Langkah 3</span>
              <h3 className="font-heading font-bold text-lg text-white">Bayar via Midtrans</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Setelah disetujui, bayar booking dan deposit dalam 24 jam via QRIS, Virtual Account, atau E-Wallet resmi.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Langkah 4</span>
              <h3 className="font-heading font-bold text-lg text-white">Check-in Nyaman</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Datang pada tanggal masuk yang ditentukan, terima kartu akses digital kamar, dan mulai nikmati hunian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LOKASI STRATEGIS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[hsl(214,95%,96%)] border border-[hsl(214,20%,90%)] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(217,91%,45%)] bg-white px-3 py-1 rounded-full shadow-sm">
                <MapPin size={14} />
                <span>Sungai Bangek, Kota Padang</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
                Lokasi Strategis Dekat Kampus UIN Imam Bonjol Padang
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Beralamat di <strong>Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586</strong>. Lokasi asri dan tenang di sekitar Kampus III UIN Imam Bonjol Padang, dengan panorama perbukitan sejuk, minimarket, fotokopi, apotek, dan aneka kuliner mahasiswa.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">3 Menit ke Kampus III UIN Imam Bonjol</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">Akses Cepat Jalur By Pass & Lubuk Minturun</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">Jalan Kaki ke Kuliner & Minimarket</span>
              </div>
            </div>

            <div className="space-y-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-heading font-bold text-lg text-slate-900">Ingin Survei Langsung?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jadwalkan kunjungan survei kamar bersama petugas pengelola kami setiap hari antara pukul 08.00 - 20.00 WIB.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20ingin%20jadwalkan%20survei%20kamar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-3 rounded-lg shadow-sm transition-colors"
                >
                  WhatsApp Pengelola Survei
                </a>
                <NextLink
                  href="/kontak"
                  className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  Informasi Kontak Lengkap
                </NextLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA BANNER AKHIR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[hsl(217,91%,45%)] text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Kamar Terbatas, Amankan Kamar Pilihan Anda Sekarang
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Periksa ketersediaan real-time seluruh 67 kamar di 5 lantai dan ajukan reservasi online tanpa perlu repot datang langsung.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <NextLink
              href="/kamar"
              className="inline-flex items-center gap-2 bg-white text-[hsl(217,91%,45%)] font-bold text-sm px-6 py-3.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
            >
              Lihat Katalog 67 Kamar
              <ArrowRight size={16} />
            </NextLink>
            <NextLink
              href="/faq"
              className="inline-flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-sm px-6 py-3.5 rounded-lg transition-colors border border-blue-400/40"
            >
              Baca Pertanyaan Umum
            </NextLink>
          </div>
        </div>
      </section>
    </div>
  );
}
