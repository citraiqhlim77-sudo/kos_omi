'use client';

import React, { useState, useMemo } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { approveReservationAction } from '@/actions/reservations';
import { settlePaymentAction, resetPaymentToUnpaidAction } from '@/actions/payments';
import { formatRupiah } from '@/data/rooms';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldCheck,
  User,
  BedDouble,
  Eye,
  SlidersHorizontal,
  Bell,
} from 'lucide-react';

interface ReservasiManagerClientProps {
  initialReservations: Reservation[];
}

export const ReservasiManagerClient: React.FC<ReservasiManagerClientProps> = ({
  initialReservations,
}) => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  React.useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [approvingCode, setApprovingCode] = useState<string | null>(null);
  const [validatingInvoice, setValidatingInvoice] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const handleValidatePayment = async (resItem: Reservation) => {
    const invCode = resItem.payment?.invoiceCode || `INV-${resItem.code.replace('RSV-', '')}`;
    const method = resItem.payment?.paymentMethod || 'DANA';
    setValidatingInvoice(invCode);
    setFeedbackBanner(null);
    const res = await settlePaymentAction(invCode, method);
    setValidatingInvoice(null);
    if (res.success) {
      setReservations((prev) =>
        prev.map((item) =>
          item.code === resItem.code
            ? {
                ...item,
                status: 'PAID',
                payment: res.payment || item.payment,
              }
            : item
        )
      );
      setFeedbackBanner(
        `Pembayaran ${invCode} (${resItem.userName} - Kamar ${resItem.roomCode}) berhasil divalidasi LUNAS oleh Pengelola! Dana ${formatRupiah(resItem.totalInitialPayment)} telah tercatat di Kas Keuangan.`
      );
      router.refresh();
    } else {
      setFeedbackBanner(res.message || 'Gagal memvalidasi pembayaran');
    }
  };

  const handleRejectPaymentNotReceived = async (resItem: Reservation) => {
    const invCode = resItem.payment?.invoiceCode || `INV-${resItem.code.replace('RSV-', '')}`;
    setValidatingInvoice(invCode);
    setFeedbackBanner(null);
    const res = await resetPaymentToUnpaidAction(invCode);
    setValidatingInvoice(null);
    if (res.success) {
      setReservations((prev) =>
        prev.map((item) =>
          item.code === resItem.code
            ? {
                ...item,
                status: 'APPROVED',
                payment: res.payment || item.payment,
              }
            : item
        )
      );
      setFeedbackBanner(
        `Validasi ditolak: Status pembayaran ${invCode} (${resItem.userName}) dikembalikan ke BELUM DIBAYAR karena dana belum masuk di mutasi rekening/DANA.`
      );
      router.refresh();
    }
  };

  const handleQuickApprove = async (code: string) => {
    setApprovingCode(code);
    setFeedbackBanner(null);
    const res = await approveReservationAction(
      code,
      'Berkas KTP & identitas mahasiswi lengkap. Reservasi disetujui oleh Pengelola Kos Omi.'
    );
    setApprovingCode(null);
    if (res.success && res.data) {
      setReservations((prev) =>
        prev.map((item) => (item.code === code ? res.data! : item))
      );
      setFeedbackBanner(res.message);
      router.refresh();
    } else {
      setFeedbackBanner(res.message || 'Gagal menyetujui reservasi');
    }
  };

  const filtered = useMemo(() => {
    return reservations.filter((item) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PAID') {
          if (item.status !== 'PAID' && item.status !== 'CHECKED_IN') return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchName = item.userName.toLowerCase().includes(q);
        const matchRoom = item.roomCode.toLowerCase().includes(q);
        const matchEmail = item.userEmail.toLowerCase().includes(q);
        const matchPhone = item.userPhone.includes(q);
        return matchCode || matchName || matchRoom || matchEmail || matchPhone;
      }
      return true;
    });
  }, [reservations, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === 'PENDING_REVIEW').length,
      approved: reservations.filter((r) => r.status === 'APPROVED').length,
      waitingPaymentValidation: reservations.filter(
        (r) => r.status === 'APPROVED' && r.payment?.status === 'PENDING'
      ).length,
      paid: reservations.filter((r) => r.status === 'PAID' || r.status === 'CHECKED_IN').length,
      rejected: reservations.filter((r) => r.status === 'REJECTED').length,
    };
  }, [reservations]);

  const getStatusBadge = (status: ReservationStatus, paymentStatus?: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Menunggu Verifikasi KTM/KRS
          </span>
        );
      case 'APPROVED':
        if (paymentStatus === 'PENDING') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
              Menunggu Validasi Transfer Pengelola
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Disetujui · Belum Transfer
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Lunas · Siap Check-In
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Sudah Check-In (Aktif)
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Selesai Sewa (Check-Out)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Ditolak
          </span>
        );
      case 'EXPIRED':
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-700 hover:underline text-[11px]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Notifikasi Validasi Pembayaran Transfer / DANA / QRIS Masuk */}
      {stats.waitingPaymentValidation > 0 && (
        <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-extrabold block">
                Notifikasi Pembayaran Masuk: {stats.waitingPaymentValidation} Calon Penghuni Mengirim Konfirmasi Transfer (Menunggu Validasi Pengelola)!
              </span>
              <span className="text-[11px] text-sky-800">
                Silakan cek mutasi rekening bank atau DANA (<strong>082246424353</strong>) Anda. Jika dana benar-benar sudah masuk, klik tombol hijau <strong>&quot;Validasi Lunas (Dana Masuk)&quot;</strong> di bawah. Jika belum masuk, klik <strong>&quot;Belum Masuk&quot;</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Reservasi Baru Masuk */}
      {stats.pending > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold block">
                Notifikasi Masuk: {stats.pending} Pengajuan Reservasi Baru Menunggu Persetujuan!
              </span>
              <span className="text-[11px] text-amber-800">
                Klik tombol hijau <strong>&quot;Setujui &amp; Kirim Invoice&quot;</strong> pada tabel di bawah untuk langsung menyetujui reservasi dan mengaktifkan pembayaran QRIS / Transfer Bank bagi calon penghuni.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <span className="text-[11px] block font-medium opacity-80">Semua Reservasi</span>
          <span className="text-xl font-heading font-extrabold">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'PENDING_REVIEW'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-amber-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-amber-600">Menunggu Verifikasi</span>
          <span className="text-xl font-heading font-extrabold text-amber-700">{stats.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-blue-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-blue-600">Disetujui</span>
          <span className="text-xl font-heading font-extrabold text-blue-700">{stats.approved}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PAID')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'PAID'
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-emerald-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-emerald-600">Lunas</span>
          <span className="text-xl font-heading font-extrabold text-emerald-700">{stats.paid}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-white text-zinc-800 border-zinc-200 hover:bg-rose-50/40'
          }`}
        >
          <span className="text-[11px] block font-medium text-rose-600">Ditolak</span>
          <span className="text-xl font-heading font-extrabold text-rose-700">{stats.rejected}</span>
        </button>
      </div>

      {/* Search & Control Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama calon, nomor WA, kode reservasi, atau kode kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-[hsl(186,72%,24%)]"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[hsl(186,72%,24%)]"
            >
              <option value="ALL">Semua Status Pengajuan</option>
              <option value="PENDING_REVIEW">Menunggu Verifikasi (Pending)</option>
              <option value="APPROVED">Disetujui (Menunggu Bayar)</option>
              <option value="PAID">Lunas Terverifikasi</option>
              <option value="REJECTED">Ditolak Pengelola</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100">
          <span>
            Menampilkan <strong className="text-zinc-900">{filtered.length}</strong> reservasi
          </span>
          {(statusFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[hsl(186,72%,24%)] font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Reservasi Responsif (Tampilan & Peletakan Tombol Sama di Laptop maupun HP) */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
              <th className="py-3 px-4">Kode & Waktu</th>
              <th className="py-3 px-4">Calon Penghuni</th>
              <th className="py-3 px-4">Kamar</th>
              <th className="py-3 px-4">Rencana Masuk & Durasi</th>
              <th className="py-3 px-4">Total Biaya</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-500">
                  Tidak ada reservasi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">
                    <div className="tabular-nums text-xs">{item.code}</div>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-zinc-900">{item.userName}</div>
                    <div className="text-[11px] text-zinc-500">{item.userPhone}</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-blue-700">
                    <div className="inline-flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kamar {item.roomCode}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600">
                    <div className="font-semibold text-zinc-800">{item.checkInDate}</div>
                    <div className="text-[11px] text-zinc-500">{item.durationMonths} Bulan</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(item.totalInitialPayment)}
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(item.status, item.payment?.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                      {item.status === 'PENDING_REVIEW' && (
                        <button
                          type="button"
                          disabled={approvingCode === item.code}
                          onClick={() => handleQuickApprove(item.code)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {approvingCode === item.code
                              ? 'Menyetujui...'
                              : '1. Setujui KTM/KRS'}
                          </span>
                        </button>
                      )}
                      {item.status === 'APPROVED' && (
                        <>
                          <button
                            type="button"
                            disabled={validatingInvoice === item.payment?.invoiceCode}
                            onClick={() => handleValidatePayment(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                            title="Klik jika dana transfer / DANA benar-benar sudah masuk"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validasi Lunas (Dana Masuk)</span>
                          </button>
                          {item.payment?.status === 'PENDING' && (
                            <button
                              type="button"
                              disabled={validatingInvoice === item.payment?.invoiceCode}
                              onClick={() => handleRejectPaymentNotReceived(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors cursor-pointer"
                              title="Tolak jika dana belum masuk di mutasi rekening/DANA"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Belum Masuk</span>
                            </button>
                          )}
                        </>
                      )}
                      <NextLink
                        href={`/pengelola/reservasi/${item.code}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-[hsl(186,72%,24%)] text-white hover:bg-[hsl(186,74%,18%)] transition-colors"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </NextLink>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
