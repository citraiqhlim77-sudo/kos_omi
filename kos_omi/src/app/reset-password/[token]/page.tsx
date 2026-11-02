'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { calculatePasswordStrength, validatePassword } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/actions/auth';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === 'string' ? params.token : 'token-tidak-diketahui';

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validasi
  const passwordError = touched.password ? validatePassword(password, 8) : null;
  const confirmError = touched.confirmPassword
    ? !confirmPassword
      ? 'Konfirmasi kata sandi wajib diisi'
      : confirmPassword !== password
      ? 'Konfirmasi kata sandi tidak cocok'
      : null
    : null;

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const pErr = validatePassword(password, 8);
    const cErr = confirmPassword !== password ? 'Konfirmasi kata sandi tidak cocok' : null;

    if (pErr || cErr) {
      setErrorMessage(pErr || cErr || 'Mohon periksa kata sandi baru Anda');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Jika token adalah sandbox/demo fallback, terima juga untuk pengujian UI
      if (token === 'demo-token-12345') {
        await new Promise((r) => setTimeout(r, 600));
        setIsSuccess(true);
      } else {
        const res = await resetPasswordAction(token, password);
        if (res.success) {
          setIsSuccess(true);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memperbarui kata sandi. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(217,91%,45%)] text-white shadow-sm mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Atur Kata Sandi Baru
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Masukkan kombinasi kata sandi baru yang aman untuk akun Kos Omi Anda.
          </p>
        </div>

        {/* Token Info Strip */}
        <div className="bg-slate-100/70 border border-slate-200/80 px-3.5 py-2 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
          <span>Token Validasi:</span>
          <code className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[180px]">
            {token}
          </code>
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {isSuccess ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-emerald-950">Kata Sandi Berhasil Diperbarui!</p>
                  <p>
                    Anda sekarang dapat masuk menggunakan kata sandi baru ini ke seluruh dasbor dan layanan Kos Omi.
                  </p>
                </div>
              </div>

              <NextLink
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </NextLink>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Password Baru */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
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

                {/* Password Strength Meter */}
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

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
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
                    placeholder="Ketik ulang kata sandi baru"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan Kata Sandi...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <NextLink
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Batalkan dan kembali ke Halaman Masuk
            </NextLink>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sandi di-hash dengan standar keamanan bcryptjs sebelum disimpan</span>
        </div>
      </div>
    </div>
  );
}
