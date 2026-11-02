'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { FAQ_DATA, FAQItem } from '@/data/faq';
import { Card } from '@/components/ui/Card';
import {
  HelpCircle,
  ChevronDown,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  FileCheck,
  BookOpen,
} from 'lucide-react';

export function FaqClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-1': true, // Buka item pertama secara default
  });

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    { key: 'all', label: 'Semua Pertanyaan', icon: HelpCircle },
    { key: 'reservasi', label: 'Alur Reservasi & KTP', icon: FileCheck },
    { key: 'pembayaran', label: 'Pembayaran Midtrans', icon: CreditCard },
    { key: 'deposit', label: 'Deposit & Jaminan', icon: ShieldCheck },
    { key: 'aturan', label: 'Tata Tertib Hunian', icon: BookOpen },
  ];

  const filteredFaqs =
    selectedCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-zinc-50 min-h-screen py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HEADER FAQ */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(186,72%,24%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
            <HelpCircle size={14} />
            <span>Pusat Bantuan & Tanya Jawab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Informasi lengkap seputar reservasi kamar, pembayaran gateway Midtrans, pengembalian deposit, dan aturan hidup di Kos Omi.
          </p>
        </div>

        {/* KATEGORI FILTER */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[hsl(186,72%,24%)] text-white'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* DAFTAR ACCORDION FAQ */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = !!openItems[faq.id];
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-[hsl(240,6%,90%)] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-zinc-50/70 transition-colors"
                >
                  <span className="font-heading font-bold text-sm sm:text-base text-zinc-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-[hsl(186,72%,24%)]' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-zinc-50/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BANTUAN KONTAK TAMBAHAN */}
        <Card className="p-8 text-center space-y-4 bg-white border border-zinc-200">
          <h2 className="font-heading font-bold text-lg text-zinc-900">
            Masih Punya Pertanyaan Lain?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            Tim pengelola Kos Omi siap membantu menjelaskan detail fasilitas, mengecek kamar kosong, atau membantu proses pendaftaran Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20memiliki%20pertanyaan%20seputar%20sewa%20kamar."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              <Phone size={15} />
              Hubungi via WhatsApp
            </a>
            <NextLink
              href="/kontak"
              className="inline-flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors"
            >
              <Mail size={15} />
              Kirim Pesan Formulir
            </NextLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
