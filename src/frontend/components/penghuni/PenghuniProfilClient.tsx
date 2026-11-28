'use client';

import React,{ useState } from 'react';
import { useRouter } from 'next/navigation';
import { TenantProfile } from '@/types/billing';
import { LogoutButton } from '@/components/layout/LogoutButton';
import { updateTenantProfileAction } from '@/actions/billing';
import { changeUserPasswordAction } from '@/actions/auth';
import { getClientSession,setClientSession } from '@/lib/auth-client';
import {
Mail,
Phone,
ShieldCheck,
CheckCircle2,
AlertCircle,
Save,
KeyRound,
IdCard,
Eye,
EyeOff,
Sparkles,
} from 'lucide-react';

interface PenghuniProfilClientProps {
  initialProfile: TenantProfile;
}

export const PenghuniProfilClient: React.FC<PenghuniProfilClientProps> = ({
  initialProfile,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState<TenantProfile>(initialProfile);
  const [name, setName] = useState(initialProfile.name || '');
  const [nik] = useState(
    initialProfile.nik && !initialProfile.nik.startsWith('2026') ? initialProfile.nik : ''
  );
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(
    initialProfile.phone && initialProfile.phone !== '-' ? initialProfile.phone : ''
  );
  const [emergencyContact, setEmergencyContact] = useState(
    (initialProfile.emergencyContact && initialProfile.emergencyContact !== '-') ||
      (initialProfile.emergencyContactPhone && initialProfile.emergencyContactPhone !== '-')
      ? initialProfile.emergencyContact || initialProfile.emergencyContactPhone || ''
      : ''
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const isUsingInitialKosEmail = (profile.email || '').toLowerCase().endsWith('@kosomi.id');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setFeedback({
          type: 'error',
          message: 'Kata sandi baru minimal 6 karakter.',
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

    // 1. Simpan perubahan Email Pribadi, Nama, No. WA, & Kontak Darurat terlebih dahulu (mengacu pada email sebelumnya)
    const res = await updateTenantProfileAction({
      previousEmail: profile.email,
      name,
      nik,
      email,
      phone,
      emergencyContact,
    });

    if (!res.success || !res.profile) {
      setFeedback({
        type: 'error',
        message: res.message || 'Gagal menyimpan profil.',
      });
      setIsSaving(false);
      return;
    }

    // 2. Jika kata sandi baru diisi, perbarui kata sandi dengan Bcrypt satu arah
    if (newPassword) {
      const pwRes = await changeUserPasswordAction({
        email: res.profile.email,
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      if (!pwRes.success) {
        setFeedback({
          type: 'error',
          message: pwRes.message,
        });
        setIsSaving(false);
        return;
      }
    }

    setProfile(res.profile);
    setEmail(res.profile.email);

    // Sinkronkan juga ke sesi client lokal agar navigasi & dasbor langsung menampilkan email/nama baru
    const existingSession = getClientSession();
    if (existingSession) {
      setClientSession({
        ...existingSession,
        name: res.profile.name,
        email: res.profile.email,
      });
    }

    setFeedback({
      type: 'success',
      message: newPassword
        ? `${res.message} Kata sandi pribadi Anda juga telah dienkripsi ulang.`
        : res.message,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner Panduan Login Pertama Penghuni Tetap */}
      {isUsingInitialKosEmail && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="font-bold text-sm">
              Lengkapi Email Gmail Pribadi & Kata Sandi Baru Anda
            </p>
            <p className="text-amber-900">
              Saat ini akun Kamar No. <strong>{profile.roomCode}</strong> Anda masih memakai email awal sistem (
              <code className="font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                {profile.email}
              </code>
              ). Silakan ganti kolom <strong>Alamat Email Pribadi</strong> di bawah menjadi email asli Anda (misalnya{' '}
              <code>@gmail.com</code> atau <code>@uinib.ac.id</code>), isi nomor WhatsApp aktif, dan buat kata sandi pribadi Anda.
            </p>
          </div>
        </div>
      )}

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
            Profil, Email Pribadi & Keamanan Sandi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Atur alamat email pribadi untuk login, nomor WhatsApp aktif, dan kata sandi rahasia Anda.
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
        {/* SECTION 1: IDENTITAS & EMAIL PRIBADI */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-zinc-900">Identitas & Email Login Pribadi</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Penghuni Terdaftar Kamar No. {profile.roomCode}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-semibold focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Email Pribadi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.anda@gmail.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-semibold focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Ganti dengan Gmail / email kampus aktif Anda untuk login berikutnya & pemulihan lupa sandi.
              </span>
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
                Kontak Darurat (Orang Tua / Wali) <span className="text-rose-500">*</span>
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
                Nomor keluarga yang dapat dihubungi saat situasi darurat.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KEAMANAN KATA SANDI */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-5">
          <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-zinc-900">
              Buat / Ubah Kata Sandi Pribadi (Terenkripsi Bcrypt)
            </h2>
          </div>

          <p className="text-xs text-zinc-500">
            Kata sandi Anda dienkripsi satu arah (Admin pun tidak dapat melihat kata sandi Anda). Biarkan kosong jika tidak ingin mengubah kata sandi saat ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">
                Kata Sandi Baru (Min. 6 Karakter)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik kata sandi rahasia baru"
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 mb-1">Ulangi Kata Sandi Baru</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                minLength={6}
                autoComplete="new-password"
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
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Email, Kontak & Sandi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
