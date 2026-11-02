'use client';

import React, { useState } from 'react';
import { AdminSettings } from '@/types/admin';
import { updateAdminSettingsAction } from '@/actions/admin';
import {
  Settings,
  Save,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Calendar,
  ShieldCheck,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AdminPengaturanClientProps {
  initialSettings: AdminSettings;
}

export const AdminPengaturanClient: React.FC<AdminPengaturanClientProps> = ({
  initialSettings,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await updateAdminSettingsAction(settings);

    if (res.success) {
      setSettings(res.settings);
      setToastMessage('Pengaturan bisnis Kos Omi berhasil diperbarui!');
      setTimeout(() => setToastMessage(null), 5000);
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Konfigurasi Global
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Pengaturan Sistem & Bisnis Kos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Atur parameter operasional kos seperti tanggal jatuh tempo tagihan sewa, persentase deposit, dan profil properti.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Properti */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Identitas Properti Kos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Kos Resmi *</label>
              <input
                type="text"
                value={settings.kosName}
                onChange={(e) => setSettings({ ...settings, kosName: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Properti Lengkap *</label>
              <textarea
                rows={2}
                value={settings.kosAddress}
                onChange={(e) => setSettings({ ...settings, kosAddress: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Admin Kos *</label>
              <input
                type="tel"
                value={settings.adminPhone}
                onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Zona Waktu Operasional</label>
              <input
                type="text"
                value={settings.timezone}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Kebijakan Sewa & Tagihan */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Kebijakan Tagihan & Deposit</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Jatuh Tempo Sewa Default (PRD Bab 3.E)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={settings.dueDay}
                  onChange={(e) => setSettings({ ...settings, dueDay: Number(e.target.value) })}
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center"
                />
                <span className="text-slate-600 font-medium">Setiap bulan (Tanggal 5)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Cron otomatis menerbitkan invoice H-7 dan menandai terlambat H+3.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Persentase Uang Jaminan (Deposit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={settings.depositPercentage}
                  onChange={(e) => setSettings({ ...settings, depositPercentage: Number(e.target.value) })}
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center"
                />
                <span className="text-slate-600 font-medium">% (1 Bulan Sewa)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Deposit ditagihkan saat reservasi disetujui bersama biaya bulan pertama.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Masa Berlaku Invoice Booking (Batas Waktu Bayar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={settings.bookingWindowHours}
                  onChange={(e) => setSettings({ ...settings, bookingWindowHours: Number(e.target.value) })}
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 text-center"
                />
                <span className="text-slate-600 font-medium">Jam (Default 24 Jam)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Jika lewat 24 jam belum dibayar, kamar otomatis kembali Tersedia.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Denda Keterlambatan
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center justify-between">
                <span>Nonaktif pada Versi Awal (MVP)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                  Sesuai PRD
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Status TERLAMBAT hanya sebagai penanda untuk tindak lanjut pengelola.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan Bisnis'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
