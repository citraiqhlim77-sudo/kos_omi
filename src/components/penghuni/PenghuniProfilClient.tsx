'use client';

import React, { useState } from 'react';
import { TenantProfile } from '@/types/billing';
import { LogoutButton } from '@/components/layout/LogoutButton';
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
  const [name, setName] = useState(initialProfile.name || '');
  const [nik, setNik] = useState(initialProfile.nik || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(
    initialProfile.emergencyContact ||
      initialProfile.emergencyContactPhone ||
      ''
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
      name,
      nik,
      email,
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
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-150 ${
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
            className="text-zinc-500 hover:text-zinc-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Pengaturan Akun Penghuni
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Profil & Keamanan Akun
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Perbarui nomor kontak aktif WhatsApp dan atur kata sandi akun portal penghuni Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 h-10 rounded-xl bg-blue-50 text-[hsl(186,72%,24%)] font-extrabold text-xs flex items-center justify-center border border-blue-200">
            Kamar No. {profile.roomCode}
          </div>
          <LogoutButton variant="danger" label="Keluar dari Akun" />
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* SECTION 1: IDENTITAS PENGHUNI (KTP VERIFIED) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-zinc-900">Identitas Terverifikasi</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KTP Terverifikasi Pengelola</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-semibold focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Masukkan 16 digit NIK KTP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 tabular-nums focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Alamat Email Terdaftar</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Kamar Aktif Ditempati</label>
              <input
                type="text"
                value={`Kamar No. ${profile.roomCode}`}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 font-bold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: KONTAK & WHATSAPP */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Kontak Aktif & Kontak Darurat</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Digunakan untuk notifikasi tagihan dan komunikasi pengelola.
              </span>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Kontak Darurat (Keluarga / Kerabat) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Contoh: 081299887766 (Ibu / Bapak)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Nomor yang dapat dihubungi saat situasi genting / darurat medis.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KEAMANAN KATA SANDI */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">Ubah Kata Sandi (Opsional)</h2>
          </div>

          <p className="text-xs text-zinc-500">
            Biarkan kosong jika Anda tidak ingin mengubah kata sandi akun saat ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Ulangi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
