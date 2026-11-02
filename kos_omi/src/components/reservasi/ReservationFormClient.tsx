'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NextLink from 'next/link';
import { Room, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { submitReservationAction } from '@/actions/reservations';
import { Card } from '@/components/ui/Card';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Lock,
} from 'lucide-react';

interface ReservationFormClientProps {
  room: Room;
}

export const ReservationFormClient: React.FC<ReservationFormClientProps> = ({ room }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Hitung tanggal minimal H+3 (SOP PRD)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = minDate.toISOString().split('T')[0];

  // Form State
  const [formData, setFormData] = useState({
    checkInDate: minDateString,
    durationMonths: 6,
    fullName: 'Bagas Kurniawan',
    nik: '1371021405970001',
    phone: '081234567890',
    email: 'bagas@example.com',
    occupation: 'Tenaga Pengajar di Kota Padang',
    emergencyName: 'Dewi Lestari',
    emergencyPhone: '081398761234',
    emergencyRelation: 'Kakak Kandung',
    ktpUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    agreedToRules: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState<string>('');

  const monthlyPrice = room.monthlyPrice;
  const depositAmount = room.depositAmount;
  const totalInitial = monthlyPrice + depositAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'durationMonths') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSimulateKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Buat URL object lokal untuk pratinjau instan
      const objectUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, ktpUrl: objectUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await submitReservationAction({
        roomCode: room.code,
        checkInDate: formData.checkInDate,
        durationMonths: formData.durationMonths,
        fullName: formData.fullName,
        nik: formData.nik,
        phone: formData.phone,
        email: formData.email,
        occupation: formData.occupation,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        ktpUrl: formData.ktpUrl,
        agreedToRules: formData.agreedToRules,
      });

      if (!result.success) {
        setErrorMessage(result.message);
      } else if (result.data) {
        setIsSuccess(true);
        setCreatedCode(result.data.code);
        // Arahkan ke dashboard calon penghuni setelah delay singkat
        setTimeout(() => {
          router.push(`/calon?registered=${result.data?.code}`);
        }, 1500);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-emerald-200 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Pengajuan Reservasi Berhasil Dikirim!
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Reservasi untuk <strong>Kamar {room.code}</strong> dengan kode transaksi{' '}
            <strong className="text-[hsl(217,91%,45%)]">{createdCode}</strong> telah tersimpan di server. Tim pengelola akan memverifikasi berkas Anda dalam waktu 2x24 jam.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <NextLink
            href={`/calon?registered=${createdCode}`}
            className="inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] text-white text-sm font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-[hsl(217,91%,38%)]"
          >
            Buka Portal Calon Penghuni
            <ArrowRight size={16} />
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* KOLOM KIRI (7 Kolom): Formulir Input Identitas & Tanggal */}
      <div className="lg:col-span-7 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Mengajukan Reservasi</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. JADWAL MASUK & DURASI SEWA */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calendar size={18} className="text-[hsl(217,91%,45%)]" />
            Jadwal Rencana Masuk & Durasi Sewa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Rencana Masuk (Minimal H+3)
              </label>
              <input
                type="date"
                name="checkInDate"
                min={minDateString}
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Sesuai SOP Kos Omi untuk persiapan sanitasi dan kelengkapan kamar.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilihan Durasi Sewa
              </label>
              <select
                name="durationMonths"
                value={formData.durationMonths}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[hsl(217,91%,45%)]"
              >
                <option value={1}>1 Bulan (Uji Coba)</option>
                <option value={3}>3 Bulan (Satu Triwulan)</option>
                <option value={6}>6 Bulan (Satu Semester)</option>
                <option value={12}>12 Bulan (Satu Tahun Penuh)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Jatuh tempo sewa perpanjangan tanggal 5 tiap bulan.
              </span>
            </div>
          </div>
        </Card>

        {/* 2. DATA IDENTITAS CALON PENGHUNI */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User size={18} className="text-[hsl(217,91%,45%)]" />
            Identitas Calon Penghuni (Sesuai KTP)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Contoh: Bagas Kurniawan"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor NIK KTP (16 Digit)</label>
              <input
                type="text"
                name="nik"
                maxLength={16}
                value={formData.nik}
                onChange={handleChange}
                required
                placeholder="327302xxxxxxxxxx"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pekerjaan / Instansi / Kampus</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                placeholder="Contoh: Mahasiswa UIN Imam Bonjol / Karyawan / Dosen"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="081234567890"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email Aktif</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>
          </div>
        </Card>

        {/* 3. KONTAK DARURAT */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Phone size={18} className="text-[hsl(217,91%,45%)]" />
            Kontak Darurat (Keluarga / Kerabat)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kontak</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                required
                placeholder="Contoh: Dewi Lestari"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hubungan</label>
              <input
                type="text"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                required
                placeholder="Contoh: Kakak Kandung / Orang Tua"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                placeholder="0813xxxxxxxx"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[hsl(217,91%,45%)]"
              />
            </div>
          </div>
        </Card>

        {/* 4. UNGGAH FOTO KTP */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Unggah Foto KTP Asli untuk Verifikasi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center space-y-2 hover:border-[hsl(217,91%,45%)] transition-colors">
              <Upload size={24} className="mx-auto text-slate-400" />
              <div className="text-xs text-slate-600">
                <label className="font-bold text-[hsl(217,91%,45%)] cursor-pointer hover:underline">
                  Klik untuk pilih file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulateKtpUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">Format JPG atau PNG (Maks 5 MB)</p>
              </div>
            </div>

            {/* Pratinjau KTP */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
              <Image
                src={formData.ktpUrl}
                alt="Pratinjau KTP"
                fill
                sizes="200px"
                className="object-cover"
              />
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                Pratinjau KTP Siap Kirim
              </div>
            </div>
          </div>
        </Card>

        {/* 5. PERSETUJUAN ATURAN KOS */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3 text-xs text-slate-700">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreedToRules"
              checked={formData.agreedToRules}
              onChange={handleChange}
              required
              className="mt-0.5 rounded text-[hsl(217,91%,45%)] focus:ring-[hsl(217,91%,45%)]"
            />
            <span>
              Saya menyatakan bahwa data yang diisikan adalah benar dan valid. Saya menyetujui seluruh tata tertib Kos Omi, termasuk batas tamu hingga pukul 22.00 WIB, larangan merokok di dalam kamar ber-AC, dan kewajiban pembayaran sewa bulanan setiap tanggal 5.
            </span>
          </label>
        </div>
      </div>

      {/* KOLOM KANAN (5 Kolom): Ringkasan Kamar & Total Pembayaran */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
        <Card className="p-6 space-y-5 bg-white">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={room.photoUrls[0]}
                alt={`Kamar ${room.code}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Kamar Pilihan</span>
              <h2 className="font-heading font-extrabold text-lg text-slate-900 leading-tight">
                Kamar {room.code}
              </h2>
              <span className="text-xs text-[hsl(217,91%,45%)] font-semibold">
                Lantai {room.floor} · {ROOM_TYPE_LABELS[room.type]}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Sewa Bulan Pertama (1 bln)</span>
              <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(monthlyPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Deposit Jaminan (Dikembalikan 100%)</span>
              <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(depositAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Biaya Verifikasi & Administrasi</span>
              <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-base font-extrabold text-[hsl(217,91%,45%)]">
              <span>Total Pembayaran Awal</span>
              <span className="tabular-nums">{formatRupiah(totalInitial)}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Alur Setelah Pengajuan:</p>
            <p>1. Tim Kos Omi memeriksa kelengkapan data & KTP (maks. 2x24 jam).</p>
            <p>2. Setelah disetujui, invoice booking diterbitkan via Midtrans Snap (batas bayar 24 jam).</p>
            <p>3. Kamar resmi menjadi milik Anda dan siap huni.</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Mengirim Data Reservasi...' : 'Kirim Pengajuan Reservasi'}
            <ArrowRight size={16} />
          </button>

          <NextLink
            href={`/kamar/${room.code}`}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold py-1"
          >
            <ArrowLeft size={13} />
            Batal & Kembali ke Detail Kamar
          </NextLink>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Lock size={13} className="text-sky-600" />
            <span>Kerahasiaan data KTP terlindungi enkripsi Kos Omi</span>
          </div>
        </Card>
      </div>
    </form>
  );
};
