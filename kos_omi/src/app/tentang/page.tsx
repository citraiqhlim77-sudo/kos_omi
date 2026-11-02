import type { Metadata } from 'next';
import NextLink from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import {
  Building2,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Phone,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tentang Kos Omi Sungai Bangek, Padang - Profil Hunian 67 Kamar',
    description:
      'Mengenal Kos Omi Sungai Bangek, Padang: hunian modern 5 lantai dengan 67 kamar di sekitar Kampus III UIN Imam Bonjol Padang, keamanan CCTV 24 jam, kartu akses digital, perabot lengkap, dan manajemen sewa digital.',
    alternates: {
      canonical: 'https://kosomi.id/tentang',
    },
    openGraph: {
      title: 'Tentang Kos Omi Sungai Bangek, Padang - Hunian Nyaman Dekat UIN Imam Bonjol',
      description:
        'Profil gedung, nilai keunggulan, dan fasilitas 67 kamar di Sungai Bangek Padang. Solusi hunian bersih, tenang, dan aman bagi mahasiswa UIN Imam Bonjol Padang.',
      url: 'https://kosomi.id/tentang',
      siteName: 'Kos Omi Sungai Bangek, Padang',
      type: 'website',
      locale: 'id_ID',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop',
          width: 1200,
          height: 630,
          alt: 'Gedung Kos Omi Sungai Bangek, Padang',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tentang Kos Omi Sungai Bangek, Padang',
      description: 'Mengenal Kos Omi Sungai Bangek, Padang: hunian modern 5 lantai dengan 67 kamar dekat UIN Imam Bonjol Padang.',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1200&auto=format&fit=crop'],
    },
  };
}

