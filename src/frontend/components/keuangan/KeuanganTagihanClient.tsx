'use client';

import React,{ useState } from 'react';
import {
type RoomRentScheduleItem,
type RoomScheduleStatus,
sendRoomRentReminderAction,
sendBulkRentRemindersAction,
updateRoomCheckInDateAction,
} from '@/actions/rent-schedule';
import {
Search,
Send,
CheckCircle2,
AlertTriangle,
Calendar,
Clock,
MessageCircle,
Pencil,
X,
BellRing,
ShieldAlert,
} from 'lucide-react';

interface KeuanganTagihanClientProps {
  initialSchedules: RoomRentScheduleItem[];
}

export const KeuanganTagihanClient: React.FC<KeuanganTagihanClientProps> = ({
  initialSchedules,
}) => {
  const [schedules, setSchedules] = useState<RoomRentScheduleItem[]>(initialSchedules);
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomScheduleStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingRoom, setSendingRoom] = useState<string | null>(null);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBulkReminder = async () => {
    setIsSendingBulk(true);
    const res = await sendBulkRentRemindersAction('ALL');
    setIsSendingBulk(false);
    setToast({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) {
      setSchedules((prev) =>
        prev.map((item) => ({
          ...item,
          reminderCount: item.reminderCount + 1,
          lastReminderAt: new Date().toISOString(),
        }))
      );
    }
    setTimeout(() => setToast(null), 6000);
  };

  // Modal Edit Tanggal Masuk Kamar
  const [editingRoom, setEditingRoom] = useState<RoomRentScheduleItem | null>(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [isSavingDate, setIsSavingDate] = useState(false);

  const countEscalated = schedules.filter((s) => s.status === 'WAJIB_KONFIRMASI_IBU_KOS').length;
  const countAttention = schedules.filter(
    (s) => s.status === 'TERLAMBAT' || s.status === 'MINTA_TEMPO' || s.status === 'SEGERA_JATUH_TEMPO'
  ).length;
  const countSafe = schedules.filter((s) => s.status === 'AMAN').length;

  const filtered = schedules.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoom = s.roomCode.toLowerCase().includes(q) || `kamar ${s.roomCode}`.includes(q);
      const matchName = s.occupants.some((o) => o.name.toLowerCase().includes(q));
      if (!matchRoom && !matchName) return false;
    }
    return true;
  });

  const handleSendReminder = async (roomCode: string) => {
    setSendingRoom(roomCode);
    const res = await sendRoomRentReminderAction(roomCode);
    setSendingRoom(null);

    if (res.success) {
      if (res.schedule) {
        setSchedules((prev) =>
          prev.map((item) => (item.roomCode === roomCode ? res.schedule! : item))
        );
      }
      setToast({ type: 'success', message: res.message });
      if (res.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      setToast({ type: 'error', message: res.message });
    }
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveCheckInDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editDateValue) return;
    setIsSavingDate(true);
    const res = await updateRoomCheckInDateAction(editingRoom.roomCode, editDateValue);
    setIsSavingDate(false);

    if (res.success && res.schedule) {
      setSchedules((prev) =>
        prev.map((item) => (item.roomCode === editingRoom.roomCode ? res.schedule! : item))
      );
      setToast({ type: 'success', message: res.message });
      setEditingRoom(null);
    } else {
      setToast({ type: 'error', message: res.message });
    }
    setTimeout(() => setToast(null), 5000);
  };

  const renderStatusBadge = (item: RoomRentScheduleItem) => {
    switch (item.status) {
      case 'WAJIB_KONFIRMASI_IBU_KOS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Wajib Konfirmasi Ibu Kos</span>
          </span>
        );
      case 'TERLAMBAT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Terlambat {item.daysOverdue} Hari</span>
          </span>
        );
      case 'MINTA_TEMPO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>
              Tempo +{item.extension?.extraDays} Hari · {item.effectiveDueDate}
            </span>
          </span>
        );
      case 'SEGERA_JATUH_TEMPO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <BellRing className="w-3.5 h-3.5 shrink-0" />
            <span>
              {item.daysUntilDue === 0
                ? 'Jatuh Tempo Hari Ini'
                : `Jatuh Tempo ${item.daysUntilDue} Hari Lagi`}
            </span>
          </span>
        );
      case 'AMAN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Aktif · {item.daysUntilDue} Hari Lagi</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Siklus 3 Bulanan
            </span>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Maksimal Tempo 7 Hari
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Tagihan Sewa &amp; Pengingat Per Kamar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl">
            Jatuh tempo dihitung otomatis setiap 3 bulan sesuai tanggal masuk kamar. Lewat 7 hari wajib konfirmasi langsung ke Ibu Kos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleBulkReminder}
          disabled={isSendingBulk}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <BellRing className="w-4 h-4" />
          <span>{isSendingBulk ? 'Mengirim ke Semua Kamar...' : 'Kirim Pengingat Semua (1x Klik)'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Wajib Konfirmasi Ibu Kos</span>
          <div className="text-2xl font-heading font-extrabold text-rose-700 tabular-nums">
            {countEscalated} Kamar
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">
            Lewat batas 7 hari
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Perlu Pengingat</span>
          <div className="text-2xl font-heading font-extrabold text-amber-700 tabular-nums">
            {countAttention} Kamar
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">
            Mendekati jatuh tempo atau minta tempo
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Status Aman</span>
          <div className="text-2xl font-heading font-extrabold text-emerald-700 tabular-nums">
            {countSafe} / {schedules.length} Kamar
          </div>
          <span className="text-[11px] text-zinc-500">Tersinkron dengan data Pengelola</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor kamar (misal: 04, 12) atau nama penghuni..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        <div className="flex flex-wrap items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
          {(
            [
              ['ALL', 'Semua'],
              ['WAJIB_KONFIRMASI_IBU_KOS', 'Konfirmasi Ibu Kos'],
              ['MINTA_TEMPO', 'Minta Tempo'],
              ['TERLAMBAT', 'Terlambat'],
              ['SEGERA_JATUH_TEMPO', 'H-7 Tempo'],
              ['AMAN', 'Aman'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === val
                  ? 'bg-white text-zinc-900 font-bold'
                  : 'hover:text-zinc-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Schedule Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
              <tr>
                <th className="p-3.5">Kamar &amp; Penghuni</th>
                <th className="p-3.5">Tanggal Masuk</th>
                <th className="p-3.5">Jatuh Tempo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Pengingat</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filtered.map((item) => {
                const isSending = sendingRoom === item.roomCode;
                const isEscalated = item.status === 'WAJIB_KONFIRMASI_IBU_KOS';

                return (
                  <tr key={item.roomCode} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-blue-50 text-[hsl(186,72%,24%)] font-extrabold flex items-center justify-center border border-blue-100 shrink-0">
                          {item.roomCode}
                        </span>
                        <div>
                          <p className="font-bold text-zinc-900">
                            {item.occupants.map((o) => o.name).join(' & ')}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Lantai {item.roomFloor} · {item.occupants.length} Penghuni
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-800 tabular-nums">
                          {item.checkInDate}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRoom(item);
                            setEditDateValue(item.checkInDate);
                          }}
                          className="text-[10px] font-bold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          title="Edit Tanggal Masuk Kamar"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-zinc-900 tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.nextDueDate}</span>
                      </div>
                      {item.extension && (
                        <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">
                          Janji bayar: {item.effectiveDueDate}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        {renderStatusBadge(item)}
                        {item.extension?.reason && (
                          <p className="text-[11px] text-zinc-500 max-w-xs truncate" title={item.extension.reason}>
                            Alasan ({item.extension.requestedBy}): &ldquo;{item.extension.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-center">
                      {item.reminderCount > 0 ? (
                        <div>
                          <span className="text-emerald-700 font-bold block">
                            {item.reminderCount}x Terkirim
                          </span>
                          {item.lastReminderAt && (
                            <span className="text-[10px] text-zinc-400">
                              {new Date(item.lastReminderAt).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400">Belum Dikirim</span>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(item.roomCode)}
                        disabled={isSending}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white transition-colors cursor-pointer disabled:opacity-50 ${
                          isEscalated
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {isEscalated ? (
                          <Send className="w-3.5 h-3.5" />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isSending
                            ? 'Mengirim...'
                            : isEscalated
                            ? 'Kirim Peringatan Final'
                            : 'Kirim Pengingat WA'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Tanggal Masuk Kamar */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-200">
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-base">
                  Atur Tanggal Masuk Kamar No. {editingRoom.roomCode}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Penghuni: {editingRoom.occupants.map((o) => o.name).join(' & ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckInDate} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 leading-relaxed">
                Sistem otomatis menghitung jatuh tempo <strong>setiap 3 bulan sekali</strong> pada tanggal yang sama dari Tanggal Masuk kamar ini dan menyinkronkannya ke Pengelola & Portal Penghuni.
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Tanggal Masuk Asli Kamar No. {editingRoom.roomCode} *
                </label>
                <input
                  type="date"
                  value={editDateValue}
                  onChange={(e) => setEditDateValue(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 font-bold text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 font-bold text-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingDate}
                  className="px-5 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingDate ? 'Menyimpan...' : 'Simpan & Hitung Jatuh Tempo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
