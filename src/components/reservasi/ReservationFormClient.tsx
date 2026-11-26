'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NextLink from 'next/link';
import { Room, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { submitReservationAction } from '@/actions/reservations';
import { getClientSession } from '@/lib/auth-client';
import { CurrentServerUser } from '@/lib/auth-server';
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
  UserPlus,
  LogIn,
} from 'lucide-react';

interface ReservationFormClientProps {
  room: Room;
  currentUser?: CurrentServerUser | null;
}

export const ReservationFormClient: React.FC<ReservationFormClientProps> = ({ room, currentUser }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeUser, setActiveUser] = useState<{
    name: string;
    email: string;
    phone?: string;
  } | null>(
    currentUser
      ? { name: currentUser.name, email: currentUser.email, phone: currentUser.phone }
      : null
  );

  // Hitung tanggal minimal hari ini agar bisa langsung dites Check-in
  const minDate = new Date();
  const minDateString = minDate.toISOString().split('T')[0];

  // Form State
  const [occupancyMode, setOccupancyMode] = useState<'SENDIRI_PENUH' | 'PER_ORANG_1_SLOT' | 'BERDUA_GABUNG'>('SENDIRI_PENUH');
  const [roommateName, setRoommateName] = useState('');
  const [formData, setFormData] = useState({
    checkInDate: '',
    durationMonths: 6,
    fullName: currentUser?.name || '',
    nik: '',
    phone: currentUser?.phone ? currentUser.phone.replace(/^62/, '0') : '',
    email: currentUser?.email || '',
    occupation: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    ktpUrl: '',
    agreedToRules: false,
  });

  useEffect(() => {
    const clientUser = getClientSession();
    if (clientUser && clientUser.email) {
      const resolvedName =
        clientUser.name && clientUser.name !== 'Pengguna Terdaftar'
          ? clientUser.name
          : currentUser?.name || '';
      setActiveUser({
        name: resolvedName || clientUser.email.split('@')[0],
        email: clientUser.email,
      });
      setFormData((prev) => ({
        ...prev,
        fullName: resolvedName || prev.fullName || '',
        email: clientUser.email || prev.email || '',
      }));
    } else if (currentUser) {
      setActiveUser({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      });
    }
    setAuthChecked(true);
  }, [currentUser]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState<string>('');

  const isSingleSlot = occupancyMode === 'PER_ORANG_1_SLOT';
  const monthlyPrice = isSingleSlot ? Math.round(room.monthlyPrice / 2) : room.monthlyPrice;
  const depositAmount = 0;
  const totalInitial = monthlyPrice;

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
    if (!file) return;

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, ktpUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Kompres gambar KTM/KTP ke Data URI JPEG ringan agar tersimpan permanen di server dan dapat dibuka Pengelola
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1000;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setFormData((prev) => ({ ...prev, ktpUrl: compressed }));
        } else {
          setFormData((prev) => ({ ...prev, ktpUrl: dataUrl }));
        }
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, ktpUrl: dataUrl }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const modeLabel =
        occupancyMode === 'PER_ORANG_1_SLOT'
          ? '[1 Slot Sendiri - Rp 2.500.000]'
          : occupancyMode === 'BERDUA_GABUNG'
            ? `[Berdua Sekamar bersama ${roommateName || 'Rekan'} - Rp 5.000.000]`
            : '[Sewa Sendiri 1 Kamar Penuh - Rp 5.000.000]';
      const combinedName =
        occupancyMode === 'BERDUA_GABUNG' && roommateName.trim()
          ? `${formData.fullName} & ${roommateName.trim()}`
          : formData.fullName;

      const result = await submitReservationAction({
        roomCode: room.code,
        checkInDate: formData.checkInDate,
        durationMonths: formData.durationMonths,
        fullName: combinedName,
        nik: formData.nik,
        phone: formData.phone,
        email: formData.email,
        occupation: `${formData.occupation || 'Mahasiswi UIN'} ${modeLabel}`.trim(),
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
          router.push(
            `/calon?registered=${result.data?.code}&email=${encodeURIComponent(formData.email)}`
          );
        }, 1500);
      }
    });
  };

  if (authChecked && !activeUser) {
    const redirectTarget = encodeURIComponent(`/reservasi/${room.code}`);
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl border border-zinc-200 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Lock size={32} />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Wajib Memiliki Akun Calon Penghuni
          </span>
          <h2 className="text-2xl font-extrabold text-zinc-900">
            Daftar atau Masuk Akun Terlebih Dahulu
          </h2>
          <p className="text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            Untuk memesan <strong>Kamar No. {room.code} (Lantai {room.floor})</strong>, Anda wajib terdaftar sebagai <strong>Calon Penghuni Kos Omi</strong> terlebih dahulu agar status verifikasi KTM/KRS dan tagihan pembayaran Anda tercatat aman di akun Anda.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left text-xs text-zinc-600 space-y-1.5 max-w-lg mx-auto">
          <div className="font-bold text-zinc-900">Alur Pemesanan Kamar Baru:</div>
          <div>1. Buat akun baru (Nama Lengkap, Email, No. WhatsApp, & Kata Sandi).</div>
          <div>2. Otomatis kembali ke halaman ini untuk mengisi data diri & unggah foto identitas.</div>
          <div>3. Pantau persetujuan pengelola & selesaikan pembayaran sewa kamar.</div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <NextLink
            href={`/daftar?redirect=${redirectTarget}`}
            className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <UserPlus size={16} />
            Daftar Akun Baru Sekarang
          </NextLink>
          <NextLink
            href={`/login?redirect=${redirectTarget}`}
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
          >
            <LogIn size={16} />
            Sudah Punya Akun? Masuk
          </NextLink>
        </div>

        <div className="pt-2">
          <NextLink
            href={`/kamar/${room.code}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800"
          >
            <ArrowLeft size={14} />
            Kembali ke Detail Kamar No. {room.code}
          </NextLink>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-emerald-200 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-zinc-900">
            Pengajuan Reservasi Berhasil Dikirim!
          </h2>
          <p className="text-sm text-zinc-600 max-w-lg mx-auto">
            Reservasi untuk <strong>Kamar {room.code}</strong> dengan kode transaksi{' '}
            <strong className="text-[hsl(186,72%,24%)]">{createdCode}</strong> telah tersimpan di server. Tim pengelola akan memverifikasi berkas Anda dalam waktu 2x24 jam.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <NextLink
            href={`/calon?registered=${createdCode}&email=${encodeURIComponent(formData.email)}`}
            className="inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[hsl(186,74%,18%)]"
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
          <h2 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <Calendar size={18} className="text-[hsl(186,72%,24%)]" />
            Jadwal Rencana Masuk & Durasi Sewa
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Pilihan Tipe Hunian & Cara Bayar Kamar {room.code}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setOccupancyMode('SENDIRI_PENUH')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${occupancyMode === 'SENDIRI_PENUH'
                      ? 'border-[hsl(186,72%,24%)] bg-blue-50/70 ring-2 ring-[hsl(186,72%,24%)]/20'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                >
                  <span className="text-xs font-extrabold text-zinc-900 block">
                    1. Ngekos Sendiri (1 Kamar Penuh)
                  </span>
                  <span className="text-[11px] font-bold text-[hsl(186,72%,24%)] block mt-0.5">
                    {formatRupiah(room.monthlyPrice)} / Semester
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Menempati 1 kamar penuh sendirian & bayar sendiri.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOccupancyMode('PER_ORANG_1_SLOT')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${occupancyMode === 'PER_ORANG_1_SLOT'
                      ? 'border-[hsl(186,72%,24%)] bg-blue-50/70 ring-2 ring-[hsl(186,72%,24%)]/20'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                >
                  <span className="text-xs font-extrabold text-zinc-900 block">
                    2. Masuk Sendiri (1 Slot / Per Orang)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                    {formatRupiah(Math.round(room.monthlyPrice / 2))} / Orang
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Belum ada teman / bayar sendiri-sendiri (sisa 1 slot kamar).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOccupancyMode('BERDUA_GABUNG')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${occupancyMode === 'BERDUA_GABUNG'
                      ? 'border-[hsl(186,72%,24%)] bg-blue-50/70 ring-2 ring-[hsl(186,72%,24%)]/20'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                >
                  <span className="text-xs font-extrabold text-zinc-900 block">
                    3. Ngekos Berdua (Gabung 2 Orang)
                  </span>
                  <span className="text-[11px] font-bold text-[hsl(186,72%,24%)] block mt-0.5">
                    {formatRupiah(room.monthlyPrice)} / Kamar (2 Putri)
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Datang langsung berdua dengan teman sekamar.
                  </span>
                </button>
              </div>
            </div>

            {occupancyMode === 'BERDUA_GABUNG' && (
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <label className="block text-xs font-bold text-zinc-800 mb-1">
                  Nama Lengkap Penghuni ke-2 (Teman Sekamar)
                </label>
                <input
                  type="text"
                  value={roommateName}
                  onChange={(e) => setRoommateName(e.target.value)}
                  placeholder="Contoh: Nabila Khairunnisa (Teman Sekamar Kamar ini)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-none focus:border-[hsl(186,72%,24%)]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tanggal Rencana Masuk
              </label>
              <input
                type="date"
                name="checkInDate"
                min={minDateString}
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Sesuai SOP Kos Omi untuk persiapan sanitasi dan kelengkapan kamar.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Durasi Sewa (Ketentuan Kos Omi)
              </label>
              <div className="w-full px-3 py-2 text-sm font-bold text-zinc-900 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <span>1 Semester (6 Bulan)</span>
                <span className="text-[11px] font-semibold text-[hsl(186,72%,24%)] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Tetap
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Sesuai ketentuan Kos Omi, sewa kamar berlaku per 1 Semester (6 Bulan).
              </span>
            </div>
          </div>
        </Card>

        {/* 2. DATA IDENTITAS CALON PENGHUNI */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <User size={18} className="text-[hsl(186,72%,24%)]" />
            Identitas Calon Penghuni
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Contoh: Zahra Aulia Putri"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Pekerjaan / Kampus / Instansi</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                placeholder="Contoh: Mahasiswi UIN Imam Bonjol Padang"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="081234567890"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Alamat Email Aktif</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>
          </div>
        </Card>

        {/* 3. KONTAK DARURAT */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <Phone size={18} className="text-[hsl(186,72%,24%)]" />
            Kontak Darurat (Keluarga / Kerabat)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nama Kontak</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                required
                placeholder="Contoh: Dewi Lestari"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Hubungan</label>
              <input
                type="text"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                required
                placeholder="Contoh: Kakak Kandung / Orang Tua"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                placeholder="0813xxxxxxxx"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:border-[hsl(186,72%,24%)]"
              />
            </div>
          </div>
        </Card>

        {/* 4. UNGGAH FOTO KTM ATAU KRS */}
        <Card className="p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-zinc-900 pb-2 border-b border-zinc-100 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Unggah Foto KTM (Kartu Tanda Mahasiswa) atau KRS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center space-y-2 hover:border-[hsl(186,72%,24%)] transition-colors">
              <Upload size={24} className="mx-auto text-zinc-400" />
              <div className="text-xs text-zinc-600">
                <label className="font-bold text-[hsl(186,72%,24%)] cursor-pointer hover:underline">
                  Klik untuk pilih file KTM / KRS
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSimulateKtpUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-zinc-400 mt-1">Format JPG, PNG, atau PDF (Maks 5 MB)</p>
              </div>
            </div>

            {/* Pratinjau KTM / KRS */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center">
              {formData.ktpUrl ? (
                <>
                  <Image
                    src={formData.ktpUrl}
                    alt="Pratinjau KTM / KRS"
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    Pratinjau KTM / KRS Siap Kirim
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-xs text-zinc-400">
                  <FileText size={22} className="mx-auto mb-1 text-zinc-300" />
                  <span>Belum ada foto KTM / KRS dipilih</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 5. PERSETUJUAN ATURAN KOS */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3 text-xs text-zinc-700">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="agreedToRules"
              checked={formData.agreedToRules}
              onChange={handleChange}
              required
              className="mt-0.5 rounded text-[hsl(186,72%,24%)] focus:ring-[hsl(186,72%,24%)]"
            />
            <span>
              Saya menyatakan bahwa data yang diisikan adalah benar dan valid. Saya menyetujui seluruh tata tertib Kos Omi, termasuk batas tamu hingga pukul 22.00 WIB, menjaga kebersihan kamar, dan ketentuan pembayaran sewa per 1 Semester (6 Bulan).
            </span>
          </label>
        </div>
      </div>

      {/* KOLOM KANAN (5 Kolom): Ringkasan Kamar & Total Pembayaran */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
        <Card className="p-6 space-y-5 bg-white">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
              <Image
                src={room.photoUrls[0]}
                alt={`Kamar ${room.code}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 font-medium">Kamar Pilihan</span>
              <h2 className="font-heading font-extrabold text-lg text-zinc-900 leading-tight">
                Kamar {room.code}
              </h2>
              <span className="text-xs text-[hsl(186,72%,24%)] font-semibold">
                Lantai {room.floor} · {ROOM_TYPE_LABELS[room.type]}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-zinc-600">
            <div className="flex justify-between items-center">
              <span>Biaya Sewa (1 Semester / 6 Bulan)</span>
              <span className="font-bold text-zinc-800 tabular-nums">{formatRupiah(monthlyPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Biaya Verifikasi & Administrasi</span>
              <span className="font-bold text-emerald-600">Gratis (Rp 0)</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-zinc-100 text-base font-extrabold text-[hsl(186,72%,24%)]">
              <span>Total Pembayaran Awal</span>
              <span className="tabular-nums">{formatRupiah(totalInitial)}</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-lg text-xs text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-700">Alur Setelah Pengajuan:</p>
            <p>1. Tim Kos Omi memeriksa kelengkapan data & KTM / KRS (maks. 2x24 jam).</p>
            <p>2. Setelah disetujui, Pembayaran otomatis via Transfer Bank / Virtual Account (BCA, BRI, BNI, Mandiri, Permata), QRIS, serta E-Wallet (GoPay, ShopeePay) melalui Midtrans (batas 24 jam).</p>
            <p>3. Kamar resmi menjadi milik Anda dan siap huni.</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Mengirim Data Reservasi...' : 'Kirim Pengajuan Reservasi'}
            <ArrowRight size={16} />
          </button>

          <NextLink
            href={`/kamar/${room.code}`}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 font-semibold py-1"
          >
            <ArrowLeft size={13} />
            Batal & Kembali ke Detail Kamar
          </NextLink>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
            <Lock size={13} className="text-sky-600" />
            <span>Privasi data KTM / KRS mahasiswi terlindungi di Kos Omi</span>
          </div>
        </Card>
      </div>
    </form>
  );
};
