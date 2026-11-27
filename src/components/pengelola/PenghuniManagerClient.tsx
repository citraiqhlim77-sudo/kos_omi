'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { TenancyRecord } from '@/types/tenancy';
import type { RegisteredCalonAccount } from '@/actions/tenancy';
import { updateRoomCheckInDateAction } from '@/actions/rent-schedule';
import { formatRupiah } from '@/data/rooms';
import {
  Users,
  Search,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Clock,
  Mail,
  Calendar,
  Pencil,
  X,
} from 'lucide-react';

interface PenghuniManagerClientProps {
  initialTenants: TenancyRecord[];
  initialCalonAccounts?: RegisteredCalonAccount[];
  initialTab?: 'AKTIF' | 'CALON';
}

export const PenghuniManagerClient: React.FC<PenghuniManagerClientProps> = ({
  initialTenants,
  initialCalonAccounts = [],
  initialTab = 'AKTIF',
}) => {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenancyRecord[]>(initialTenants);
  const [calonAccounts, setCalonAccounts] =
    useState<RegisteredCalonAccount[]>(initialCalonAccounts);
  const [activeTab, setActiveTab] = useState<'AKTIF' | 'CALON'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [floorFilter, setFloorFilter] = useState('ALL');

  // Edit Tanggal Masuk modal state
  const [editingRoom, setEditingRoom] = useState<{ roomCode: string; userName: string } | null>(null);
  const [editDate, setEditDate] = useState('');
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openEditDateModal = (tenant: TenancyRecord) => {
    setEditingRoom({ roomCode: tenant.roomCode, userName: tenant.userName });
    setEditDate((tenant.checkInDate || '').slice(0, 10));
    setDateError(null);
  };

  const handleSaveCheckInDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editDate) return;
    setIsSavingDate(true);
    setDateError(null);
    try {
      const res = await updateRoomCheckInDateAction(editingRoom.roomCode, editDate);
      if (res.success) {
        setTenants((prev) =>
          prev.map((t) =>
            t.roomCode === editingRoom.roomCode ? { ...t, checkInDate: editDate } : t
          )
        );
        setEditingRoom(null);
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 6000);
        router.refresh();
      } else {
        setDateError(res.message);
      }
    } finally {
      setIsSavingDate(false);
    }
  };

  useEffect(() => {
    setTenants(initialTenants);
  }, [initialTenants]);

  useEffect(() => {
    setCalonAccounts(initialCalonAccounts);
  }, [initialCalonAccounts]);

  const filteredTenants = tenants.filter((t) => {
    if (t.status !== 'AKTIF') return false;
    if (statusFilter === 'LUNAS' && t.unpaidBillsCount > 0) return false;
    if (statusFilter === 'UNPAID' && t.unpaidBillsCount === 0) return false;
    if (floorFilter !== 'ALL' && t.roomFloor.toString() !== floorFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = t.userName.toLowerCase().includes(q);
      const matchRoom = t.roomCode.toLowerCase().includes(q);
      const matchPhone = t.userPhone.includes(q);
      const matchEmail = t.userEmail.toLowerCase().includes(q);
      if (!matchName && !matchRoom && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const filteredCalon = calonAccounts.filter((c) => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.roomCode && c.roomCode.toLowerCase().includes(q))
    );
  });

  const activeCount = tenants.filter((t) => t.status === 'AKTIF').length;
  const unpaidCount = tenants.filter(
    (t) => t.status === 'AKTIF' && t.unpaidBillsCount > 0
  ).length;

  const getCalonStageBadge = (acc: RegisteredCalonAccount) => {
    switch (acc.reservationStatus) {
      case 'PENDING_REVIEW':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Menunggu Verifikasi (Kamar {acc.roomCode})</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>
              {acc.paymentStatus === 'PENDING'
                ? `Menunggu Validasi Dana (Kamar ${acc.roomCode})`
                : `Menunggu Pembayaran (Kamar ${acc.roomCode})`}
            </span>
          </span>
        );
      case 'PAID':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Lunas · Siap Check-in (Kamar {acc.roomCode})</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            Reservasi Sebelumnya Ditolak
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
            Reservasi Dibatalkan · Belum Pilih Kamar
          </span>
        );
      case 'BELUM_RESERVASI':
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-blue-600" />
            <span>Akun Terdaftar · Belum Pilih Kamar</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Database Penghuni & Akun Terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Daftar Penghuni & Calon Penghuni
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Data resmi penghuni aktif di kamar serta seluruh akun calon penghuni yang telah mendaftar di portal Kos Omi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Penghuni Aktif</span>
            <span className="font-heading font-extrabold text-zinc-900 text-base">
              {activeCount} Orang
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
            <span className="text-blue-700 block">Calon Terdaftar</span>
            <span className="font-heading font-extrabold text-blue-900 text-base">
              {calonAccounts.length} Akun
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-500 block">Tertunggak</span>
            <span
              className={`font-heading font-extrabold text-base ${unpaidCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
            >
              {unpaidCount} Kamar
            </span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Penghuni Aktif vs Akun Calon Penghuni Terdaftar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab('AKTIF')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'AKTIF'
              ? 'bg-[hsl(186,72%,24%)] text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Penghuni Aktif ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CALON')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'CALON'
              ? 'bg-[hsl(186,72%,24%)] text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
            }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Akun Calon Penghuni Terdaftar ({calonAccounts.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'AKTIF'
                ? 'Cari nama penghuni, nomor kamar, email, atau nomor WhatsApp...'
                : 'Cari nama akun calon penghuni, email, atau nomor WhatsApp...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        {activeTab === 'AKTIF' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${statusFilter === 'ALL'
                    ? 'bg-white text-zinc-900 font-bold'
                    : 'hover:text-zinc-900'
                  }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('LUNAS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${statusFilter === 'LUNAS'
                    ? 'bg-white text-emerald-700 font-bold'
                    : 'hover:text-zinc-900'
                  }`}
              >
                Lunas
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('UNPAID')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${statusFilter === 'UNPAID'
                    ? 'bg-white text-amber-700 font-bold'
                    : 'hover:text-zinc-900'
                  }`}
              >
                Tertunggak
              </button>
            </div>

            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white cursor-pointer focus:outline-hidden"
            >
              <option value="ALL">Semua Lantai</option>
              <option value="1">Lantai 1 (Kamar No. 1 - 33)</option>
              <option value="2">Lantai 2 (Kamar No. 34 - 67)</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: PENGHUNI AKTIF */}
      {activeTab === 'AKTIF' ? (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {filteredTenants.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">
                Belum ada penghuni aktif yang sesuai filter
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Penghuni akan masuk ke tab ini setelah reservasi lunas dan diproses Check-in oleh Pengelola.
                {calonAccounts.length > 0 &&
                  ` Saat ini terdapat ${calonAccounts.length} akun Calon Penghuni terdaftar.`}
              </p>
              {calonAccounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('CALON')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] text-white text-xs font-bold cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lihat {calonAccounts.length} Akun Calon Penghuni Terdaftar</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredTenants.map((tenant) => {
                const hasUnpaid = tenant.unpaidBillsCount > 0;

                return (
                  <div
                    key={tenant.id}
                    className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[hsl(186,72%,24%)] font-heading font-extrabold text-base flex items-center justify-center border border-blue-100 shrink-0">
                        {tenant.roomCode}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <NextLink
                            href={`/pengelola/penghuni/${tenant.id}`}
                            className="font-heading font-extrabold text-zinc-900 text-base hover:text-blue-600 transition-colors"
                          >
                            {tenant.userName}
                          </NextLink>

                          {hasUnpaid ? (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Tertunggak ({formatRupiah(tenant.totalUnpaidAmount)})</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Tagihan Lunas</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Kamar: <strong className="text-zinc-900">{tenant.roomCode}</strong> (Lantai{' '}
                            {tenant.roomFloor})
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <span>
                              Tgl Masuk: <strong className="text-zinc-900">{tenant.checkInDate}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => openEditDateModal(tenant)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 text-[hsl(186,72%,24%)] border border-teal-200 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Ubah tanggal masuk kamar (otomatis memperbarui jadwal tagihan 3-bulanan di Keuangan)"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                              <span>Edit Tgl Masuk</span>
                            </button>
                          </span>
                          <span>•</span>
                          <span>
                            Skema: <strong>Siklus 3-Bulanan / Semester</strong>
                          </span>
                        </div>

                        <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                          <a
                            href={`https://wa.me/62${tenant.userPhone.replace(/^0/, '').replace(/^62/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{tenant.userPhone}</span>
                          </a>
                          <span>•</span>
                          <span className="text-zinc-500">{tenant.userEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-zinc-500 font-medium block">
                          Tarif Sewa Semesteran (6 Bulan)
                        </span>
                        <span className="text-base font-heading font-extrabold text-zinc-900 tabular-nums">
                          {formatRupiah(tenant.monthlyPrice)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <NextLink
                          href={`/pengelola/penghuni/${tenant.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition-colors"
                        >
                          <span>Detail Profil</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                        </NextLink>
                        <NextLink
                          href="/pengelola/checkout"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                        >
                          <span>Proses Check-out</span>
                        </NextLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: AKUN CALON PENGHUNI TERDAFTAR */
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {filteredCalon.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-sm font-bold text-zinc-700">
                Belum ada akun Calon Penghuni yang terdaftar
              </p>
              <p className="text-xs text-zinc-500">
                Setiap akun baru yang mendaftar melalui halaman Daftar Akun (/daftar) akan langsung tersimpan dan tampil di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredCalon.map((acc) => (
                <div
                  key={acc.id}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 font-heading font-extrabold text-sm flex items-center justify-center border border-amber-200 shrink-0">
                      {acc.roomCode ? `#${acc.roomCode}` : acc.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-extrabold text-zinc-900 text-base">
                          {acc.name}
                        </span>
                        {getCalonStageBadge(acc)}
                      </div>

                      <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <strong className="text-zinc-800">{acc.email}</strong>
                        </span>
                        {acc.phone && acc.phone !== '-' && (
                          <>
                            <span>•</span>
                            <a
                              href={`https://wa.me/62${acc.phone.replace(/^0/, '').replace(/^62/, '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>{acc.phone}</span>
                            </a>
                          </>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-500">
                        Terdaftar pada:{' '}
                        <strong>
                          {new Date(acc.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </strong>
                        {acc.reservationCode && (
                          <span> · Kode Reservasi: <strong>{acc.reservationCode}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                    {acc.reservationStatus === 'PAID' ? (
                      <NextLink
                        href="/pengelola/checkin"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        <span>Proses Check-in</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </NextLink>
                    ) : acc.reservationCode &&
                      (acc.reservationStatus === 'PENDING_REVIEW' ||
                        acc.reservationStatus === 'APPROVED') ? (
                      <NextLink
                        href={`/pengelola/reservasi/${acc.reservationCode}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors"
                      >
                        <span>Buka Reservasi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </NextLink>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-500 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                        Menunggu Calon Memilih Kamar
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Edit Tanggal Masuk Kamar */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/55 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[hsl(186,72%,24%)]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                    Edit Tanggal Masuk — Kamar No. {editingRoom.roomCode}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Penghuni: {editingRoom.userName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckInDate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 block">
                  Tanggal Masuk Sebenarnya (Kamar {editingRoom.roomCode})
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                />
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Mengubah tanggal masuk kamar akan <strong>otomatis menghitung ulang jadwal jatuh tempo 3-bulanan</strong> dan pengingat di halaman <strong>Keuangan → Tagihan Sewa</strong> serta <strong>Portal Penghuni</strong> untuk semua penghuni di Kamar {editingRoom.roomCode}.
                </p>
              </div>

              {dateError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {dateError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  disabled={isSavingDate}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingDate}
                  className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingDate ? 'Menyimpan...' : 'Simpan & Sinkronkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
