import type { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import {
  ShieldCheck,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Layers,
  Bed,
  ShowerHead,
  BookOpen,
  UtensilsCrossed,
  Camera,
  Wifi,
  Dumbbell,
  Bike,
  ExternalLink,
  Navigation,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tentang Kos Omi Sungai Bangek, Padang - Fasilitas, Harga & Lokasi Maps',
    description:
      'Profil lengkap Kos Omi Sungai Bangek, Padang dekat Kampus III UIN Imam Bonjol Padang. Tarif Rp 5.000.000/semester per kamar (Lantai 1 & 2, isi 1 kamar 2 orang). Dilengkapi Kasur/Lemari, Kamar Mandi Dalam, Ruang Belajar Umum, Dapur & Area Cuci, CCTV, Wi-Fi, TV, Kulkas, Alat Olahraga, Parkir Motor Dalam, Keamanan 24 Jam, serta Peta Lokasi Google Maps.',
    alternates: {
      canonical: 'https://kosomi.id/tentang',
    },
  };
}

export default function TentangPage() {
  const facilitiesList = [
    {
      title: '1. Kasur / Lemari',
      desc: 'Setiap kamar dilengkapi kasur tidur nyaman dan lemari pakaian untuk kapasitas 2 orang penghuni per kamar.',
      icon: Bed,
    },
    {
      title: '2. Kamar Mandi Dalam',
      desc: 'Kamar mandi dalam pribadi di setiap kamar Lantai 1 maupun Lantai 2 yang bersih dengan air lancar.',
      icon: ShowerHead,
    },
    {
      title: '3. Ruang Belajar Umum',
      desc: 'Tersedia area ruang belajar umum yang tenang dan nyaman bagi mahasiswa untuk belajar maupun mengerjakan tugas.',
      icon: BookOpen,
    },
    {
      title: '4. Dapur dan Area Cuci Umum',
      desc: 'Fasilitas dapur bersama untuk memasak serta area mencuci dan menjemur pakaian penghuni.',
      icon: UtensilsCrossed,
    },
    {
      title: '5. Dilengkapi CCTV',
      desc: 'Kamera pengawas CCTV aktif memantau area gerbang, koridor, dan parkiran kos selama 24 jam.',
      icon: Camera,
    },
    {
      title: '6. Wi-Fi, TV, & Kulkas',
      desc: 'Koneksi internet Wi-Fi cepat untuk kuliah dan tugas, dilengkapi fasilitas televisi (TV) serta kulkas bersama.',
      icon: Wifi,
    },
    {
      title: '7. Alat Olahraga',
      desc: 'Tersedia fasilitas alat olahraga bagi penghuni kos untuk menjaga kebugaran dan kesehatan tubuh setiap hari.',
      icon: Dumbbell,
    },
    {
      title: '8. Parkir Motor Dalam',
      desc: 'Area parkir sepeda motor di dalam lingkungan gedung kos yang aman, rapi, dan terlindung dari cuaca.',
      icon: Bike,
    },
    {
      title: '9. Keamanan 24 Jam',
      desc: 'Sistem keamanan lingkungan kos 24 jam penuh demi kenyamanan dan ketenangan seluruh penghuni Kos Omi.',
      icon: ShieldCheck,
    },
  ];

  const buildingFloors = [
    {
      floor: 'Lantai 1 (Kamar No. 1 – 33)',
      price: 'Rp 5.000.000 / Semester per Kamar',
      capacity: 'Isi 1 Kamar 2 Orang',
      facilities:
        'Kasur & Lemari (2 Orang), Kamar Mandi Dalam, Akses langsung ke Parkir Motor Dalam, Dapur & Area Cuci Umum, Kulkas, TV, Wi-Fi, Alat Olahraga, dan Pos Keamanan 24 Jam + CCTV.',
    },
    {
      floor: 'Lantai 2 (Kamar No. 34 – 67)',
      price: 'Rp 5.000.000 / Semester per Kamar',
      capacity: 'Isi 1 Kamar 2 Orang',
      facilities:
        'Kasur & Lemari (2 Orang), Kamar Mandi Dalam, Ruang Belajar Umum yang tenang, Dapur & Area Cuci Umum, Wi-Fi, TV, Kulkas, Sirkulasi Udara Sejuk, serta Pengawasan CCTV 24 Jam.',
    },
  ];

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=59F5%2B25+Balai+Gadang,+Jalan+Ekora,+Sungai+Bangek,+Kec.+Koto+Tangah,+Kota+Padang,+Sumatera+Barat+25586';

  return (
    <div className="bg-zinc-50 min-h-screen py-10 md:py-16 space-y-16">
      {/* 1. HERO TENTANG KOS OMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(186,72%,24%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              <MapPin size={14} />
              <span>Profil, Fasilitas, Harga & Lokasi Kos Omi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight leading-tight">
              Tentang Kos Omi Sungai Bangek, Padang
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              <strong>Kos Omi</strong> adalah hunian kos nyaman yang berlokasi strategis di kawasan{' '}
              <strong>Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang</strong> (tepat di sekitar Kampus III UIN Imam Bonjol Padang). Dirancang khusus untuk memberikan kenyamanan tempat tinggal dan belajar dengan fasilitas lengkap serta keamanan 24 jam.
            </p>

            {/* Ringkasan Harga, Kapasitas & Kontak Ibu Kos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Harga Sewa Kamar</p>
                <p className="text-lg font-extrabold text-[hsl(186,72%,24%)] font-heading mt-0.5">
                  Rp 5.000.000
                </p>
                <p className="text-[11px] text-zinc-600 font-medium">Per Semester / Kamar (Lt. 1 & 2)</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Kapasitas Kamar</p>
                <p className="text-lg font-extrabold text-emerald-600 font-heading mt-0.5">
                  2 Orang / Kamar
                </p>
                <p className="text-[11px] text-zinc-600 font-medium">Kasur, Lemari & KM Dalam</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-xs text-zinc-500 font-medium">Kontak Ibu Kos</p>
                <p className="text-sm font-extrabold text-zinc-900 font-heading mt-1">
                  +62 813-7432-9562
                </p>
                <a
                  href="https://wa.me/6281374329562"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-600 font-semibold hover:underline inline-block mt-0.5"
                >
                  Chat WhatsApp Langsung →
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-200 bg-white">
              <Image
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"
                alt="Gedung Hunian Kos Omi Sungai Bangek, Padang"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 9 FASILITAS RESMI KOS OMI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)]">
            Daftar Fasilitas Lengkap Kos Omi
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Seluruh kamar Lantai 1 dan Lantai 2 mendapatkan akses penuh ke 9 fasilitas utama berikut:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilitiesList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className="p-6 space-y-3 bg-white hover:border-sky-300 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-[hsl(180,33%,95%)] text-[hsl(186,72%,24%)] flex items-center justify-center">
                  <Icon size={22} />
                </div>
                <h3 className="font-heading font-bold text-base text-zinc-900">{item.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. RINCIAN HARGA & LANTAI KAMAR (LANTAI 1 & LANTAI 2) */}
      <section className="bg-white py-14 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 mb-2">
                <Layers size={15} />
                <span>Informasi Tarif & Kapasitas Kamar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)]">
                Harga Sewa Lantai 1 & Lantai 2
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md">
              Tarif sewa berlaku sama untuk Lantai 1 maupun Lantai 2 yaitu <strong>Rp 5.000.000 per semester per kamar</strong> (1 kamar diisi 2 orang).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buildingFloors.map((b, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200">
                  <div>
                    <span className="font-heading font-extrabold text-xl text-[hsl(186,72%,24%)]">
                      {b.floor}
                    </span>
                    <span className="ml-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {b.capacity}
                    </span>
                  </div>
                  <span className="font-heading font-extrabold text-base text-zinc-900">
                    {b.price}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{b.facilities}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PETA LOKASI INTERAKTIF GOOGLE MAPS (LANGSUNG MASUK KE MAPS) */}
      <section id="lokasi-maps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(186,72%,24%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              <MapPin size={14} />
              <span>Peta Lokasi Digital Kos Omi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(240,6%,10%)]">
              Lokasi Kos Omi di Google Maps
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base max-w-2xl">
              Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Kawasan Kampus III UIN Imam Bonjol Padang). Klik peta di bawah atau tombol <strong>Buka Langsung di Google Maps</strong> untuk petunjuk arah navigasi.
            </p>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors shrink-0"
          >
            <Navigation size={16} />
            Buka Langsung di Google Maps
            <ExternalLink size={14} />
          </a>
        </div>

        <Card className="overflow-hidden border border-zinc-200 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Embedded Interactive Google Maps */}
            <div className="lg:col-span-8 relative min-h-[360px] sm:min-h-[420px] bg-zinc-100">
              <iframe
                title="Peta Lokasi Kos Omi Sungai Bangek Padang"
                src="https://maps.google.com/maps?q=59F5%2B25+Balai+Gadang,+Jalan+Ekora,+Sungai+Bangek,+Kota+Padang,+Sumatera+Barat+25586&ll=-0.827438,100.357938&z=18&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full min-h-[360px] sm:min-h-[420px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Info Lokasi & Kontak Ibu Kos di Samping Peta */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white border-t lg:border-t-0 lg:border-l border-zinc-200">
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-zinc-900">
                  Detail Alamat & Kontak
                </h3>

                <div className="space-y-3 text-xs text-zinc-600">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <p className="font-bold text-zinc-800">Alamat Lengkap:</p>
                    <p className="leading-relaxed">
                      Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol Padang)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <p className="font-bold text-zinc-800">Kontak Ibu Kos Omi:</p>
                    <p className="text-sm font-extrabold text-[hsl(186,72%,24%)]">
                      +62 813-7432-9562
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Tersedia untuk telepon & chat WhatsApp (Tanya kamar / Survei lokasi)
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                    <p className="font-bold text-zinc-800">Tarif & Kapasitas Kamar:</p>
                    <p className="leading-relaxed">
                      <strong>Rp 5.000.000 / Semester</strong> per kamar (Lantai 1 & Lantai 2) • Kapasitas <strong>1 kamar 2 orang</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  <MapPin size={15} />
                  Arahkan ke Lokasi di Google Maps
                  <ExternalLink size={13} />
                </a>

                <a
                  href="https://wa.me/6281374329562?text=Halo%20Ibu%20Kos%20Omi,%20saya%20ingin%20bertanya%20lokasi%20dan%20ketersediaan%20kamar%20kos."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-3 rounded-lg transition-colors"
                >
                  <Phone size={15} />
                  Hubungi Ibu Kos (+62 813-7432-9562)
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 5. CTA BAWAH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-white">Siap Memilih Kamar di Kos Omi?</h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
              Cek kamar yang tersedia di Lantai 1 & Lantai 2 atau hubungi langsung Ibu Kos di +62 813-7432-9562.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <NextLink
              href="/kamar"
              className="inline-flex items-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-lg transition-colors"
            >
              Lihat Katalog Kamar
              <ArrowRight size={15} />
            </NextLink>
            <a
              href="https://wa.me/6281374329562"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-5 py-3 rounded-lg transition-colors"
            >
              <Phone size={15} />
              WhatsApp Ibu Kos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