export default function TentangPage() {
  const buildingFloors = [
    {
      floor: 'Lantai 1',
      total: '16 Kamar (A-101 s/d A-116)',
      facilities: 'Lobby Pengelola, Gerbang Akses Digital, Pos Keamanan 24 Jam, Parkir Motor Tertutup, Dapur Bersama Lantai 1.',
    },
    {
      floor: 'Lantai 2',
      total: '16 Kamar (B-201 s/d B-216)',
      facilities: 'Kamar Tipe Deluxe & Standar, Dapur Bersama Lantai 2, Area Cuci & Jemur Pakaian Bersama.',
    },
    {
      floor: 'Lantai 3',
      total: '16 Kamar (C-301 s/d C-316)',
      facilities: 'Kamar Tipe Deluxe & Standar, Dapur Bersama Lantai 3, Sudut Meja Belajar Komunal Tenang.',
    },
    {
      floor: 'Lantai 4',
      total: '16 Kamar (D-401 s/d D-416)',
      facilities: 'Kamar Tipe Deluxe & Standar dengan sirkulasi udara sejuk, Dapur Bersama Lantai 4.',
    },
    {
      floor: 'Lantai 5',
      total: '3 Kamar (E-501 s/d E-503)',
      facilities: 'Kamar Deluxe Eksklusif, Akses Langsung ke Rooftop Lounge, Pemandangan Panorama Perbukitan Sungai Bangek & Kota Padang.',
    },
  ];

  const coreValues = [
    {
      title: 'Keamanan & Ketenangan',
      desc: 'Pengawasan CCTV 24/7 di seluruh koridor, kartu akses digital pintu utama, dan suasana lingkungan yang kondusif untuk istirahat dan belajar.',
      icon: ShieldCheck,
    },
    {
      title: 'Kebersihan Harian Terjaga',
      desc: 'Petugas kebersihan membersihkan koridor, area bersama, dapur, dan kamar mandi luar setiap hari untuk menjaga sanitasi optimal.',
      icon: Sparkles,
    },
    {
      title: 'Transparansi Finansial',
      desc: 'Semua tagihan terbit otomatis dan diverifikasi langsung melalui gateway Midtrans resmi tanpa ada biaya siluman atau pungutan liar.',
      icon: HeartHandshake,
    },
    {
      title: 'Komunitas Positif & Tertib',
      desc: 'Penghuni diseleksi melalui verifikasi KTP untuk memastikan lingkungan tempat tinggal yang saling menghargai dan aman.',
      icon: Users,
    },
  ];

  const rules = [
    {
      title: 'Akses 24 Jam & Jam Tamu',
      desc: 'Penghuni bebas keluar masuk 24 jam dengan kartu akses. Jam berkunjung tamu luar di area lobby/ruang tamu dibatasi hingga pukul 22.00 WIB.',
    },
    {
      title: 'Kawasan Bebas Asap Rokok',
      desc: 'Demi kesehatan bersama dan pencegahan bahaya kebakaran, dilarang merokok di dalam kamar dan koridor. Tersedia area merokok di rooftop lantai 5.',
    },
    {
      title: 'Ketenangan Bersama (Quiet Hours)',
      desc: 'Wajib menjaga ketenangan setelah pukul 22.00 WIB. Dilarang menyetel musik atau suara bervolume tinggi yang mengganggu penghuni lain.',
    },
    {
      title: 'Penggunaan Dapur Bersama',
      desc: 'Wajib mencuci dan merapikan kembali peralatan masak serta piring pribadi setelah selesai digunakan di dapur bersama setiap lantai.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16 space-y-16">
      {/* 1. HERO TENTANG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(217,91%,45%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
              <Building2 size={14} />
              <span>Profil Kos Omi Sungai Bangek</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight leading-tight">
              Tentang Kos Omi Sungai Bangek, Padang
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Kos Omi adalah properti hunian modern berlantai 5 dengan total 67 kamar di kawasan Sungai Bangek, Kelurahan Balai Gadang, Kecamatan Koto Tangah, Kota Padang. Berlokasi sangat dekat dengan Kampus III Universitas Islam Negeri Imam Bonjol Padang (UIN Imam Bonjol), kami menghadirkan standar baru hunian kos yang tertata rapi, bersih, tenang untuk belajar, dan terintegrasi dengan sistem manajemen digital transparan.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <span className="bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> 67 Kamar Terkelola
              </span>
              <span className="bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Gedung 5 Lantai
              </span>
              <span className="bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" /> Pembayaran Resmi Midtrans
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"
                alt="Gedung Kos Omi Sungai Bangek, Padang"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. NILAI-NILAI POKOK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
            Prinsip & Kenyamanan yang Kami Utamakan
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Komitmen kami untuk memberikan pengalaman hunian tinggal yang tenang dan dapat diandalkan setiap hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((v, i) => {
            const Icon = v.icon;
            return (
              <Card key={i} className="p-6 space-y-3 bg-white">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[hsl(217,91%,45%)] flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">{v.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. PEMBAGIAN LANTAI & STRUKTUR GEDUNG */}
      <section className="bg-white py-16 border-y border-[hsl(214,20%,90%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(217,91%,45%)] bg-blue-50 px-2.5 py-1 rounded-md">
              <Layers size={14} />
              <span>Tata Ruang Gedung</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
              Struktur & Pembagian 5 Lantai Kos Omi
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Setiap lantai didesain dengan fasilitas mandiri agar alur mobilitas penghuni efisien dan nyaman.
            </p>
          </div>

          <div className="space-y-4">
            {buildingFloors.map((item, idx) => (
              <Card key={idx} className="p-6 hover:border-slate-300 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-2">
                    <span className="font-heading font-extrabold text-xl text-[hsl(217,91%,45%)]">
                      {item.floor}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kapasitas</p>
                    <p className="font-semibold text-sm text-slate-900">{item.total}</p>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fasilitas Area</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.facilities}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TATA TERTIB & PERATURAN HUNIAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
            Tata Tertib & Norma Bersama
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Ditegakkan demi menjaga kenyamanan, keselamatan, dan privasi seluruh penghuni Kos Omi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, idx) => (
            <Card key={idx} className="p-6 space-y-2 bg-white">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{rule.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. LOKASI & KONTAK PENGELOLA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[hsl(214,95%,96%)] border border-[hsl(214,20%,90%)] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
                Kunjungi atau Hubungi Pengelola Kos Omi
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Kantor pengelola kami siap melayani pertanyaan seputar ketersediaan kamar, jadwal survei fisik, dan alur pendaftaran sewa.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-sky-600 shrink-0" />
                  Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol Padang)
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Clock size={16} className="text-sky-600 shrink-0" />
                  Jam Operasional Kantor: Setiap Hari 08.00 - 20.00 WIB
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-sm transition-colors"
              >
                <Phone size={16} />
                WhatsApp Pengelola
              </a>
              <NextLink
                href="/kamar"
                className="inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-sm transition-colors"
              >
                Cari Kamar Kosong
                <ArrowRight size={16} />
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
