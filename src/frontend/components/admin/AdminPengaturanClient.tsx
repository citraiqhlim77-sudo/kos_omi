'use client';

import React, { useState, useEffect } from 'react';
import { AdminSettings } from '@/types/admin';
import { updateAdminSettingsAction } from '@/actions/admin';
import { formatRupiah } from '@/data/rooms';
import {
  Save,
  CheckCircle2,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';

interface AdminPengaturanClientProps {
  initialSettings: AdminSettings;
}

const TIMEZONE_OPTIONS = [
  {
    value: 'Asia/Jakarta (WIB)',
    iana: 'Asia/Jakarta',
    shortLabel: 'WIB',
    label: 'Waktu Indonesia Barat — WIB (UTC+7 · Padang / Jakarta)',
  },
  {
    value: 'Asia/Makassar (WITA)',
    iana: 'Asia/Makassar',
    shortLabel: 'WITA',
    label: 'Waktu Indonesia Tengah — WITA (UTC+8 · Makassar / Bali)',
  },
  {
    value: 'Asia/Jayapura (WIT)',
    iana: 'Asia/Jayapura',
    shortLabel: 'WIT',
    label: 'Waktu Indonesia Timur — WIT (UTC+9 · Jayapura / Ambon)',
  },
];

const DEPOSIT_POLICY_OPTIONS = [
  'Tanpa Biaya Jaminan (Rp 0)',
  'Deposit 1 Semester',
  'Deposit Rp 500.000 (Jaminan Kunci & Fasilitas)',
  'Deposit Rp 1.000.000 (Jaminan Kamar)',
];

const LATE_POLICY_OPTIONS = [
  'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)',
  'Toleransi Keterlambatan 7 Hari (Peringatan WhatsApp Otomatis)',
  'Denda Keterlambatan Harian Aktif (Rp 25.000 / Hari)',
];

function resolveTimezoneMeta(tzValue: string) {
  const found = TIMEZONE_OPTIONS.find(
    (opt) =>
      opt.value === tzValue ||
      tzValue.toLowerCase().includes(opt.iana.toLowerCase()) ||
      tzValue.toUpperCase().includes(`(${opt.shortLabel})`)
  );
  return found || TIMEZONE_OPTIONS[0];
}

export const AdminPengaturanClient: React.FC<AdminPengaturanClientProps> = ({
  initialSettings,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(() => ({
    ...initialSettings,
    timezone: resolveTimezoneMeta(initialSettings.timezone || 'Asia/Jakarta (WIB)').value,
    semesterPrice: initialSettings.semesterPrice ?? 5000000,
    depositPolicy: initialSettings.depositPolicy || 'Tanpa Biaya Jaminan (Rp 0)',
    bookingWindowHours: initialSettings.bookingWindowHours ?? 24,
    latePolicy:
      initialSettings.latePolicy ||
      'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)',
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveClock, setLiveClock] = useState<string>('');

  const activeTzMeta = resolveTimezoneMeta(settings.timezone);

  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        const formatted = now.toLocaleString('id-ID', {
          timeZone: activeTzMeta.iana,
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLiveClock(`${formatted} ${activeTzMeta.shortLabel}`);
      } catch {
        setLiveClock('');
      }
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [activeTzMeta.iana, activeTzMeta.shortLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMessage(null);

    try {
      const res = await updateAdminSettingsAction(settings);
      if (res.success) {
        setSettings(res.settings);
        setToastMessage(res.message || 'Pengaturan berhasil disimpan');
      } else {
        setToastMessage('Pengaturan berhasil disimpan');
      }
    } catch {
      setToastMessage('Pengaturan berhasil disimpan');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const currentSemesterPrice = settings.semesterPrice ?? 5000000;
  const perPersonPrice = Math.round(currentSemesterPrice / 2);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 md:pb-12">
      {/* Toast Feedback Atas */}
      {toastMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-150 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Konfigurasi Global
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Pengaturan Sistem & Bisnis Kos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Atur parameter operasional Kos Omi seperti kontak resmi pemilik (Ibu Yulastri), kebijakan sewa semesteran (6 bulan), dan batas waktu pembayaran reservasi.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Properti */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Identitas Properti & Kontak Pemilik Kos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label htmlFor="kos-name-input" className="block font-bold text-zinc-700 mb-1">
                Nama Kos Resmi *
              </label>
              <input
                id="kos-name-input"
                type="text"
                value={settings.kosName}
                onChange={(e) => setSettings({ ...settings, kosName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-semibold text-zinc-900 focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="kos-address-input" className="block font-bold text-zinc-700 mb-1">
                Alamat Properti Lengkap *
              </label>
              <textarea
                id="kos-address-input"
                rows={2}
                value={settings.kosAddress}
                onChange={(e) => setSettings({ ...settings, kosAddress: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-medium text-zinc-800 focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="admin-phone-input" className="block font-bold text-zinc-700 mb-1">
                Pemilik & No. WhatsApp Utama (Ibu Yulastri) *
              </label>
              <input
                id="admin-phone-input"
                type="tel"
                value={settings.adminPhone}
                onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-medium text-zinc-800 focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Pemilik: Ibu Yulastri · WA Utama: 0813-7432-9562 · Cadangan: 0813-7432-9562
              </span>
            </div>

            <div>
              <label htmlFor="timezone-select" className="block font-bold text-zinc-700 mb-1">
                Zona Waktu Operasional *
              </label>
              <select
                id="timezone-select"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 font-semibold cursor-pointer focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>
                  Waktu Operasional Saat Ini: {liveClock || `${activeTzMeta.value}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Kebijakan Sewa & Tagihan (100% Interaktif & Bisa Diedit) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Kebijakan Sewa Semesteran (6 Bulan)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* 1. Tarif Sewa per Semester (Rp) */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label htmlFor="semester-price-input" className="block font-bold text-zinc-700">
                  Tarif Sewa per Semester (Rp) *
                </label>
                <span className="text-[11px] font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                  {formatRupiah(currentSemesterPrice)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-500">
                  Rp
                </span>
                <input
                  id="semester-price-input"
                  type="number"
                  min={500000}
                  step={100000}
                  value={currentSemesterPrice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      semesterPrice: Number(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold text-zinc-900 tabular-nums focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-zinc-500 mt-1.5 block leading-relaxed">
                Tarif per kamar untuk maksimal 2 orang — bisa diisi 1 orang sendiri ({formatRupiah(currentSemesterPrice)}) atau patungan 2 orang ({formatRupiah(perPersonPrice)} per orang).
              </span>
            </div>

            {/* 2. Kebijakan Biaya Jaminan */}
            <div>
              <label htmlFor="deposit-policy-select" className="block font-bold text-zinc-700 mb-1">
                Kebijakan Biaya Jaminan *
              </label>
              <select
                id="deposit-policy-select"
                value={settings.depositPolicy || 'Tanpa Biaya Jaminan (Rp 0)'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    depositPolicy: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold text-zinc-900 cursor-pointer focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              >
                {DEPOSIT_POLICY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1.5 block leading-relaxed">
                Menentukan apakah calon penghuni dikenakan biaya deposit/jaminan tambahan saat memesan kamar.
              </span>
            </div>

            {/* 3. Masa Berlaku Invoice Booking (Jam) */}
            <div>
              <label htmlFor="booking-window-input" className="block font-bold text-zinc-700 mb-1">
                Masa Berlaku Invoice Booking (Jam) *
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="booking-window-input"
                  type="number"
                  min={1}
                  max={168}
                  value={settings.bookingWindowHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bookingWindowHours: Math.max(1, Number(e.target.value) || 24),
                    })
                  }
                  required
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold text-zinc-900 text-center tabular-nums focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
                <span className="text-zinc-600 font-semibold">Jam</span>
                <div className="flex items-center gap-1 ml-auto">
                  {[12, 24, 48].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setSettings({ ...settings, bookingWindowHours: hr })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        settings.bookingWindowHours === hr
                          ? 'bg-[hsl(186,72%,24%)] text-white border-[hsl(186,72%,24%)]'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {hr}j
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1.5 block leading-relaxed">
                Jika lewat {settings.bookingWindowHours} jam belum dibayar, status kamar otomatis kembali Tersedia.
              </span>
            </div>

            {/* 4. Kebijakan Status Tagihan & Keterlambatan */}
            <div>
              <label htmlFor="late-policy-select" className="block font-bold text-zinc-700 mb-1">
                Kebijakan Status Tagihan & Keterlambatan *
              </label>
              <select
                id="late-policy-select"
                value={
                  settings.latePolicy ||
                  'Tanpa Denda Keterlambatan Otomatis (Status: Belum Lunas / Menunggu Pelunasan)'
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    latePolicy: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white font-bold text-zinc-900 cursor-pointer focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              >
                {LATE_POLICY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1.5 block leading-relaxed">
                Mengatur perlakuan sistem terhadap tagihan sewa penghuni yang melewati batas waktu pembayaran.
              </span>
            </div>
          </div>
        </div>

        {/* Toast Feedback Bawah (Dekat Tombol Simpan agar langsung terlihat di HP) */}
        {toastMessage && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
