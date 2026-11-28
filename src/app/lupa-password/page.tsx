'use client';

import React,{ useState } from 'react';
import NextLink from 'next/link';
import {
Phone,
User,
ArrowLeft,
CheckCircle2,
AlertCircle,
ShieldCheck,
KeyRound,
MessageCircle,
} from 'lucide-react';
import { forgotPasswordAction } from '@/actions/auth';

function validateWhatsappPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 'Nomor WhatsApp wajib diisi';
  const normalized = digits.startsWith('0')
    ? `62${digits.slice(1)}`
    : digits.startsWith('8')
      ? `62${digits}`
      : digits;
  if (!normalized.startsWith('628') || normalized.length < 10 || normalized.length > 15) {
    return 'Masukkan nomor WhatsApp aktif yang valid (contoh: 081234567890)';
  }
  return null;
}

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const phoneError = touched ? validateWhatsappPhone(phone) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const err = validateWhatsappPhone(phone);
    if (err) {
      setErrorMessage(err);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await forgotPasswordAction(phone, fullName);
      if (res.success) {
        const waUrl = res.adminWhatsappUrl ?? null;
        setWhatsappUrl(waUrl);
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Gagal mencatat permintaan reset. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(186,72%,24%)] text-white mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Reset Kata Sandi via WhatsApp
          </h1>
          <p className="text-sm text-zinc-600 max-w-sm mx-auto">
            Masukkan nomor WhatsApp terdaftar Anda untuk mengajukan reset kata sandi langsung ke Admin Kos Omi.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
          {isSubmitted ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 text-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-emerald-950">Permintaan Reset Tercatat</p>
                  <p className="leading-relaxed">
                    Permintaan reset kata sandi untuk nomor WhatsApp <span className="font-bold">{phone}</span> sudah tercatat. Klik tombol di bawah untuk langsung mengirim pesan ke WhatsApp Ibu Admin Kos Omi.
                  </p>
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Reset via WhatsApp Admin (0813-7432-9562)</span>
                </a>
              )}

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1 leading-relaxed">
                <p className="font-bold text-zinc-800">Langkah Pemulihan:</p>
                <p>1. Kirim pesan konfirmasi WhatsApp ke Admin Kos Omi (Ibu Yulastri: 0813-7432-9562).</p>
                <p>2. Admin akan mereset kata sandi akun Anda dan mengirimkan kata sandi sementara via WhatsApp.</p>
                <p>3. Setelah berhasil masuk, segera ganti kata sandi baru di menu <strong>Profil</strong>.</p>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  Gunakan nomor WhatsApp lain
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
                <label htmlFor="fullName" className="block text-xs font-bold text-zinc-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Aletha Ananda"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 transition-colors focus:outline-none focus:border-[hsl(186,72%,24%)] focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-bold text-zinc-700">
                  Nomor WhatsApp Terdaftar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="081234567890"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-zinc-900 transition-colors focus:outline-none ${
                      phoneError
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-zinc-300 focus:border-[hsl(186,72%,24%)] focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20'
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {phoneError && (
                  <p className="text-[11px] text-rose-600 font-medium pl-1">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyiapkan Pesan WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Ajukan Reset via WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <NextLink
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </NextLink>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Kata sandi terenkripsi Bcrypt satu arah & diverifikasi langsung via WhatsApp Admin Kos Omi</span>
        </div>
      </div>
    </div>
  );
}
