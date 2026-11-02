'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Navigation,
  MessageSquare,
} from 'lucide-react';

export function KontakClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'survei',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulasi pengiriman form yang responsif
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'survei',
        message: '',
      });
    }, 700);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER KONTAK */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(217,91%,45%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
            <MessageSquare size={14} />
            <span>Layanan Pelanggan & Survei</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(222,47%,11%)] tracking-tight">
            Hubungi Pengelola Kos Omi Sungai Bangek, Padang
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Ada pertanyaan seputar ketersediaan 67 kamar di sekitar Kampus III UIN Imam Bonjol Padang, jadwal survei lokasi, atau proses verifikasi sewa? Hubungi tim kami melalui formulir atau WhatsApp langsung.
          </p>
        </div>

        {/* GRID KONTAK: INFO KONTAK & FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI (5 KOLOM): Detail Kontak & Jam Kerja */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-6 bg-white border border-slate-200 shadow-sm">
              <h2 className="font-heading font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                Informasi Kantor Pengelola
              </h2>

              <div className="space-y-5 text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[hsl(217,91%,45%)] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Alamat Gedung</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Jl. Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (Dekat Kampus III UIN Imam Bonjol Padang)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">WhatsApp Pengelola (Fast Response)</p>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 font-semibold hover:underline block"
                    >
                      +62 812-3456-7890
                    </a>
                    <span className="text-[11px] text-slate-500 block">
                      Respons cepat untuk jadwal survei & cek kamar kosong
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Email Korespondensi</p>
                    <a
                      href="mailto:kontak@kosomi.id"
                      className="text-xs text-sky-700 font-semibold hover:underline block"
                    >
                      kontak@kosomi.id
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Jam Layanan Kantor</p>
                    <p className="text-xs text-slate-600">Setiap Hari: 08.00 - 20.00 WIB</p>
                    <p className="text-[11px] text-slate-500">
                      Penghuni tetap memiliki akses gerbang 24 jam dengan kartu digital
                    </p>
                  </div>
                </div>
              </div>

              {/* Tautan WhatsApp Langsung */}
              <div className="pt-2">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20ingin%20bertanya%20seputar%20sewa%20kamar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-3 rounded-lg shadow-sm transition-colors"
                >
                  <Phone size={15} />
                  Chat WhatsApp Sekarang
                </a>
              </div>
            </Card>

            {/* Panduan Rute */}
            <Card className="p-5 space-y-2.5 bg-white border border-slate-200 text-xs">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                <Navigation size={15} className="text-[hsl(217,91%,45%)]" />
                Akses & Panduan Rute
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Terletak di kawasan Sungai Bangek yang tenang dan asri untuk istirahat serta fokus belajar. Berjarak sangat dekat dengan gerbang utama Kampus III Universitas Islam Negeri Imam Bonjol Padang (UIN Imam Bonjol), mudah dijangkau ojek online maupun kendaraan pribadi.
              </p>
            </Card>
          </div>

          {/* KOLOM KANAN (7 KOLOM): Formulir Kirim Pesan */}
          <div className="lg:col-span-7">
            <Card className="p-6 md:p-8 bg-white border border-slate-200 shadow-sm">
              <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">
                Kirim Pesan Pertanyaan
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Isi formulir di bawah ini. Tim pengelola Kos Omi akan menanggapi pesan Anda secepatnya.
              </p>

              {isSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-heading font-bold text-emerald-900 text-base">
                    Pesan Anda Telah Terkirim!
                  </h3>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                    Terima kasih telah menghubungi Kos Omi. Tim pengelola kami akan segera merespons melalui WhatsApp atau email yang Anda cantumkan.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 pt-2 block mx-auto"
                  >
                    Kirim pesan lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rina Wulandari"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,45%)] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Nomor WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,45%)] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Kategori */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alamat Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,45%)] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Kategori Pertanyaan
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,45%)] focus:bg-white transition-all text-slate-700 font-medium"
                      >
                        <option value="survei">Jadwal Kunjungan & Survei Kamar</option>
                        <option value="ketersediaan">Cek Ketersediaan Kamar Tertentu</option>
                        <option value="pembayaran">Pertanyaan Midtrans & Deposit</option>
                        <option value="aturan">Pertanyaan Tata Tertib & Fasilitas</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Isi Pesan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pesan atau Pertanyaan Anda <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tuliskan pertanyaan atau rencana tanggal survei Anda di sini..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,45%)] focus:bg-white transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}
                  </button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
