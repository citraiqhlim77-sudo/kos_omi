'use client';

import React, { useState } from 'react';
import { AdminUserRecord } from '@/types/admin';
import { createStaffUserAction, toggleUserStatusAction } from '@/actions/admin';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';

interface AdminPenggunaClientProps {
  initialUsers: AdminUserRecord[];
}

export const AdminPenggunaClient: React.FC<AdminPenggunaClientProps> = ({
  initialUsers,
}) => {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'PENGELOLA' | 'KEUANGAN'>('PENGELOLA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.includes(q);
      const matchRoom = (u.roomCode || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchRoom) return false;
    }
    return true;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = await createStaffUserAction({
      name,
      email,
      phone,
      role,
    });

    if (res.success && res.user) {
      setUsers((prev) => [res.user!, ...prev]);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }

    setIsSubmitting(false);
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await toggleUserStatusAction(userId);
    if (res.success && res.user) {
      setUsers((prev) =>
        prev.map((u) => (u.id === res.user!.id ? res.user! : u))
      );
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Manajemen Akses & Staf
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Kelola Pengguna & Peran Akun
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Daftar seluruh akun pengguna sistem, pembagian hak akses (Admin, Pengelola, Keuangan, Penghuni), dan penambahan staf baru.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-[0.99]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Staf Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, email, nomor WhatsApp, atau nomor kamar..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'ADMIN' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('PENGELOLA')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'PENGELOLA' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Pengelola
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('KEUANGAN')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'KEUANGAN' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Keuangan
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('PENGHUNI')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'PENGHUNI' ? 'bg-white text-sky-700 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Penghuni
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('CALON_PENGHUNI')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              roleFilter === 'CALON_PENGHUNI' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Calon
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3.5">Nama Pengguna</th>
                <th className="p-3.5">Email & Kontak</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Kamar</th>
                <th className="p-3.5">Terdaftar Sejak</th>
                <th className="p-3.5 text-center">Status Akun</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === 'ADMIN';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 whitespace-nowrap font-bold text-slate-900">
                      {user.name}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="text-slate-800 font-medium block">{user.email}</span>
                      <span className="text-[11px] text-slate-500">{user.phone}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                          user.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : user.role === 'PENGELOLA'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : user.role === 'KEUANGAN'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : user.role === 'PENGHUNI'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {user.roomCode ? (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {user.roomCode}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {user.isActive ? '✓ Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-right">
                      {!isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                            user.isActive
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">
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

        {/* Mobile Cards View (< 640px) */}
        <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === 'ADMIN';

            return (
              <div key={user.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-slate-900 text-sm">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeClass(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>No. WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kamar:</span>
                    <span className="font-bold text-slate-800">{user.roomCode ? `Kamar ${user.roomCode}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-bold ${user.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {user.isActive ? 'Akun Aktif' : 'Dinonaktifkan'}
                    </span>
                  </div>
                </div>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(user.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer min-h-[44px] flex items-center justify-center ${
                      user.isActive
                        ? 'border-rose-300 bg-white text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {user.isActive ? 'Nonaktifkan Akun Pengguna' : 'Aktifkan Akun Pengguna'}
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-400 italic">
                    Akun Administrator Utama (Terkunci)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(217,91%,45%)] flex items-center justify-center font-bold text-sm">
                  KO
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Manajemen Akun</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Tambah Akun Staf Baru
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Staf *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Resmi Kos *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staf@kosomi.id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Aktif *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Peran Staf (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'PENGELOLA' | 'KEUANGAN')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white cursor-pointer focus:outline-hidden"
                >
                  <option value="PENGELOLA">PENGELOLA (Operasional Kamar, Reservasi & Check-in/out)</option>
                  <option value="KEUANGAN">KEUANGAN (Laporan, Rekonsiliasi Midtrans, Tagihan)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                Kata sandi awal otomatis dikirimkan ke email staf yang didaftarkan.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(217,91%,45%)] hover:bg-[hsl(217,91%,38%)] shadow-sm transition-colors cursor-pointer"
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
