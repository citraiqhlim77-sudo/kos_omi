'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TenantProfile } from '@/types/billing';
import { Room } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { fetchTenantProfileAction } from '@/actions/billing';
import { fetchRoomByCodeAction } from '@/actions/rooms';
import { getClientSession } from '@/lib/auth-client';
import {
  Zap,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
} from 'lucide-react';

interface PenghuniKamarClientProps {
  initialProfile: TenantProfile;
  initialRoom: Room | null;
}

export const PenghuniKamarClient: React.FC<PenghuniKamarClientProps> = ({
  initialProfile,
  initialRoom,
}) => {
  const [profile, setProfile] = useState<TenantProfile>(initialProfile);
  const [room, setRoom] = useState<Room | null>(initialRoom);

  useEffect(() => {
    const clientUser = getClientSession();
    if (clientUser && clientUser.email) {
      fetchTenantProfileAction(clientUser.email).then(async (synced) => {
        if (synced && synced.roomCode) {
          setProfile({
            ...synced,
            name: synced.name || clientUser.name,
            email: synced.email || clientUser.email,
            roomCode: synced.roomCode || clientUser.roomCode || initialProfile.roomCode,
          });
          const roomRes = await fetchRoomByCodeAction(synced.roomCode);
          if (roomRes) setRoom(roomRes);
        } else if (clientUser.roomCode) {
          setProfile((prev) => ({
            ...prev,
            name: clientUser.name || prev.name,
            email: clientUser.email || prev.email,
            roomCode: clientUser.roomCode!,
          }));
          const roomRes = await fetchRoomByCodeAction(clientUser.roomCode);
          if (roomRes) setRoom(roomRes);
        }
      });
    }
  }, [initialProfile.roomCode]);

  const activeRoomCode = profile.roomCode || '1';
  const activeFloor = room?.floor || (parseInt(activeRoomCode, 10) <= 33 ? 1 : 2);

  const rules = [
    {
      no: '1',
      title: 'Akses Pintu Gerbang & Keamanan',
      desc: 'Pintu gerbang besi utama dikunci pukul 23:00 WIB demi keamanan bersama. Area gerbang, koridor, dan parkiran dipantau kamera CCTV 24 jam.',
    },
    {
      no: '2',
      title: 'Kunjungan Tamu & Privasi',
      desc: 'Tamu lawan jenis dilarang masuk ke dalam kamar tidur. Tamu dapat diterima di area ruang depan/ruang belajar umum Lantai 1 maksimal hingga pukul 21:30 WIB.',
    },
    {
      no: '3',
      title: 'Larangan Merokok di Dalam Kamar',
      desc: 'Dilarang merokok di dalam kamar tidur, kamar mandi dalam, maupun koridor gedung untuk menjaga kebersihan udara dan kenyamanan bersama.',
    },
    {
      no: '4',
      title: 'Jam Tenang Lingkungan Kos',
      desc: 'Pukul 22:00 – 06:00 WIB merupakan jam tenang. Harap kecilkan volume suara musik, TV, atau panggilan suara demi kenyamanan istirahat sesama penghuni.',
    },
    {
      no: '5',
      title: 'Ketentuan Sewa Semesteran (6 Bulan)',
      desc: 'Tarif sewa kamar berlaku per semester (6 bulan) sebesar Rp 5.000.000/kamar (maksimal 2 orang, tanpa deposit). Pembayaran dilakukan resmi melalui DANA Resmi (082246424353) atau Midtrans.',
    },
    {
      no: '6',
      title: 'Ketertiban Fasilitas Bersama',
      desc: 'Selalu bersihkan peralatan dapur bersama dan area cuci setelah digunakan. Sampah kamar harap diikat rapi dan dibuang ke tempat sampah utama setiap hari.',
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Informasi Kamar Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Kamar No. {activeRoomCode} · Kos Omi Sungai Bangek
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Ditempati oleh <strong className="text-zinc-900">{profile.name || 'Penghuni Aktif'}</strong> sejak {profile.checkInDate}.
          </p>
        </div>

        <a
          href={`https://wa.me/6282287146763?text=Halo%20Ibu%20Yulastri%20(Kos%20Omi),%20saya%20${encodeURIComponent(profile.name || 'Penghuni')}%20Kamar%20No.%20${activeRoomCode}.%20Saya%20ingin%20mengajukan%20laporan/kendala%20kamar.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Lapor Kendala Kamar via WA (0822-8714-6763)</span>
        </a>
      </div>

      {/* Room Spec & Media Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="relative h-64 sm:h-80 w-full bg-zinc-900">
              <Image
                src={room?.photoUrls?.[0] || `/rooms/kamar-${activeRoomCode}.png`}
                alt={`Kamar No. ${activeRoomCode} Kos Omi`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-xs font-bold text-sky-300 block">
                    Kamar Standar Kos Omi (Maks. 2 Orang) · Lantai {activeFloor}
                  </span>
                  <h2 className="text-2xl font-heading font-extrabold text-white">
                    Kamar No. {activeRoomCode}
                  </h2>
                  <p className="text-xs text-zinc-200">
                    Fasilitas Kamar: Kamar Mandi Dalam · Kasur · Lemari
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 text-center">
              <div className="pt-2 sm:pt-0">
                <span className="text-[11px] text-zinc-500 font-medium block">Tarif Sewa</span>
                <span className="text-base font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                  {formatRupiah(profile.monthlyRent ?? 5000000)}
                </span>
                <span className="text-[10px] text-zinc-400 block">per semester (6 bulan)</span>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[11px] text-zinc-500 font-medium block">Check-in</span>
                <span className="text-sm font-bold text-zinc-900 block">
                  {profile.checkInDate}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Aktif Berjalan</span>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[11px] text-zinc-500 font-medium block">Masa Kontrak</span>
                <span className="text-sm font-bold text-zinc-900 block">
                  {profile.tenancyEnd}
                </span>
                <span className="text-[10px] text-zinc-400 block">6 Bulan (1 Semester)</span>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4">
                <span className="text-[11px] text-zinc-500 font-medium block">Skema Tagihan</span>
                <span className="text-sm font-bold text-emerald-700 block">
                  Sewa Semesteran
                </span>
                <span className="text-[10px] text-zinc-400 block">6 Bulan · Tanpa Deposit</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Fasilitas di Dalam Kamar No. {activeRoomCode}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/70 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 block">Kamar Mandi Dalam</strong>
                  <span className="text-zinc-500 text-[11px]">Kamar mandi pribadi bersih di dalam kamar</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/70 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 block">Kasur</strong>
                  <span className="text-zinc-500 text-[11px]">Kasur tidur nyaman untuk penghuni kamar</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/70 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-900 block">Lemari</strong>
                  <span className="text-zinc-500 text-[11px]">Lemari pakaian di dalam kamar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4 text-xs">
            <h3 className="font-bold text-zinc-700 border-b border-zinc-100 pb-2.5">
              Utilitas & Jaringan Kamar
            </h3>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Token Listrik Mandiri (PLN)</span>
              </div>
              <p className="text-zinc-600 text-[11px]">
                Nomor Meteran Kamar No. {activeRoomCode}:
              </p>
              <div className="tabular-nums font-bold text-zinc-900 bg-white p-2 rounded border border-amber-200 text-center text-sm">
                1423-8890-{String(activeRoomCode).padStart(4, '4100')}
              </div>
              <p className="text-[10px] text-zinc-500">
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
                  <span className="text-zinc-500">SSID:</span>
                  <strong className="text-zinc-800 tabular-nums">KOS_OMI_LT{activeFloor}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kata Sandi:</span>
                  <strong className="text-zinc-800 tabular-nums">kosomisungaibangek2026</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kecepatan:</span>
                  <strong className="text-emerald-700">100 Mbps Unlimited</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3 text-xs">
            <h3 className="font-bold text-zinc-700 border-b border-zinc-100 pb-2">
              Fasilitas Bersama Gedung (2 Lantai)
            </h3>
            <ul className="space-y-2 text-zinc-600 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Dapur & Area Cuci/Jemur Bersama (Lantai 1 & Lantai 2)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Ruang Belajar Umum, TV, Kulkas Bersama & Alat Olahraga</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Parkir Motor Dalam Gedung dengan Gerbang Besi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Pengawasan Kamera CCTV & Keamanan Kos 24 Jam</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* TATA TERTIB & ATURAN KOS */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-lg font-heading font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Tata Tertib & Ketentuan Penghuni Kos Omi</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Aturan ini dibuat untuk menjaga keamanan, kenyamanan, serta ketertiban seluruh penghuni kos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.no}
              className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                  {rule.no}
                </span>
                <h3 className="font-bold text-xs text-zinc-900">{rule.title}</h3>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
