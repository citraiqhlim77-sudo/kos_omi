'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { MonthlyBill, TenantProfile } from '@/types/billing';
import { Room, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';
import { payMonthlyBillAction } from '@/actions/billing';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  Calendar,
  BedDouble,
  Receipt,
  History,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Zap,
  Wifi,
  Phone,
  X,
  QrCode,
  Building2,
} from 'lucide-react';

interface PenghuniDashboardClientProps {
  currentBill: MonthlyBill | null;
  recentBills: MonthlyBill[];
  profile: TenantProfile;
  room: Room | null;
}

export const PenghuniDashboardClient: React.FC<PenghuniDashboardClientProps> = ({
  currentBill: initialCurrentBill,
  recentBills: initialRecentBills,
  profile,
  room,
}) => {
  const [currentBill, setCurrentBill] = useState<MonthlyBill | null>(initialCurrentBill);
  const [recentBills, setRecentBills] = useState<MonthlyBill[]>(initialRecentBills);

  // Quick Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'GOPAY'>('QRIS');
  const [isPaying, setIsPaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isBillUnpaid = currentBill && currentBill.status !== 'LUNAS';

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBill) return;

    setIsPaying(true);
    const res = await payMonthlyBillAction(currentBill.invoiceCode, selectedMethod);

    if (res.success && res.bill) {
      setCurrentBill(res.bill);
      setRecentBills((prev) => [res.bill!, ...prev.filter((b) => b.id !== res.bill!.id)]);
      setIsPayModalOpen(false);
      setToastMessage(`Tagihan sewa ${res.bill.periodMonth} berhasil dibayar lunas via ${selectedMethod}!`);
      setTimeout(() => setToastMessage(null), 5000);
    }
    setIsPaying(false);
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

      {/* Greeting Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Penghuni Aktif
            </span>
            <span className="text-xs text-zinc-500 font-medium">Kos Omi Sungai Bangek, Padang</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Halo, {profile.name}!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Kamar <strong className="text-zinc-900">{profile.roomCode}</strong> · Masa sewa aktif hingga {profile.tenancyEnd}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NextLink
            href="/penghuni/tagihan"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-zinc-500" />
            <span>Semua Tagihan</span>
          </NextLink>

          <NextLink
            href="/penghuni/kamar"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors"
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>Info Kamar Saya</span>
          </NextLink>
        </div>
      </div>

      {/* PRIORITY 1: KARTU TAGIHAN BULAN BERJALAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Bill Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-zinc-900">Tagihan Sewa Bulan Berjalan</h2>
              </div>
              {currentBill && (
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    currentBill.status === 'LUNAS'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentBill.status === 'LUNAS' ? '✓ Sudah Lunas' : '⏳ Belum Dibayar'}
                </span>
              )}
            </div>

            {currentBill ? (
              <div className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-medium block">
                      Periode Tagihan & Kamar
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-900">
                      {currentBill.periodMonth} · Kamar {currentBill.roomCode}
                    </h3>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Jatuh Tempo: <strong>{currentBill.dueDate}</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-zinc-500 font-medium block">
                      Nominal yang Harus Dibayar
                    </span>
                    <span className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                      {formatRupiah(currentBill.totalAmount)}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">Bebas biaya admin</span>
                  </div>
                </div>

                {isBillUnpaid ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Pembayaran otomatis terkonfirmasi langsung melalui Midtrans Snap</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPayModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Bayar Tagihan Sekarang</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tagihan bulan ini telah lunas dibayar pada {currentBill.paidAt ? new Date(currentBill.paidAt).toLocaleDateString('id-ID') : 'periode berjalan'}.</span>
                    </div>

                    <NextLink
                      href={`/penghuni/tagihan/${currentBill.invoiceCode}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[hsl(186,72%,24%)] hover:underline"
                    >
                      <span>Lihat Bukti Kuitansi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </NextLink>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-500">
                Tidak ada tagihan aktif untuk bulan berjalan.
              </div>
            )}
          </div>

          {/* THREE RECENT PAYMENT TRANSACTIONS */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Tiga Riwayat Pembayaran Terakhir</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Bukti pembayaran resmi tersimpan aman di server Kos Omi
                </p>
              </div>

              <NextLink
                href="/penghuni/riwayat"
                className="text-xs font-bold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Riwayat Lengkap</span>
                <ArrowRight className="w-3 h-3" />
              </NextLink>
            </div>

            <div className="space-y-3">
              {recentBills.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 text-xs">{item.periodMonth}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'LUNAS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status === 'LUNAS' ? 'LUNAS' : item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span className="tabular-nums">{item.invoiceCode}</span>
                      <span>•</span>
                      <span>
                        {item.paidAt
                          ? `Dibayar: ${new Date(item.paidAt).toLocaleDateString('id-ID')}`
                          : `Jatuh tempo: ${item.dueDate}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    <span className="font-bold text-zinc-900 text-sm tabular-nums">
                      {formatRupiah(item.totalAmount)}
                    </span>
                    <NextLink
                      href={`/penghuni/tagihan/${item.invoiceCode}`}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors"
                    >
                      Kuitansi
                    </NextLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Room Summary & Fast Shortcuts */}
        <div className="space-y-6 lg:col-span-1">
          {/* Room Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-4">
            <h3 className="text-xs font-bold text-zinc-700 border-b border-zinc-100 pb-2.5">
              Kamar yang Ditempati
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[hsl(186,72%,24%)] font-extrabold text-base flex items-center justify-center border border-blue-100 shrink-0">
                {profile.roomCode}
              </div>
              <div>
                <h4 className="font-extrabold text-zinc-900 text-base">
                  Kamar {profile.roomCode}
                </h4>
                <p className="text-xs text-zinc-500">
                  Lantai 1 · {room ? ROOM_TYPE_LABELS[room.type] : 'Standar AC'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 border-t border-zinc-100 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal Check-in:</span>
                <span className="font-semibold text-zinc-800">{profile.checkInDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Jatuh Tempo Sewa:</span>
                <span className="font-semibold text-zinc-800">Tgl 5 Setiap Bulan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Token Listrik Mandiri:</span>
                <span className="tabular-nums font-bold text-zinc-800">1423-8890-4101</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Wi-Fi Kos Omi:</span>
                <span className="font-bold text-zinc-800">KOS_OMI_LT1 (100 Mbps)</span>
              </div>
            </div>

            <NextLink
              href="/penghuni/kamar"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 font-bold text-xs text-zinc-700 transition-colors"
            >
              <BedDouble className="w-3.5 h-3.5 text-zinc-500" />
              <span>Detail Fasilitas & Tata Tertib</span>
            </NextLink>
          </div>

          {/* Quick Help Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Bantuan & Pengelola Kos</span>
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11px]">
              Ada kendala fasilitas kamar atau pertanyaan pembayaran? Hubungi kantor pengelola Kos Omi Sungai Bangek.
            </p>
            <a
              href="https://wa.me/6281374329562?text=Halo%20Pengelola%20Kos%20Omi,%20saya%20Rina%20Kusuma%20Kamar%20No.%201."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors"
            >
              <span>WhatsApp Pengelola</span>
            </a>
          </div>
        </div>
      </div>

      {/* QUICK PAY MODAL */}
      {isPayModalOpen && currentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] flex items-center justify-center font-bold text-sm overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-medium">Pembayaran Tagihan Sewa</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Kos Omi Sungai Bangek, Padang
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-500 font-medium block">Nomor Tagihan</span>
                  <span className="tabular-nums font-bold text-zinc-900 text-sm">
                    {currentBill.invoiceCode}
                  </span>
                  <span className="text-xs text-zinc-500 block mt-0.5">
                    {currentBill.periodMonth} · Kamar {currentBill.roomCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-500 font-medium block">Total Pembayaran</span>
                  <span className="text-xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                    {formatRupiah(currentBill.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700">
                  Pilih Saluran Pembayaran:
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('QRIS')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'QRIS'
                        ? 'border-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] ring-2 ring-[hsl(186,72%,24%)]/20'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">QRIS Instan</div>
                      <div className="text-[10px] text-zinc-500">GoPay, OVO, BCA, Livin</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('BCA_VA')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'BCA_VA'
                        ? 'border-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] ring-2 ring-[hsl(186,72%,24%)]/20'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">BCA Virtual Account</div>
                      <div className="text-[10px] text-zinc-500">Verifikasi Otomatis</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('MANDIRI_VA')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'MANDIRI_VA'
                        ? 'border-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] ring-2 ring-[hsl(186,72%,24%)]/20'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Mandiri VA</div>
                      <div className="text-[10px] text-zinc-500">Livin' by Mandiri</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('GOPAY')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      selectedMethod === 'GOPAY'
                        ? 'border-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] ring-2 ring-[hsl(186,72%,24%)]/20'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-zinc-700" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">GoPay / E-Wallet</div>
                      <div className="text-[10px] text-zinc-500">Aplikasi Gojek</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-2 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulasi pelunasan instan dan pencatatan riwayat transaksi sewa</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                  disabled={isPaying}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors cursor-pointer"
                >
                  {isPaying ? 'Memproses Pelunasan...' : 'Konfirmasi Pelunasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
