'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { setClientSession } from '@/lib/auth-client';
import { registerAction } from '@/actions/auth';
import {
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
  calculatePasswordStrength,
} from '@/lib/validations/auth';
import { AuthUser } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Field Validations
  const nameError = touched.fullName ? validateFullName(fullName) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const phoneError = touched.phone ? validatePhone(phone) : null;
  const passwordError = touched.password ? validatePassword(password, 8) : null;

  const confirmError = touched.confirmPassword
    ? !confirmPassword
      ? 'Konfirmasi kata sandi wajib diisi'
      : confirmPassword !== password
      ? 'Konfirmasi kata sandi tidak cocok dengan kata sandi di atas'
      : null
    : null;

  const termsError = touched.terms && !agreedToTerms ? 'Anda wajib menyetujui ketentuan dan tata tertib sewa Kos Omi' : null;

  // Password strength
  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    const vName = validateFullName(fullName);
    const vEmail = validateEmail(email);
    const vPhone = validatePhone(phone);
    const vPass = validatePassword(password, 8);
    const vConf = confirmPassword !== password ? 'Konfirmasi kata sandi tidak cocok' : null;
    const vTerms = !agreedToTerms ? 'Syarat dan ketentuan wajib disetujui' : null;

    if (vName || vEmail || vPhone || vPass || vConf || vTerms) {
      setErrorMessage(vName || vEmail || vPhone || vPass || vConf || vTerms || 'Mohon lengkapi seluruh kolom formulir');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await registerAction({
        name: fullName,
        email,
        phone,
        password,
      });

      if (!res.success) {
        setErrorMessage(res.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push(res.redirectUrl || '/calon/dashboard');
        router.refresh();
      }, 1000);
    } catch {
      setErrorMessage('Terjadi kendala saat mendaftarkan akun. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(217,91%,45%)] text-white font-extrabold text-xl shadow-sm mb-2">
            KO
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Daftar Akun Calon Penghuni
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Buat akun baru untuk mengajukan reservasi kamar Kos Omi Sungai Bangek, Padang, memantau verifikasi, dan pembayaran resmi Midtrans.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Validasi Formulir</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-sm">Pendaftaran Berhasil!</p>
                <p>Akun Anda telah aktif sebagai Calon Penghuni. Mengalihkan ke dasbor reservasi...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                  placeholder="Contoh: Bagas Kurniawan"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                    nameError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {nameError && <p className="text-[11px] text-rose-600 font-medium pl-1">{nameError}</p>}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                  Email Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    placeholder="nama@email.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                      emailError
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {emailError && <p className="text-[11px] text-rose-600 font-medium pl-1">{emailError}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    placeholder="081234567890"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                      phoneError
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {phoneError && <p className="text-[11px] text-rose-600 font-medium pl-1">{phoneError}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="Minimal 8 karakter kombinasi huruf & angka"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                    passwordError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Kekuatan Sandi:</span>
                    <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 1 ? passwordStrength.colorClass : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 2 ? passwordStrength.colorClass : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 3 ? passwordStrength.colorClass : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 4 ? passwordStrength.colorClass : 'bg-slate-200'
                      }`}
                    />
                  </div>
                </div>
              )}

              {passwordError && <p className="text-[11px] text-rose-600 font-medium pl-1">{passwordError}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700">
                Ulangi Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                  placeholder="Ketik ulang kata sandi Anda"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 transition-colors focus:outline-none ${
                    confirmError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[hsl(217,91%,45%)] focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmError && <p className="text-[11px] text-rose-600 font-medium pl-1">{confirmError}</p>}
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <div className="flex items-start">
                <input
                  id="agreedToTerms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  onBlur={() => setTouched((prev) => ({ ...prev, terms: true }))}
                  className="mt-0.5 w-4 h-4 text-[hsl(217,91%,45%)] border-slate-300 rounded focus:ring-[hsl(217,91%,45%)]"
                />
                <label htmlFor="agreedToTerms" className="ml-2.5 text-xs text-slate-600 select-none leading-relaxed">
                  Saya menyatakan bahwa data yang saya masukkan adalah benar, dan saya menyetujui seluruh{' '}
                  <NextLink href="/faq" className="font-semibold text-[hsl(217,91%,45%)] hover:underline">
                    Tata Tertib Hunian Kos Omi
                  </NextLink>{' '}
                  serta kebijakan deposit sewa.
                </label>
              </div>
              {termsError && <p className="text-[11px] text-rose-600 font-medium mt-1 pl-6">{termsError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuat Akun Calon Penghuni...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Sudah memiliki akun?{' '}
              <NextLink href="/login" className="font-bold text-[hsl(217,91%,45%)] hover:underline">
                Masuk di Sini
              </NextLink>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data pribadi dan nomor kontak Anda terenkripsi aman</span>
        </div>
      </div>
    </div>
  );
}
