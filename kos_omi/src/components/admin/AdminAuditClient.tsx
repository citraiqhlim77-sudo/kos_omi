'use client';

import React, { useState } from 'react';
import { AuditLogRecord } from '@/types/admin';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Database,
  FileCode2,
  X,
  ArrowRight,
} from 'lucide-react';

interface AdminAuditClientProps {
  initialLogs: AuditLogRecord[];
}

export const AdminAuditClient: React.FC<AdminAuditClientProps> = ({ initialLogs }) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedMetaLog, setSelectedMetaLog] = useState<AuditLogRecord | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
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
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              PRD Bab 10: Audit Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Log Aktivitas & Riwayat Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Jejak digital setiap tindakan mutasi data kritis sistem oleh administrator, pengelola, dan staf keuangan.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pelaku, aksi, atau ID entitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 cursor-pointer"
          >
            <option value="ALL">Semua Aksi Mutasi</option>
            <option value="CHECKIN_COMPLETED">CHECKIN_COMPLETED</option>
            <option value="PAYMENT_RECONCILED">PAYMENT_RECONCILED</option>
            <option value="RESERVATION_APPROVED">RESERVATION_APPROVED</option>
            <option value="ROOM_PRICE_UPDATED">ROOM_PRICE_UPDATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
            <option value="STAFF_USER_CREATED">STAFF_USER_CREATED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Waktu & Tanggal</th>
                <th className="px-5 py-3.5">Aktor (Pengguna)</th>
                <th className="px-5 py-3.5">Aksi Sistem</th>
                <th className="px-5 py-3.5">Entitas Terkait</th>
                <th className="px-5 py-3.5 text-right">Rincian Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada catatan log aktivitas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {new Date(log.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                          {log.actorName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{log.actorName}</div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getRoleBadge(
                              log.actorRole
                            )}`}
                          >
                            {log.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-slate-900 font-semibold">{log.entity}</div>
                      <div className="font-mono text-[11px] text-slate-500">ID: {log.entityId}</div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedMetaLog(log)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lihat JSON</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (< 640px) */}
        <div className="sm:hidden divide-y divide-slate-100 p-3 space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-sm">
                    {log.actorName}
                  </h3>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getRoleBadge(
                      log.actorRole
                    )}`}
                  >
                    {log.actorRole}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div>
                    {new Date(log.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
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

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Aksi:</span>
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {log.action}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entitas:</span>
                  <span className="font-semibold text-slate-800">{log.entity} (#{log.entityId})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMetaLog(log)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <FileCode2 className="w-4 h-4 text-blue-600" />
                <span>Lihat JSON Payload Metadata</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Modal Inspector */}
      {selectedMetaLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Metadata Audit #{selectedMetaLog.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMetaLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">Aksi</div>
                  <div className="font-bold text-slate-900 font-mono text-[11px]">
                    {selectedMetaLog.action}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-400 font-semibold text-[10px]">Pelaku</div>
                  <div className="font-bold text-slate-900">
                    {selectedMetaLog.actorName} ({selectedMetaLog.actorRole})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">
                  Payload Metadata Perubahan (JSON)
                </label>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedMetaLog.meta, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMetaLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
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
