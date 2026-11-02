'use client';

import React, { useState, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface CalonProfilClientProps {
  initialUser: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export const CalonProfilClient: React.FC<CalonProfilClientProps> = ({ initialUser }) => {
  const [profileData, setProfileData] = useState({
    name: initialUser.name,
    email: initialUser.email,
    phone: initialUser.phone,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setProfileSuccess(false);

    startTransition(async () => {
      // Simulasi update data profil di server
      setTimeout(() => {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 4000);
      }, 500);
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordSuccess(false);

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Kata sandi baru wajib terdiri dari minimal 8 karakter.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    startTransition(async () => {
      // Simulasi ganti password di server
      setTimeout(() => {
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setPasswordSuccess(false), 4000);
      }, 600);
    });
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {profileSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Informasi profil Anda berhasil diperbarui di sistem.</span>
        </div>
      )}

      {passwordSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Kata sandi akun Anda berhasil diubah.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Data Diri */}
        <Card className="p-6 space-y-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-[hsl(217,91%,45%)]" />
            <h2 className="font-heading font-extrabold text-base text-slate-900">
              Informasi Data Diri
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Email digunakan sebagai identitas akun utama dan tidak dapat diubah.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                required
                placeholder="08xxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-[hsl(217,91%,45%)]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Digunakan untuk menerima notifikasi verifikasi reservasi dan invoice dari pengelola.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Simpan Perubahan Data Diri
              </button>
            </div>
          </form>
        </Card>

        {/* Form Ganti Password */}
        <Card className="p-6 space-y-5 bg-white border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-slate-700" />
            <h2 className="font-heading font-extrabold text-base text-slate-900">
              Ganti Kata Sandi
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi Baru (Min. 8 Karakter)
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-hidden focus:border-[hsl(217,91%,45%)]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
