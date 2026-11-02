'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const pathname = usePathname();

  const isDashboard =
    Boolean(pathname) &&
    (pathname!.startsWith('/pengelola') ||
      pathname!.startsWith('/keuangan') ||
      pathname!.startsWith('/penghuni') ||
      pathname!.startsWith('/admin'));

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-16 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Kolom 1: Profil Kos Omi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(186,72%,24%)] flex items-center justify-center text-white font-bold text-xl overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Kos Omi Sungai Bangek
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Hunian kos nyaman di Sungai Bangek, Kota Padang dekat Kampus III UIN Imam Bonjol Padang. Tarif Rp 5.000.000/semester per kamar (Lantai 1 & Lantai 2, kapasitas 1 kamar 2 orang) dengan fasilitas lengkap & keamanan 24 jam.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} />
              <span>Pembayaran Bank, E-Wallet (DANA/ShopeePay) & QRIS</span>
            </div>
          </div>

          {/* Kolom 2: Lokasi & Kontak */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Lokasi & Kontak Ibu Kos</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-sky-400 shrink-0 mt-0.5" />
                <span>Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-sky-400 shrink-0" />
                <a
                  href="https://wa.me/6281374329562"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-semibold text-zinc-200"
                >
                  +62 813-7432-9562 (Ibu Kos Omi)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="text-sky-400 shrink-0" />
                <a href="mailto:kontak@kosomi.id" className="hover:text-white transition-colors">
                  kontak@kosomi.id
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={18} className="text-sky-400 shrink-0" />
                <span>Layanan Informasi: Setiap Hari (Keamanan 24 Jam)</span>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Tautan Penting</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <NextLink href="/kamar" className="hover:text-white transition-colors">
                  Katalog Kamar (Lantai 1 & 2)
                </NextLink>
              </li>
              <li>
                <NextLink href="/tentang" className="hover:text-white transition-colors">
                  Tentang Kos, Fasilitas & Google Maps
                </NextLink>
              </li>
              <li>
                <NextLink href="/faq" className="hover:text-white transition-colors">
                  Tanya Jawab & Panduan Reservasi
                </NextLink>
              </li>
              <li>
                <NextLink href="/kontak" className="hover:text-white transition-colors">
                  Hubungi Ibu Kos (+62 813-7432-9562)
                </NextLink>
              </li>
              <li>
                <NextLink href="/login" className="hover:text-white transition-colors">
                  Portal Masuk Penghuni & Admin
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jaminan Kenyamanan */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Fasilitas Unggulan</h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Kasur, Lemari & Kamar Mandi Dalam</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Ruang Belajar Umum & Dapur/Area Cuci</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Wi-Fi, TV, Kulkas & Alat Olahraga</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Parkir Motor Dalam, CCTV & Keamanan 24 Jam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Kos Omi Sungai Bangek, Padang. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <NextLink href="/tentang" className="hover:text-zinc-400 transition-colors">
              Lokasi Maps Kos Omi
            </NextLink>
            <NextLink href="/faq" className="hover:text-zinc-400 transition-colors">
              Syarat & Ketentuan Sewa
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
