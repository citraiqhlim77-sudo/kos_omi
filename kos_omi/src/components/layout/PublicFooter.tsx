'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const pathname = usePathname();

  // Jangan render PublicFooter pada halaman dasbor internal peran kerja
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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Kolom 1: Profil Kos Omi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(217,91%,45%)] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                KO
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-tight">
                Kos Omi Sungai Bangek
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hunian kos modern 5 lantai dengan 67 kamar di Sungai Bangek, Kota Padang. Berada tepat di sekitar Kampus III UIN Imam Bonjol Padang, mengutamakan kenyamanan belajar, keamanan CCTV 24 jam, dan kemudahan sewa online.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} />
              <span>Sistem Pembayaran Resmi Midtrans Snap</span>
            </div>
          </div>

          {/* Kolom 2: Lokasi & Kontak */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Lokasi & Kontak</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="text-sky-400 shrink-0 mt-0.5" />
                <span>Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="text-sky-400 shrink-0" />
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  +62 812-3456-7890 (WhatsApp)
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
                <span>Layanan Kantor: 08.00 - 20.00 WIB</span>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Navigasi Cepat */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Tautan Penting</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <NextLink href="/kamar" className="hover:text-white transition-colors">
                  Katalog 67 Kamar
                </NextLink>
              </li>
              <li>
                <NextLink href="/tentang" className="hover:text-white transition-colors">
                  Fasilitas & Profil Gedung
                </NextLink>
              </li>
              <li>
                <NextLink href="/faq" className="hover:text-white transition-colors">
                  Tanya Jawab & Panduan Reservasi
                </NextLink>
              </li>
              <li>
                <NextLink href="/kontak" className="hover:text-white transition-colors">
                  Hubungi Pengelola Kos
                </NextLink>
              </li>
              <li>
                <NextLink href="/login" className="hover:text-white transition-colors">
                  Portal Masuk Penghuni
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jaminan Kenyamanan */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-base">Keunggulan Hunian</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Wi-Fi 100 Mbps Unlimited Dedicated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Kamera Keamanan CCTV 24/7 & Akses Digital</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Dapur Bersama Lengkap per Lantai</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Bebas Biaya Admin & Terbit Invoice Otomatis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Garis batas dan Hak Cipta */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Kos Omi Sungai Bangek, Padang. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <NextLink href="/faq" className="hover:text-slate-400 transition-colors">
              Kebijakan Privasi
            </NextLink>
            <NextLink href="/faq" className="hover:text-slate-400 transition-colors">
              Syarat & Ketentuan Sewa
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
};
