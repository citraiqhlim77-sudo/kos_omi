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
  MessageSquare,
  Building,
  ExternalLink,
} from 'lucide-react';

export function KontakClient() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'survei',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=59F5%2B25+Balai+Gadang,+Jalan+Ekora,+Sungai+Bangek,+Kec.+Koto+Tangah,+Kota+Padang,+Sumatera+Barat+25586';

  return (
    <div className="bg-zinc-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(186,72%,24%)] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <MessageSquare size={14} />
            <span>Layanan Informasi & Survei Kos Omi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[hsl(240,6%,10%)] tracking-tight">
            Hubungi Ibu Kos Omi Sungai Bangek, Padang
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Ingin menanyakan ketersediaan kamar Lantai 1 & Lantai 2 (Rp 5.000.000/semester per kamar, isi 2 orang) atau menjadwalkan survei langsung? Hubungi Ibu Kos melalui WhatsApp di bawah ini.
          </p>
        </div>

        {/* GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI (5 Kolom): Kartu Kontak & Peta */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 space-y-5 bg-white">
              <h2 className="font-heading font-bold text-lg text-zinc-900 pb-2 border-b border-zinc-100">
                Saluran Komunikasi Resmi
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">WhatsApp & Telepon Ibu Kos</span>
                    <p className="font-bold text-zinc-900 text-base">+62 813-7432-9562</p>
                    <a
                      href="https://wa.me/6281374329562?text=Halo%20Ibu%20Kos%20Omi,%20saya%20ingin%20bertanya%20tentang%20kamar%20kos."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 font-semibold hover:underline mt-0.5 inline-block"
                    >
                      Klik untuk Chat WhatsApp Ibu Kos →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[hsl(186,72%,24%)] flex items-center justify-center shrink-0 border border-blue-200">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Email Resmi</span>
                    <p className="font-bold text-zinc-900">kontak@kosomi.id</p>
                    <p className="text-xs text-zinc-500">Layanan administrasi & bukti pembayaran</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Jam Layanan & Keamanan</span>
                    <p className="font-bold text-zinc-900">Setiap Hari (Keamanan Kos 24 Jam)</p>
                    <p className="text-xs text-zinc-500">Survei kamar: 08.00 – 20.00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 border border-zinc-200">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Alamat Lokasi</span>
                    <p className="font-bold text-zinc-900">Gedung Kos Omi Sungai Bangek</p>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                      Jalan Ekora, Sungai Bangek, Kel. Balai Gadang, Kec. Koto Tangah, Kota Padang, Sumatera Barat 25586 (59F5+25 Balai Gadang) (Dekat Kampus III UIN Imam Bonjol Padang)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Peta Lokasi Google Maps */}
            <Card className="p-5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <Building size={15} className="text-[hsl(186,72%,24%)]" />
                  <span>Peta Lokasi Google Maps</span>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(186,72%,24%)] hover:underline"
                >
                  Buka di Maps <ExternalLink size={12} />
                </a>
              </div>
              <div className="rounded-lg overflow-hidden border border-zinc-200 h-56 bg-zinc-100">
                <iframe
                  title="Lokasi Kos Omi Sungai Bangek"
                  src="https://maps.google.com/maps?q=59F5%2B25+Balai+Gadang,+Jalan+Ekora,+Sungai+Bangek,+Kota+Padang,+Sumatera+Barat+25586&ll=-0.827438,100.357938&z=18&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Card>
          </div>

          {/* KOLOM KANAN (7 Kolom): Formulir Kirim Pesan */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 bg-white">
              {isSubmitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    Pesan Anda Telah Diterima!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                    Terima kasih, <strong>{formData.name}</strong>. Ibu Kos / Pengelola Kos Omi akan segera menghubungi nomor WhatsApp{' '}
                    <strong>{formData.phone}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', category: 'survei', message: '' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[hsl(186,72%,24%)] hover:underline pt-2"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-zinc-900">
                      Kirim Pertanyaan atau Jadwal Survei
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      Isi formulir di bawah ini atau langsung chat ke WhatsApp Ibu Kos (+62 813-7432-9562).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rina Wulandari"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(186,72%,24%)] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Nomor WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081374329562"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(186,72%,24%)] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Alamat Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(186,72%,24%)] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Kategori Pertanyaan
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(186,72%,24%)] focus:bg-white transition-all text-zinc-700 font-medium"
                      >
                        <option value="survei">Jadwal Kunjungan & Survei Kamar</option>
                        <option value="ketersediaan">Cek Ketersediaan Kamar Lantai 1 & 2</option>
                        <option value="pembayaran">Pertanyaan Pembayaran (Bank, E-Wallet, QRIS)</option>
                        <option value="aturan">Pertanyaan Tata Tertib & Fasilitas</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Pesan atau Pertanyaan Anda <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tuliskan pertanyaan atau rencana tanggal survei Anda di sini..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(186,72%,24%)] focus:bg-white transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-semibold text-sm px-6 py-3.5 rounded-lg transition-all active:scale-[0.99] disabled:opacity-50"
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
