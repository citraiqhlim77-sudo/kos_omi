'use client';

import React,{ useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUserRecord } from '@/types/admin';
import {
createStaffUserAction,
toggleUserStatusAction,
deleteUserAction,
adminUpdateUserPasswordAction,
} from '@/actions/admin';
import {
Search,
UserPlus,
CheckCircle2,
AlertCircle,
X,
Trash2,
UserMinus,
UserCheck,
Eye,
EyeOff,
KeyRound,
Lock,
ShieldCheck,
} from 'lucide-react';

interface AdminPenggunaClientProps {
  initialUsers: AdminUserRecord[];
}

export const AdminPenggunaClient: React.FC<AdminPenggunaClientProps> = ({
  initialUsers,
}) => {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Tambah Staf
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPasswordInput, setShowStaffPasswordInput] = useState(false);
  const [role, setRole] = useState<'PENGELOLA' | 'KEUANGAN'>('PENGELOLA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Reset Kata Sandi Pengguna oleh Admin (Tanpa Melihat Sandi Lama)
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUserRecord | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPasswordInput, setShowResetPasswordInput] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modal Konfirmasi Hapus Pengguna (Sudah Keluar Kos)
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.roomCode && u.roomCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !staffPassword.trim()) return;

    setIsSubmitting(true);
    const res = await createStaffUserAction({
      name,
      email,
      phone,
      role,
      password: staffPassword,
    });

    if (res.success && res.user) {
      setUsers((prev) => [res.user!, ...prev]);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setStaffPassword('');
      setShowStaffPasswordInput(false);
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setIsSubmitting(false);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleResetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword || !newPasswordInput.trim()) return;

    setIsUpdatingPassword(true);
    const res = await adminUpdateUserPasswordAction(
      userToResetPassword.id,
      newPasswordInput.trim()
    );
    setIsUpdatingPassword(false);

    if (res.success && res.user) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToResetPassword.id
            ? { ...u, passwordHashPreview: res.user!.passwordHashPreview }
            : u
        )
      );
      setFeedback({ type: 'success', message: res.message });
      setUserToResetPassword(null);
      setNewPasswordInput('');
      setShowResetPasswordInput(false);
      router.refresh();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 6000);
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await toggleUserStatusAction(userId);
    if (res.success && res.user) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: res.user!.isActive } : u))
      );
      setFeedback({ type: 'success', message: res.message });
      router.refresh();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const res = await deleteUserAction(userToDelete.id);
    setIsDeleting(false);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setFeedback({ type: 'success', message: res.message });
      router.refresh();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const getRoleBadgeClass = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'PENGELOLA':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'KEUANGAN':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENGHUNI':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getRoleDisplayLabel = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'Admin Sistem';
      case 'PENGELOLA':
        return 'Pengelola Kos';
      case 'KEUANGAN':
        return 'Staf Keuangan';
      case 'PENGHUNI':
        return 'Penghuni Aktif';
      case 'CALON_PENGHUNI':
        return 'Calon Penghuni';
      default:
        return r;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
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

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Manajemen Akses, Penghuni & Staf
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enkripsi Sandi Satu Arah (Bcrypt Hash)</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Kelola Pengguna & Keamanan Akun
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Demi privasi & keamanan, seluruh kata sandi disimpan dalam bentuk <strong>kode hash satu arah</strong> (tidak dapat dilihat). Jika pengguna lupa sandi, klik <strong>Reset Sandi</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setStaffPassword('');
              setShowStaffPasswordInput(false);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors cursor-pointer active:scale-[0.99] shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Akun Staf Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, email, nomor WhatsApp, atau nomor kamar..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        <div className="flex flex-wrap items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'ALL' ? 'bg-white text-zinc-900 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'ADMIN' ? 'bg-white text-rose-700 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('PENGELOLA')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'PENGELOLA' ? 'bg-white text-blue-700 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Pengelola
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('KEUANGAN')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'KEUANGAN' ? 'bg-white text-emerald-700 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Keuangan
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('PENGHUNI')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'PENGHUNI' ? 'bg-white text-sky-700 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Penghuni
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('CALON_PENGHUNI')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'CALON_PENGHUNI' ? 'bg-white text-zinc-900 font-bold' : 'hover:text-zinc-900'
            }`}
          >
            Calon
          </button>
        </div>
      </div>

      {/* Users Table (Menampilkan Kode Hash Bcrypt & Tombol Reset Sandi — Tanpa Kata Sandi Terbuka) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
              <tr>
                <th className="p-3.5">Nama Pengguna</th>
                <th className="p-3.5">Email & Kontak</th>
                <th className="p-3.5">Kata Sandi (Hash Bcrypt)</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Kamar</th>
                <th className="p-3.5">Terdaftar Sejak</th>
                <th className="p-3.5 text-center">Status di Kos</th>
                <th className="p-3.5 text-right">Aksi Kelola / Hapus Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'ADMIN';
                const isStaff =
                  user.role === 'ADMIN' || user.role === 'PENGELOLA' || user.role === 'KEUANGAN';
                const hashPreview = user.passwordHashPreview || '$2a$10$••••••••••••';

                return (
                  <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-bold text-zinc-900">
                      {user.name}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-zinc-900 font-semibold block">{user.email}</span>
                      <span className="text-[11px] text-zinc-500">{user.phone}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg">
                        <Lock
                          className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />
                        <code
                          className="font-mono text-[11px] text-zinc-600 select-none"
                          title="Kata sandi terenkripsi satu arah dengan Bcrypt (tidak dapat dilihat dalam teks asli)"
                        >
                          {hashPreview}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            setUserToResetPassword(user);
                            setNewPasswordInput('');
                            setShowResetPasswordInput(false);
                          }}
                          className="text-[10px] font-bold text-[hsl(186,72%,24%)] hover:underline pl-2 border-l border-zinc-200 cursor-pointer inline-flex items-center gap-1"
                          title="Reset Kata Sandi Pengguna Ini"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Reset Sandi</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayLabel(user.role)}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {user.roomCode ? (
                        <span className="font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                          {user.roomCode}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isStaff
                          ? user.isActive
                            ? '✓ Akun Aktif'
                            : 'Nonaktif'
                          : user.isActive
                          ? '✓ Aktif Ngekos'
                          : 'Sudah Keluar Kos / Nonaktif'}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-right">
                      {!isAdmin ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                              user.isActive
                                ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>{isStaff ? 'Nonaktifkan Akun' : 'Keluar Kos'}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Aktifkan Akun</span>
                              </>
                            )}
                          </button>

                          {!user.isActive && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                              title="Hapus akun & data pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Data</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-medium italic">
                          Admin Utama
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reset Kata Sandi Pengguna oleh Admin (Tanpa Menampilkan Sandi Lama) */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Reset Kata Sandi Pengguna
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Kata sandi lama terenkripsi satu arah dan tidak dapat dilihat
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToResetPassword(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetUserPassword} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                <p className="font-bold text-zinc-900 text-sm">{userToResetPassword.name}</p>
                <p className="text-zinc-600">
                  Email Login:{' '}
                  <strong className="text-zinc-900 select-all">{userToResetPassword.email}</strong>
                </p>
                <p className="text-zinc-600 flex items-center gap-1.5 flex-wrap">
                  <span>Hash Saat Ini:</span>
                  <code className="font-mono text-[11px] bg-white border border-zinc-200 px-2 py-0.5 rounded text-emerald-700">
                    {userToResetPassword.passwordHashPreview || '$2a$10$••••••••••••'}
                  </code>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] leading-relaxed">
                Masukkan kata sandi baru untuk menggantikan sandi lama pengguna. Begitu disimpan, kata sandi akan langsung di-hash dengan <strong>Bcrypt</strong> dan tidak bisa dilihat lagi.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-zinc-700">
                    Kata Sandi Baru (Minimal 6 Karakter) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPasswordInput('Password123!');
                      setShowResetPasswordInput(true);
                    }}
                    className="text-[11px] font-bold text-[hsl(186,72%,24%)] hover:underline cursor-pointer"
                  >
                    Isi Sandi Standar (Password123!)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordInput ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Ketik kata sandi baru untuk pengguna..."
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordInput((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    title={showResetPasswordInput ? 'Sembunyikan input' : 'Periksa ketikan sandi baru'}
                  >
                    {showResetPasswordInput ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  disabled={isUpdatingPassword}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
                >
                  {isUpdatingPassword ? 'Mereset...' : 'Reset & Enkripsi Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Data Pengguna (Yang Sudah Keluar Kos) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5" />
                <div>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Hapus Data Pengguna (Eks Penghuni)
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Konfirmasi penghapusan akun yang sudah keluar dari kos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="p-1 rounded-lg text-rose-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-zinc-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus permanen data akun berikut karena sudah tidak menghuni Kos Omi lagi?
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <p className="font-bold text-zinc-900 text-sm">{userToDelete.name}</p>
                <p className="text-zinc-600">Email: {userToDelete.email}</p>
                <p className="text-zinc-600">No. HP: {userToDelete.phone}</p>
                {userToDelete.roomCode && (
                  <p className="text-zinc-600">
                    Riwayat Kamar: <strong>{userToDelete.roomCode}</strong>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Data Permanen'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Staf Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] flex items-center justify-center font-bold text-sm overflow-hidden p-0">
                  <img
                    src="/logo-kos-omi.png"
                    alt="Logo Kos Omi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-medium">Manajemen Akun</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Tambah Akun Staf Baru
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nama Lengkap Staf *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rahmi Hidayati"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Resmi Kos *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staf@kosomi.id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">No. WhatsApp Aktif *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0813xxxxxxxx"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-medium focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Pilih Peran Staf (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'PENGELOLA' | 'KEUANGAN')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-bold text-zinc-800 bg-white cursor-pointer focus:outline-hidden"
                >
                  <option value="PENGELOLA">
                    PENGELOLA (Operasional Kamar, Reservasi & Check-in/out)
                  </option>
                  <option value="KEUANGAN">
                    KEUANGAN (Laporan, Rekonsiliasi Pembayaran, Tagihan)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Kata Sandi Awal Akun Staf *
                </label>
                <div className="relative">
                  <input
                    type={showStaffPasswordInput ? 'text' : 'password'}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-zinc-200 font-mono font-bold text-zinc-900 focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPasswordInput((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    title={showStaffPasswordInput ? 'Sembunyikan' : 'Periksa ketikan'}
                  >
                    {showStaffPasswordInput ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Setelah disimpan, kata sandi langsung di-hash satu arah (Bcrypt) dan tidak dapat dilihat kembali.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun Staf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
