import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import NextLink from 'next/link';
import { PenghuniNav } from '@/components/penghuni/PenghuniNav';
import { fetchTenantProfileAction } from '@/actions/billing';
import { fetchRoomByCodeAction } from '@/actions/rooms';
import { formatRupiah } from '@/data/rooms';
import {
  BedDouble,
  Calendar,
  Zap,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  AlertCircle,
  Home,
  Layers,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kamar Saya | Kos Omi Sungai Bangek, Padang',
  description: 'Informasi rincian fasilitas kamar A-101, masa sewa, token listrik, dan tata tertib penghuni Kos Omi Sungai Bangek dekat UIN Imam Bonjol Padang.',
};

export default async function PenghuniKamarPage() {
  const profile = await fetchTenantProfileAction();
  const roomRes = await fetchRoomByCodeAction(profile.roomCode);
  const room = roomRes || null;

  const rules = [
    {
      no: '1',
      title: 'Akses Pintu Gerbang & Jam Kunjung',
      desc: 'Pintu gerbang utama ditutup pukul 23:00 WIB demi keamanan. Penghuni memiliki kunci akses RFID mandiri untuk keluar masuk darurat 24 jam.',
    },
    {
      no: '2',
      title: 'Kunjungan Tamu & Privasi',
      desc: 'Tamu lawan jenis dilarang masuk ke dalam kamar tidur. Tamu dapat diterima dengan nyaman di ruang tamu bersama lantai 1 hingga maksimal pukul 21:30 WIB.',
    },
    {
      no: '3',
      title: 'Zona Bebas Asap Rokok di Kamar',
      desc: 'Dilarang keras merokok atau vape di dalam kamar tidur dan kamar mandi. Tersedia area merokok terbuka di gazebo taman belakang dan balkon lantai 3.',
    },
    {
      no: '4',
      title: 'Jam Tenang Lingkungan Kos',
      desc: 'Pukul 22:00 – 06:00 WIB merupakan jam tenang. Harap kecilkan volume suara musik, TV, atau panggilan suara demi kenyamanan istirahat sesama penghuni.',
    },
    {
      no: '5',
      title: 'Jatuh Tempo Pembayaran Sewa',
      desc: 'Tagihan sewa bulanan jatuh tempo setiap tanggal 5. Pembayaran dilakukan secara resmi melalui gerbang pembayaran Midtrans di portal penghuni.',
    },
    {
      no: '6',
      title: 'Ketertiban Fasilitas Bersama',
      desc: 'Selalu bersihkan peralatan dapur bersama setelah digunakan. Sampah kamar harap diikat rapi dan diletakkan di tempat sampah utama setiap pagi.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <PenghuniNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                Informasi Kamar Aktif
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Kamar {profile.roomCode} · Kos Omi Sungai Bangek
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Ditempati oleh <strong className="text-slate-900">{profile.name}</strong> sejak {profile.checkInDate}.
            </p>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20Rina%20Kusuma%20Kamar%20A-101.%20Saya%20ingin%20mengajukan%20laporan/kendala%20kamar."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Lapor Kendala Kamar via WA</span>
          </a>
        </div>

        {/* Room Spec & Media Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Info & Photo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Photo & Core Highlights */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="relative h-64 sm:h-80 w-full bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
                  alt={`Kamar ${profile.roomCode} Kos Omi`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block">
                      Tipe Standar AC · Lantai 1
                    </span>
                    <h2 className="text-2xl font-heading font-extrabold text-white">
                      Kamar Tidur Nyaman {profile.roomCode}
                    </h2>
                    <p className="text-xs text-slate-200">
                      Ukuran 3.5 x 4 meter · Kamar Mandi Dalam · Jendela Menghadap Taman Dalam
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Specs */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
                <div className="pt-2 sm:pt-0">
                  <span className="text-[11px] text-slate-500 font-medium block">Tarif Sewa</span>
                  <span className="text-base font-heading font-extrabold text-[hsl(217,91%,45%)] tabular-nums">
                    {formatRupiah(profile.monthlyRent ?? 1450000)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">per bulan</span>
                </div>

                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[11px] text-slate-500 font-medium block">Check-in</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {profile.checkInDate}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Aktif Berjalan</span>
                </div>

                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[11px] text-slate-500 font-medium block">Masa Kontrak</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {profile.tenancyEnd}
                  </span>
                  <span className="text-[10px] text-slate-400 block">12 Bulan (1 Tahun)</span>
                </div>

                <div className="pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[11px] text-slate-500 font-medium block">Jatuh Tempo</span>
                  <span className="text-sm font-bold text-rose-600 block">
                    Tgl 5 / Bulan
                  </span>
                  <span className="text-[10px] text-slate-400 block">Otomatis via Portal</span>
                </div>
              </div>
            </div>

            {/* Room Facilities List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Inventaris & Fasilitas Kamar {profile.roomCode}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Kasur Springbed & Bantal</strong>
                    <span className="text-slate-500 text-[11px]">Ukuran Single 120 x 200 cm dengan sprei bersih</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Pendingin Udara (AC 1/2 PK)</strong>
                    <span className="text-slate-500 text-[11px]">Daikin Inverter hemat daya dan senyap</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Kamar Mandi Dalam Pribadi</strong>
                    <span className="text-slate-500 text-[11px]">Shower air hangat (Water Heater) & kloset duduk</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Lemari Pakaian & Cermin Rias</strong>
                    <span className="text-slate-500 text-[11px]">Lemari kayu 2 pintu lengkap dengan gantungan</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Meja & Kursi Kerja / Belajar</strong>
                    <span className="text-slate-500 text-[11px]">Dilengkapi stop kontak dinding di dekat meja</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Layanan Sampah Kamar Rutin</strong>
                    <span className="text-slate-500 text-[11px]">Pengambilan harian oleh petugas kebersihan kos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Utilities & Rules */}
          <div className="space-y-6 lg:col-span-1">
            {/* Utilities Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
                Utilitas & Jaringan Kamar
              </h3>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Token Listrik Mandiri (PLN)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Nomor Meteran Kamar {profile.roomCode}:
                </p>
                <div className="font-mono font-bold text-slate-900 bg-white p-2 rounded border border-amber-200 text-center tracking-wider text-sm">
                  1423-8890-4101
                </div>
                <p className="text-[10px] text-slate-500">
                  Isi token pulsa listrik sesuai kebutuhan di minimarket atau mobile banking pilihan Anda.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/70 space-y-1">
                <div className="flex items-center gap-2 text-sky-900 font-bold">
                  <Wifi className="w-4 h-4 text-sky-600" />
                  <span>Koneksi Wi-Fi Kos Omi</span>
                </div>
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SSID:</span>
                    <strong className="text-slate-800 font-mono">KOS_OMI_LT1</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kata Sandi:</span>
                    <strong className="text-slate-800 font-mono">kosomisungaibangek2026</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kecepatan:</span>
                    <strong className="text-emerald-700">100 Mbps Unlimited</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Facilities */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                Fasilitas Bersama Gedung
              </h3>
              <ul className="space-y-2 text-slate-600 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Dapur Bersama Lantai 1 & 2 (Kompor gas, wastafel)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Kulkas bersama & Dispenser Air Minum RO gratis</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Mesin cuci bersama & area jemur beratap lantai 3</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Parkir motor aman berkanopi dengan CCTV 24 Jam</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* TATA TERTIB & ATURAN KOS */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-heading font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Tata Tertib & Ketentuan Penghuni Kos Omi</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Aturan ini dibuat untuk menjaga keamanan, kenyamanan, serta ketertiban seluruh penghuni kos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => (
              <div
                key={rule.no}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                    {rule.no}
                  </span>
                  <h3 className="font-bold text-xs text-slate-900">{rule.title}</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
