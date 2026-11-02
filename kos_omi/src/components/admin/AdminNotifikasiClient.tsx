'use client';

import React, { useState } from 'react';
import { NotificationLogRecord } from '@/types/admin';
import { resendNotificationAction } from '@/actions/admin';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';

interface AdminNotifikasiClientProps {
  initialLogs: NotificationLogRecord[];
}

export const AdminNotifikasiClient: React.FC<AdminNotifikasiClientProps> = ({
  initialLogs,
}) => {
  const [logs, setLogs] = useState<NotificationLogRecord[]>(initialLogs);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesChannel = channelFilter === 'ALL' || log.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      log.recipient.toLowerCase().includes(q) ||
      log.recipientName.toLowerCase().includes(q) ||
      log.template.toLowerCase().includes(q);
    return matchesChannel && matchesStatus && matchesSearch;
  });

  const handleResend = async (id: string) => {
    setRetryingId(id);
    const res = await resendNotificationAction(id);
    if (res.success && res.log) {
      setLogs((prev) => prev.map((l) => (l.id === id ? res.log! : l)));
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    }
    setRetryingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Monitoring Notifikasi WhatsApp & Email
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Pantau status pengiriman pesan tagihan, konfirmasi reservasi, dan kuitansi pembayaran via WhatsApp (Fonnte) dan Email (Resend).
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama penerima, nomor HP, email, atau jenis pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 focus:border-[hsl(217,91%,45%)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 cursor-pointer"
          >
            <option value="ALL">Semua Saluran</option>
            <option value="WHATSAPP">WhatsApp (Fonnte)</option>
            <option value="EMAIL">Email (Resend)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-[hsl(217,91%,45%)]/20 cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="SENT">Terkirim (SENT)</option>
            <option value="FAILED">Gagal (FAILED)</option>
            <option value="PENDING">Menunggu (PENDING)</option>
          </select>
        </div>
      </div>

      {/* Notification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Desktop Table View (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Penerima & Kontak</th>
                <th className="px-5 py-3.5">Saluran</th>
                <th className="px-5 py-3.5">Template Pesan</th>
                <th className="px-5 py-3.5">Status Pengiriman</th>
                <th className="px-5 py-3.5">Waktu Kirim</th>
                <th className="px-5 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada catatan log notifikasi yang cocok dengan filter aktif.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{log.recipientName}</div>
                      <div className="text-slate-500 text-[11px] tabular-nums">{log.recipient}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {log.channel === 'WHATSAPP' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-200 font-semibold">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sky-800 bg-sky-50 border border-sky-200 font-semibold">
                          <Mail className="w-3.5 h-3.5 text-sky-600" />
                          <span>Email</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-slate-800 font-bold text-[11px]">
                        {log.template}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">Percobaan ke-{log.attempts}</div>
                    </td>

                    <td className="px-5 py-4">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terkirim</span>
                        </span>
                      ) : log.status === 'FAILED' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Gagal Terkirim</span>
                          </span>
                          {log.errorMessage && (
                            <p className="text-[10px] text-rose-600 max-w-xs leading-tight">
                              {log.errorMessage}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Menunggu</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-slate-600 text-[11px] tabular-nums">
                      {log.sentAt ? (
                        <div>
                          <div>
                            {new Date(log.sentAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-slate-400">
                            {new Date(log.sentAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {log.status === 'FAILED' ? (
                        <button
                          type="button"
                          onClick={() => handleResend(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`}
                          />
                          <span>{retryingId === log.id ? 'Mengirim...' : 'Kirim Ulang'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleResend(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Lagi</span>
                        </button>
                      )}
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
                    {log.recipientName}
                  </h3>
                  <p className="text-[11px] text-slate-500 tabular-nums">{log.recipient}</p>
                </div>
                {log.channel === 'WHATSAPP' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200">
                    <Mail className="w-3 h-3 text-sky-600" />
                    <span>Email</span>
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Template:</span>
                  <span className="font-bold text-slate-800">{log.template}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  {log.status === 'SENT' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terkirim</span>
                    </span>
                  ) : log.status === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                      <AlertCircle className="w-3 h-3" />
                      <span>Gagal Terkirim</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                      <Clock className="w-3 h-3" />
                      <span>Menunggu</span>
                    </span>
                  )}
                </div>
                {log.errorMessage && (
                  <p className="text-[10px] text-rose-600 pt-1 border-t border-slate-100">
                    {log.errorMessage}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleResend(log.id)}
                disabled={retryingId === log.id}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2 ${
                  log.status === 'FAILED'
                    ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {retryingId === log.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Notifikasi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{log.status === 'FAILED' ? 'Kirim Ulang Pesan' : 'Kirim Lagi'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
