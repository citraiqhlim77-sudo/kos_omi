'use client';

import React, { useState } from 'react';
import { OverdueBill } from '@/types/finance';
import { sendPaymentReminderAction } from '@/actions/finance';
import { formatRupiah } from '@/data/rooms';
import {
  AlertCircle,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  Receipt,
  Building2,
  Calendar,
  AlertTriangle,
  BellRing,
} from 'lucide-react';

interface KeuanganTagihanClientProps {
  initialOverdueBills: OverdueBill[];
}

export const KeuanganTagihanClient: React.FC<KeuanganTagihanClientProps> = ({
  initialOverdueBills,
}) => {
  const [bills, setBills] = useState<OverdueBill[]>(initialOverdueBills);
  const [loadingBillId, setLoadingBillId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingAll, setIsSendingAll] = useState(false);

  const totalOverdueAmount = bills.reduce((sum, b) => sum + b.amount, 0);

  const handleSendReminder = async (billId: string) => {
    setLoadingBillId(billId);
    const res = await sendPaymentReminderAction(billId);

    if (res.success && res.bill) {
      setBills((prev) =>
        prev.map((b) => (b.id === res.bill!.id ? res.bill! : b))
      );
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);
    }
    setLoadingBillId(null);
  };

  const handleSendAllReminders = async () => {
    setIsSendingAll(true);
    for (const b of bills) {
      await sendPaymentReminderAction(b.id);
    }
    setBills((prev) =>
      prev.map((b) => ({
        ...b,
        reminderCount: b.reminderCount + 1,
        lastReminderSentAt: new Date().toISOString(),
      }))
    );
    setIsSendingAll(false);
    setToastMessage(`Pengingat tagihan berhasil dikirimkan ke seluruh ${bills.length} penghuni terlambat!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              Pengawasan Piutang Sewa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Monitoring Tagihan Terlambat
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Daftar tagihan sewa bulanan yang melewati batas jatuh tempo (tanggal 5). Kirimkan pengingat WhatsApp secara instan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSendAllReminders}
            disabled={isSendingAll || bills.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <BellRing className="w-4 h-4" />
            <span>{isSendingAll ? 'Mengirim Massal...' : 'Kirim Pengingat ke Semua'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overdue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-rose-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Total Nominal Tertunggak</span>
          <div className="text-2xl font-heading font-extrabold text-rose-700 tabular-nums">
            {formatRupiah(totalOverdueAmount)}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Memerlukan penagihan aktif</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Jumlah Kamar Terlambat</span>
          <div className="text-2xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {bills.length} Kamar
          </div>
          <span className="text-[11px] text-zinc-500">Jatuh tempo setiap tanggal 5</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 text-xs space-y-1">
          <span className="text-zinc-500 font-medium">Saluran Pengingat Otomatis</span>
          <div className="text-base font-bold text-zinc-800">
            WhatsApp & Email Terintegrasi
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Tautan pembayaran Snap disertakan</span>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-700">
            Daftar Tagihan Belum Lunas Melewati Jatuh Tempo
          </h2>
          <span className="text-xs text-zinc-500">Pemberitahuan resmi Kos Omi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
              <tr>
                <th className="p-3.5">No. Invoice</th>
                <th className="p-3.5">Penghuni & Kamar</th>
                <th className="p-3.5">Kontak WhatsApp</th>
                <th className="p-3.5">Jatuh Tempo</th>
                <th className="p-3.5">Durasi Terlambat</th>
                <th className="p-3.5 text-right">Nominal Tagihan</th>
                <th className="p-3.5 text-center">Status Pengingat</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {bills.map((bill) => {
                const isLoading = loadingBillId === bill.id;

                return (
                  <tr key={bill.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="p-3.5 whitespace-nowrap tabular-nums font-bold text-zinc-900">
                      {bill.invoiceNumber}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <strong className="text-zinc-900 block">{bill.tenantName}</strong>
                      <span className="text-[11px] text-zinc-500">Kamar {bill.roomCode}</span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <a
                        href={`https://wa.me/62${bill.tenantPhone.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{bill.tenantPhone}</span>
                      </a>
                    </td>

                    <td className="p-3.5 whitespace-nowrap font-medium text-zinc-800">
                      {bill.dueDate}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {bill.daysOverdue} Hari Lewat
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-right font-heading font-bold text-rose-700 tabular-nums text-sm">
                      {formatRupiah(bill.amount)}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-center">
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {bill.reminderCount > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            {bill.reminderCount}x Terkirim
                          </span>
                        ) : (
                          <span className="text-zinc-400">Belum Dikirim</span>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(bill.id)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isLoading ? 'Mengirim...' : 'Kirim Pengingat'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
