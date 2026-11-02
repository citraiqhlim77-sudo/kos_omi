'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Building2,
  Users,
  Wallet,
  Home,
  UserCheck,
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/data/auth-demo';
import { loginAction } from '@/actions/auth';
import { validateEmail, validatePassword } from '@/lib/validations/auth';
import { UserRole } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();

  // Form State (Kosong di awal agar dapat diketik manual atau dipilih dari tombol simulasi)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Validation & UI State
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRedirect, setSuccessRedirect] = useState<string | null>(null);

  // Field errors
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password, 6) : null;

  // Handle Demo Account Click
  const handleSelectDemoAccount = (role: UserRole) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!acc) return;
    setSelectedRole(role);
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
    setTouched({ email: true, password: true });
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const eErr = validateEmail(email);
    const pErr = validatePassword(password, 6);

    if (eErr || pErr) {
      setErrorMessage(eErr || pErr || 'Mohon periksa kembali isian form Anda.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAction(email, password);

      if (!res.success) {
        setErrorMessage(res.message);
        setIsLoading(false);
        return;
      }

      const target = res.redirectUrl || '/calon/dashboard';
      setSuccessRedirect(target);

      // Redirect ke dashboard role yang bersangkutan
      setTimeout(() => {
        router.push(target);
        router.refresh();
      }, 600);
    } catch {
      setErrorMessage('Terjadi kendala saat memproses login. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'PENGELOLA':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'KEUANGAN':
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case 'PENGHUNI':
        return <Home className="w-4 h-4 text-sky-600" />;
      case 'CALON_PENGHUNI':
      default:
        return <UserCheck className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(186,72%,24%)] text-white font-extrabold text-xl mb-2 overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Masuk ke Akun Kos Omi
          </h1>
          <p className="text-sm text-zinc-600 max-w-md mx-auto">
            Gunakan akun terdaftar atau pilih simulasi peran di bawah untuk menguji dashboard masing-masing role.
          </p>
        </div>

        {/* Demo Role Switcher Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">
              Pilih Simulasi Peran (Demo Quick Fill)
            </span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              5 Role Tersedia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = selectedRole === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc.role)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] ring-2 ring-[hsl(186,72%,24%)]/20'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="p-1 rounded bg-white border border-zinc-100">
                      {getRoleIcon(acc.role)}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[hsl(186,72%,24%)] stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{acc.roleLabel}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{acc.email}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRole && (
            <div className="text-xs text-zinc-600 bg-zinc-50 px-3 py-2.5 rounded-xl border border-zinc-200 flex items-center justify-between gap-2">
              <span className="font-medium text-zinc-500">Tujuan Dasbor:</span>
              <NextLink
                href={DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.dashboardPath || '/calon/dashboard'}
                className="inline-flex items-center gap-1.5 font-bold text-[hsl(186,72%,24%)] bg-white hover:bg-[hsl(180,33%,95%)] px-3 py-1 rounded-lg border border-[hsl(186,50%,82%)] transition-colors"
              >
                <span>{DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.roleDescription || 'Portal Calon Penghuni'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>
          )}
        </div>

        {/* Main Login Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Autentikasi Belum Sesuai</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {successRedirect && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 stroke-[3]" />
              <p className="font-medium">
                Berhasil masuk! Mengalihkan ke{' '}
                <span className="font-bold">
                  {DEMO_ACCOUNTS.find((a) => a.role === selectedRole)?.roleDescription || 'Dasbor'}
                </span>
                ...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-zinc-700">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="nama@domain.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-zinc-900 transition-colors focus:outline-none ${
                    emailError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-zinc-300 focus:border-[hsl(186,72%,24%)] focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {emailError && <p className="text-[11px] text-rose-600 font-medium pl-1">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-zinc-700">
                  Kata Sandi
                </label>
                <NextLink
                  href="/lupa-password"
                  className="text-xs font-semibold text-[hsl(186,72%,24%)] hover:underline"
                >
                  Lupa Kata Sandi?
                </NextLink>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  placeholder="Masukkan kata sandi akun"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-zinc-900 transition-colors focus:outline-none ${
                    passwordError
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-zinc-300 focus:border-[hsl(186,72%,24%)] focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="text-[11px] text-rose-600 font-medium pl-1">{passwordError}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[hsl(186,72%,24%)] border-zinc-300 rounded focus:ring-[hsl(186,72%,24%)]"
              />
              <label htmlFor="rememberMe" className="ml-2.5 text-xs text-zinc-600 select-none cursor-pointer">
                Ingat sesi saya di browser ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || Boolean(successRedirect)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dasbor</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600">
              Belum memiliki akun reservasi?{' '}
              <NextLink
                href="/daftar"
                className="font-bold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-1"
              >
                Daftar Akun Calon Penghuni
              </NextLink>
            </p>
          </div>
        </div>

        {/* Security Footer Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sesi terenkripsi & otorisasi multi-peran Kos Omi 67 Kamar</span>
        </div>
      </div>
    </div>
  );
}
