'use client';

import React, { useState } from 'react';
import { TenantProfile } from '@/types/billing';
import { updateTenantProfileAction } from '@/actions/billing';
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  IdCard,
} from 'lucide-react';

interface PenghuniProfilClientProps {
  initialProfile: TenantProfile;
}

export const PenghuniProfilClient: React.FC<PenghuniProfilClientProps> = ({
  initialProfile,
}) => {
  const [profile, setProfile] = useState<TenantProfile>(initialProfile);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [emergencyContact, setEmergencyContact] = useState(
    initialProfile.emergencyContact ||
      initialProfile.emergencyContactPhone ||
      '081233334444'
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    // Validasi password jika diisi
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setFeedback({
          type: 'error',
          message: 'Kata sandi baru minimal 8 karakter.',
        });
        setIsSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({
          type: 'error',
          message: 'Konfirmasi kata sandi baru tidak cocok.',
        });
        setIsSaving(false);
        return;
      }
    }

    const res = await updateTenantProfileAction({
      phone,
      emergencyContact,
    });

    if (res.success && res.profile) {
      setProfile(res.profile);
      setFeedback({
        type: 'success',
        message: 'Data profil dan kontak penghuni berhasil diperbarui!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({
        type: 'error',
        message: res.message || 'Gagal menyimpan profil.',
      });
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast / Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Pengaturan Akun Penghuni
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Profil & Keamanan Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Perbarui nomor kontak aktif WhatsApp dan atur kata sandi akun portal penghuni Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[hsl(217,91%,45%)] font-extrabold text-base flex items-center justify-center border border-blue-200">
            {profile.roomCode}
          </div>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* SECTION 1: IDENTITAS PENGHUNI (KTP VERIFIED) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Identitas Terverifikasi</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KTP Terverifikasi Pengelola</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                value={profile.name}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Perubahan nama resmi memerlukan konfirmasi langsung ke pengelola kos.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
              <input
                type="text"
                value="3273220501980002"
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Data KTP terenkripsi dan terlindungi kerahasiaannya.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Email Terdaftar</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kamar Aktif Ditempati</label>
              <input
                type="text"
                value={`Kamar ${profile.roomCode} (Lantai 1 - Standar AC)`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: KONTAK & WHATSAPP */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Kontak Aktif & Kontak Darurat</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Digunakan untuk notifikasi tagihan dan komunikasi pengelola.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kontak Darurat (Keluarga / Kerabat) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Contoh: 081299887766 (Ibu / Bapak)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nomor yang dapat dihubungi saat situasi genting / darurat medis.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KEAMANAN KATA SANDI */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Ubah Kata Sandi (Opsional)</h2>
          </div>

          <p className="text-xs text-slate-500">
            Biarkan kosong jika Anda tidak ingin mengubah kata sandi akun saat ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ulangi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
