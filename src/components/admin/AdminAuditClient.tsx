'use client';

import React, { useState } from 'react';
import { AuditLogRecord } from '@/types/admin';
import { formatRupiah } from '@/data/rooms';
import {
  Search,
  Filter,
  Clock,
  Eye,
  X,
  CheckCircle2,
  FileText,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';

interface AdminAuditClientProps {
  initialLogs: AuditLogRecord[];
}

const ACTION_LABELS: Record<string, { label: string; badgeClass: string }> = {
  CHECKIN_PROCESSED: {
    label: 'Proses Check-in Penghuni',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  CHECKIN_COMPLETED: {
    label: 'Proses Check-in Penghuni',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  PAYMENT_RECONCILED: {
    label: 'Rekonsiliasi Pembayaran',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  RESERVATION_APPROVED: {
    label: 'Persetujuan Reservasi',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  ROOM_PRICE_UPDATED: {
    label: 'Perubahan Tarif Kamar',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  SETTINGS_UPDATED: {
    label: 'Pembaruan Pengaturan Kos',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  STAFF_USER_CREATED: {
    label: 'Penambahan Akun Staf',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  USER_STATUS_TOGGLED: {
    label: 'Perubahan Status Akun',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const ENTITY_LABELS: Record<string, string> = {
  tenancies: 'Data Hunian Kamar',
  payments: 'Transaksi Pembayaran',
  reservations: 'Reservasi Kamar',
  rooms: 'Master Kamar',
  settings: 'Pengaturan Sistem',
  users: 'Akun Pengguna',
};

const META_KEY_LABELS: Record<string, string> = {
  roomCode: 'Nomor Kamar',
  tenant: 'Nama Penghuni',
  applicant: 'Calon Penghuni',
  amount: 'Nominal Pembayaran',
  oldPrice: 'Tarif Sewa Lama',
  newPrice: 'Tarif Sewa Baru',
  status: 'Status Pembayaran',
  depositPercentage: 'Persentase Deposit',
  dueDay: 'Tanggal Jatuh Tempo',
  bookingWindowHours: 'Batas Waktu Pembayaran',
  kosName: 'Nama Properti Kos',
  kosAddress: 'Alamat Properti',
  adminPhone: 'Nomor WhatsApp Admin',
  timezone: 'Zona Waktu',
  lateFeeEnabled: 'Status Denda Terlambat',
  lateFeeDailyAmount: 'Nominal Denda per Hari',
  email: 'Alamat Email Staf',
  role: 'Peran yang Diberikan',
  targetEmail: 'Email Akun Terkait',
  newStatus: 'Status Akun Baru',
};

function formatMetaValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '-';

  if (
    (key === 'amount' || key === 'oldPrice' || key === 'newPrice' || key === 'lateFeeDailyAmount') &&
    typeof value === 'number'
  ) {
    return formatRupiah(value);
  }

  if (key === 'depositPercentage' && typeof value === 'number') {
    return `${value}% dari harga sewa bulanan`;
  }

  if (key === 'dueDay' && typeof value === 'number') {
    return `Tanggal ${value} setiap bulan`;
  }

  if (key === 'bookingWindowHours' && typeof value === 'number') {
    return `${value} Jam`;
  }

  if (key === 'lateFeeEnabled' && typeof value === 'boolean') {
    return value ? 'Aktif' : 'Tidak Aktif';
  }

  if (key === 'status' && typeof value === 'string') {
    if (value.toLowerCase() === 'settlement') return 'Lunas (Settlement)';
    return value;
  }

  if (key === 'roomCode' && typeof value === 'string') {
    return `Kamar ${value}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'Ya' : 'Tidak';
  }

  return String(value);
}

function getActionInfo(action: string) {
  return (
    ACTION_LABELS[action] || {
      label: action.replace(/_/g, ' '),
      badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    }
  );
}

function getEntityLabel(entity: string) {
  return ENTITY_LABELS[entity] || entity;
}

export const AdminAuditClient: React.FC<AdminAuditClientProps> = ({ initialLogs }) => {
  const [logs] = useState<AuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedMetaLog, setSelectedMetaLog] = useState<AuditLogRecord | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesAction =
      actionFilter === 'ALL' ||
      log.action === actionFilter ||
      (actionFilter === 'CHECKIN_PROCESSED' && log.action === 'CHECKIN_COMPLETED');
    const q = search.toLowerCase().trim();
    const actionLabel = getActionInfo(log.action).label.toLowerCase();
    const entityLabel = getEntityLabel(log.entity).toLowerCase();
    const matchesSearch =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      actionLabel.includes(q) ||
      entityLabel.includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q);
    return matchesAction && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PENGELOLA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'KEUANGAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'PENGELOLA':
        return 'Pengelola Kos';
      case 'KEUANGAN':
        return 'Staf Keuangan';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              Riwayat Aktivitas Sistem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Log Aktivitas & Riwayat Audit
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Catatan lengkap setiap perubahan data kamar, reservasi, check-in, dan pembayaran oleh administrator, pengelola, serta staf keuangan.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama petugas, jenis aktivitas, atau nomor kamar/invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 hidden sm:block" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 cursor-pointer"
          >
            <option value="ALL">Semua Aktivitas</option>
            <option value="CHECKIN_PROCESSED">Proses Check-in Penghuni</option>
            <option value="PAYMENT_RECONCILED">Rekonsiliasi Pembayaran</option>
            <option value="RESERVATION_APPROVED">Persetujuan Reservasi</option>
            <option value="ROOM_PRICE_UPDATED">Perubahan Tarif Kamar</option>
            <option value="SETTINGS_UPDATED">Pembaruan Pengaturan Kos</option>
            <option value="STAFF_USER_CREATED">Penambahan Akun Staf</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {/* Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
              <tr>
                <th className="px-5 py-3.5">Waktu & Tanggal</th>
                <th className="px-5 py-3.5">Petugas Pelaksana</th>
                <th className="px-5 py-3.5">Jenis Aktivitas</th>
                <th className="px-5 py-3.5">Data Terkait</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                    Tidak ada catatan log aktivitas yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionInfo = getActionInfo(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="font-semibold text-zinc-800">
                            {new Date(log.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 shrink-0">
                            {log.actorName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900">{log.actorName}</div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getRoleBadge(
                                log.actorRole
                              )}`}
                            >
                              {getRoleLabel(log.actorRole)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center font-bold text-[11px] px-2.5 py-1 rounded-md border ${actionInfo.badgeClass}`}
                        >
                          {actionInfo.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-zinc-900 font-bold">{getEntityLabel(log.entity)}</div>
                        <div className="text-[11px] text-zinc-500">
                          Kode / ID: <span className="font-semibold text-zinc-700">{log.entityId}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedMetaLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-zinc-700 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lihat Rincian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< 640px) */}
        <div className="sm:hidden divide-y divide-zinc-100 p-3 space-y-3">
          {filteredLogs.map((log) => {
            const actionInfo = getActionInfo(log.action);
            return (
              <div key={log.id} className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-zinc-900 text-sm">
                      {log.actorName}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getRoleBadge(
                        log.actorRole
                      )}`}
                    >
                      {getRoleLabel(log.actorRole)}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-zinc-400">
                    <div>
                      {new Date(log.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div>
                      {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-zinc-200/60 text-xs space-y-1.5 text-zinc-600">
                  <div className="flex justify-between items-center">
                    <span>Aktivitas:</span>
                    <span
                      className={`font-bold text-[11px] px-2 py-0.5 rounded border ${actionInfo.badgeClass}`}
                    >
                      {actionInfo.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Terkait:</span>
                    <span className="font-semibold text-zinc-800">
                      {getEntityLabel(log.entity)} ({log.entityId})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMetaLog(log)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Lihat Rincian Perubahan</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Aktivitas Modal (Tampilan Biasa / Rapi & Mudah Dibaca) */}
      {selectedMetaLog && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-zinc-900 text-sm">
                    Rincian Aktivitas Audit
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    ID Catatan: <span className="font-semibold text-zinc-700">#{selectedMetaLog.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMetaLog(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Info Ringkas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jenis Aktivitas</span>
                  </div>
                  <div className="font-bold text-zinc-900 text-xs">
                    {getActionInfo(selectedMetaLog.action).label}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1">
                  <div className="text-zinc-500 font-medium text-[11px] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Petugas Pelaksana</span>
                  </div>
                  <div className="font-bold text-zinc-900 text-xs">
                    {selectedMetaLog.actorName}{' '}
                    <span className="text-zinc-500 font-medium">
                      ({getRoleLabel(selectedMetaLog.actorRole)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Waktu & Data Terkait */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Waktu Tercatat:</span>
                  <span className="font-bold text-zinc-900">
                    {new Date(selectedMetaLog.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    pukul{' '}
                    {new Date(selectedMetaLog.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Target: <span className="font-bold text-zinc-800">{selectedMetaLog.entityId}</span>
                </div>
              </div>

              {/* Rincian Data Perubahan (Tabel / List Biasa, Bukan JSON) */}
              <div className="space-y-2">
                <label className="block text-zinc-800 font-bold text-xs">
                  Detail Informasi Perubahan
                </label>

                <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden bg-white">
                  {Object.entries(selectedMetaLog.meta || {}).length === 0 ? (
                    <div className="p-4 text-xs text-zinc-400 text-center">
                      Tidak ada detail tambahan pada aktivitas ini.
                    </div>
                  ) : (
                    Object.entries(selectedMetaLog.meta).map(([key, val]) => (
                      <div
                        key={key}
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs hover:bg-zinc-50/60"
                      >
                        <span className="text-zinc-500 font-medium">
                          {META_KEY_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </span>
                        <span className="font-bold text-zinc-900 sm:text-right break-words max-w-xs">
                          {formatMetaValue(key, val)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tercatat permanen di sistem audit Kos Omi</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedMetaLog(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

