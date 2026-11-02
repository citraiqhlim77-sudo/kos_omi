'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { TenancyRecord } from '@/types/tenancy';
import { processCheckoutAction } from '@/actions/tenancy';
import { formatRupiah } from '@/data/rooms';
import {
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building2,
  X,
  Phone,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Receipt,
  AlertCircle,
} from 'lucide-react';

interface CheckoutManagerClientProps {
  initialTenants: TenancyRecord[];
}

export const CheckoutManagerClient: React.FC<CheckoutManagerClientProps> = ({
  initialTenants,
}) => {
  const [tenants, setTenants] = useState<TenancyRecord[]>(initialTenants);
  const [selectedTenant, setSelectedTenant] = useState<TenancyRecord | null>(null);

  // Modal States
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isNormalModalOpen, setIsNormalModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCheckoutClick = (tenant: TenancyRecord) => {
    setSelectedTenant(tenant);
    if (tenant.unpaidBillsCount > 0) {
      setIsWarningModalOpen(true);
    } else {
      setIsNormalModalOpen(true);
    }
  };

  const executeCheckout = async (forceApproved: boolean = false) => {
    if (!selectedTenant) return;

    setIsProcessing(true);
    setFeedback(null);

    const res = await processCheckoutAction(selectedTenant.id, forceApproved);

    if (res.success) {
      setTenants((prev) =>
        prev.map((t) => (t.id === selectedTenant.id ? { ...t, status: 'SELESAI' } : t))
      );
      setIsWarningModalOpen(false);
      setIsNormalModalOpen(false);
      setFeedback({
        type: 'success',
        message: res.message || `Check-out berhasil diproses untuk ${selectedTenant.userName}!`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Gagal memproses check-out.',
      });
    }

    setIsProcessing(false);
  };

  const activeTenants = tenants.filter((t) => t.status === 'AKTIF');

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
              Operasional Check-out
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Proses Check-out Penghuni
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Pemeriksaan tagihan sewa bulanan dan pengembalian uang jaminan (deposit). Kamar akan otomatis kembali tersedia.
          </p>
        </div>

        <div className="px-5 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-left sm:text-right">
          <span className="text-[11px] text-zinc-500 font-medium block">
            Penghuni Aktif
          </span>
          <span className="text-xl font-heading font-extrabold text-zinc-900 tabular-nums">
            {activeTenants.length} Orang
          </span>
        </div>
      </div>

      {/* Tenant List for Checkout */}
      <div className="space-y-4">
        {tenants.map((tenant) => {
          const isActive = tenant.status === 'AKTIF';
          const hasUnpaid = tenant.unpaidBillsCount > 0;

          return (
            <div
              key={tenant.id}
              className={`bg-white rounded-2xl border transition-all p-6 ${
                !isActive
                  ? 'border-zinc-200 bg-zinc-50/50 opacity-75'
                  : hasUnpaid
                  ? 'border-amber-300 ring-1 ring-amber-300/30'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl font-heading font-extrabold text-lg flex items-center justify-center border shrink-0 ${
                      hasUnpaid
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-[hsl(186,72%,24%)] border-blue-100'
                    }`}
                  >
                    {tenant.roomCode}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading font-extrabold text-zinc-900 text-lg">
                        {tenant.userName}
                      </h3>
                      {isActive ? (
                        hasUnpaid ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ada 1 Tagihan Belum Lunas</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Seluruh Tagihan Lunas
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                          Selesai Check-out ({tenant.checkOutDate})
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Kamar: <strong className="text-zinc-900">{tenant.roomCode}</strong> (Lantai {tenant.roomFloor})</span>
                      <span>•</span>
                      <span>Check-in: <strong>{tenant.checkInDate}</strong></span>
                      <span>•</span>
                      <span>Batas Kontrak: <strong>{tenant.contractEndDate}</strong></span>
                      <span>•</span>
                      <span>Sewa: <strong className="tabular-nums">{formatRupiah(tenant.monthlyPrice)}/bln</strong></span>
                    </div>

                    <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span>WhatsApp: <strong className="text-zinc-700">{tenant.userPhone}</strong></span>
                      <span>•</span>
                      <span>Deposit Awal: <strong className="text-zinc-800">{formatRupiah(tenant.depositAmount)}</strong></span>
                      <span>•</span>
                      <NextLink
                        href={`/pengelola/penghuni/${tenant.id}`}
                        className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Lihat Profil Penghuni</span>
                        <ArrowRight className="w-3 h-3" />
                      </NextLink>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                  {isActive ? (
                    <button
                      type="button"
                      onClick={() => handleCheckoutClick(tenant)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        hasUnpaid
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{hasUnpaid ? 'Check-out (Perlu Konfirmasi)' : 'Proses Check-out'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-500 py-2">
                      Kamar telah dikembalikan ke status Tersedia
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DIALOG PERINGATAN TAGIHAN BELUM LUNAS (REQUIRED IN PRD) */}
      {isWarningModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-300 animate-in zoom-in-95 duration-150">
            {/* Header Merah Peringatan */}
            <div className="bg-rose-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-800 flex items-center justify-center font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-200" />
                </div>
                <div>
                  <p className="text-[11px] text-rose-200 font-semibold">
                    Peringatan Pembayaran
                  </p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Tagihan Sewa Belum Lunas!
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWarningModalOpen(false)}
                className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sistem mendeteksi tagihan tertunggak pada penghuni ini</span>
                </div>
                <p className="leading-relaxed">
                  Sesuai aturan PRD Bab 3.F, proses check-out kamar normal mensyaratkan seluruh kewajiban sewa bulan berjalan telah lunas, kecuali disetujui secara khusus oleh Pengelola/Admin dengan kompensasi pemotongan deposit.
                </p>
              </div>

              {/* Rincian Invoice Tertunggak */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-700 block">
                  Rincian Invoice Tertunggak:
                </span>
                <div className="space-y-2">
                  {selectedTenant.unpaidInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="tabular-nums font-bold text-rose-900 block">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-zinc-600 text-[11px] block">
                          {inv.description}
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold block">
                          Jatuh Tempo: {inv.dueDate}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-500 block">Tertunggak</span>
                        <span className="font-heading font-extrabold text-rose-700 text-sm tabular-nums">
                          {formatRupiah(inv.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perhitungan Kompensasi Deposit */}
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Total Uang Jaminan (Deposit Awal):</span>
                  <span className="font-bold text-zinc-900">{formatRupiah(selectedTenant.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Potongan Tagihan Sewa Tertunggak:</span>
                  <span>- {formatRupiah(selectedTenant.totalUnpaidAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-bold text-emerald-800">
                  <span>Sisa Pengembalian Deposit ke Penghuni:</span>
                  <span className="tabular-nums">
                    {formatRupiah(selectedTenant.depositAmount - selectedTenant.totalUnpaidAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsWarningModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                    disabled={isProcessing}
                  >
                    Batal & Minta Pelunasan Dulu
                  </button>

                  <button
                    type="button"
                    onClick={() => executeCheckout(true)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    {isProcessing ? 'Memproses...' : 'Setujui Check-out (Potong Deposit)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NORMAL CHECK-OUT CONFIRMATION MODAL */}
      {isNormalModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] flex items-center justify-center font-bold text-sm overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="text-[11px] text-zinc-400 font-medium">Konfirmasi Selesai Sewa</p>
                  <h3 className="font-heading font-extrabold text-base leading-tight">
                    Proses Check-out Kamar
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNormalModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <strong className="block text-sm">
                    Seluruh Tagihan Lunas Terverifikasi
                  </strong>
                  <p className="leading-relaxed">
                    Semua tagihan sewa bulanan <strong>{selectedTenant.userName}</strong> telah lunas. Pengembalian deposit penuh sebesar <strong>{formatRupiah(selectedTenant.depositAmount)}</strong> akan diteruskan ke bagian Keuangan.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs border border-zinc-200 rounded-xl p-4 bg-zinc-50">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nama Penghuni:</span>
                  <span className="font-bold text-zinc-900">{selectedTenant.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kamar yang Dilepas:</span>
                  <span className="font-bold text-zinc-900">Kamar {selectedTenant.roomCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tanggal Check-out:</span>
                  <span className="font-bold text-zinc-900">Hari ini ({new Date().toLocaleDateString('id-ID')})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pengembalian Uang Jaminan:</span>
                  <span className="font-bold text-emerald-700">{formatRupiah(selectedTenant.depositAmount)} (Penuh)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsNormalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                  disabled={isProcessing}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => executeCheckout(false)}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi Check-out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
