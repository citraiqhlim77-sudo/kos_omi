'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { validateEmail } from '@/lib/validations/auth';
import { forgotPasswordAction } from '@/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeResetToken, setActiveResetToken] = useState<string | null>(null);

  const emailError = touched ? validateEmail(email) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const err = validateEmail(email);
    if (err) {
      setErrorMessage(err);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await forgotPasswordAction(email);
      if (res.success) {
        setActiveResetToken(res.resetToken ?? null);
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Gagal mengirim tautan reset. Silakan coba kembali.');
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
            Pemulihan Kata Sandi
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Masukkan alamat email akun Kos Omi Anda. Kami akan mengirimkan tautan aman untuk mengatur ulang kata sandi.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {isSubmitted ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-emerald-950">Tautan Pemulihan Terkirim</p>
                  <p>
                    Instruksi reset password telah dikirim ke <span className="font-bold">{email}</span>. Tautan ini hanya berlaku selama <span className="font-semibold">30 menit</span>.
                  </p>
                </div>
              </div>

              {/* Tautan pengembangan: hanya muncul selama pengiriman email (Task 3.1) belum aktif */}
              {activeResetToken && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs font-bold text-slate-700">Mode pengembangan</p>
                  <p className="text-xs text-slate-600">
                    Email belum dikirim pada tahap ini. Gunakan tautan sekali pakai berikut (berlaku 30 menit):
                  </p>
                  <NextLink
                    href={`/reset-password/${activeResetToken}`}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] transition-colors"
                  >
                    <span>Buka Form Reset Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Belum menerima email? Kirim ulang formulir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                  Alamat Email Terdaftar <span className="text-rose-500">*</span>
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
                    onBlur={() => setTouched(true)}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim Tautan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Tautan Pemulihan</span>
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </NextLink>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>Tautan reset dibuat otomatis dengan enkripsi token sekali pakai</span>
        </div>
      </div>
    </div>
  );
}
