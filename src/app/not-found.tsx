import React from 'react';
import NextLink from 'next/link';
import { BedDouble, Home, HelpCircle, Phone, ArrowLeft, Search, ShieldCheck } from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    {
      title: 'Katalog 67 Kamar',
      desc: 'Cari kamar kosong lantai 1-5 tipe AC & Non-AC',
      href: '/kamar',
      icon: BedDouble,
    },
    {
      title: 'Cek Status Reservasi',
      desc: 'Periksa status verifikasi dan invoice reservasi',
      href: '/calon',
      icon: ShieldCheck,
    },
    {
      title: 'Pertanyaan Umum (FAQ)',
      desc: 'Panduan tata tertib, pembayaran, dan sewa kos',
      href: '/faq',
      icon: HelpCircle,
    },
    {
      title: 'Hubungi Pengelola',
      desc: 'Tanya langsung ketersediaan kamar via WhatsApp',
      href: '/kontak',
      icon: Phone,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] bg-zinc-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Status Code */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-200/80 text-zinc-700 font-extrabold text-2xl mx-auto">
            404
          </div>
          <div className="text-xs font-bold text-zinc-500">
            Halaman Tidak Ditemukan
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Tautan Tidak Tersedia
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Halaman atau kode kamar yang Anda tuju mungkin telah dipindahkan, berganti alamat, atau tidak lagi aktif di sistem Kos Omi.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 text-left space-y-4">
          <div className="text-xs font-bold text-zinc-500 border-b border-zinc-100 pb-2.5">
            Tautan Cepat yang Mungkin Anda Butuhkan
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className="p-3.5 rounded-xl border border-zinc-200 hover:border-[hsl(186,72%,24%)] hover:bg-[hsl(214,95%,98%)] transition-colors group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-white text-[hsl(186,72%,24%)] border border-zinc-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 group-hover:text-[hsl(186,72%,24%)]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </NextLink>
              );
            })}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NextLink
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </NextLink>

          <NextLink
            href="/kamar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            <BedDouble className="w-4 h-4 text-zinc-500" />
            <span>Katalog 67 Kamar</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
