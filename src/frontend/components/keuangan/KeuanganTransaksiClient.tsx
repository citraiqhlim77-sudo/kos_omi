'use client';

import React,{ useState } from 'react';
import NextLink from 'next/link';
import { PaymentTransaction,GatewayReconciliationResult } from '@/types/finance';
import { reconcileGatewayTransactionsAction } from '@/actions/finance';
import {
type SocialDonationRecord,
type SocialAnnouncement,
addSocialDonationAction,
deleteSocialDonationAction,
createSocialAnnouncementAction,
closeSocialAnnouncementAction,
} from '@/actions/rent-schedule';
import { formatRupiah } from '@/data/rooms';
import {
Receipt,
Search,
ArrowRight,
CheckCircle2,
AlertTriangle,
RefreshCw,
X,
FileCheck2,
HeartHandshake,
Plus,
Trash2,
} from 'lucide-react';

interface KeuanganTransaksiClientProps {
  initialTransactions: PaymentTransaction[];
  initialDonations?: SocialDonationRecord[];
  initialAnnouncements?: SocialAnnouncement[];
}

function formatPaymentMethodLabel(paymentType: string, _bank?: string | null): string {
  const type = (paymentType || '').toLowerCase();
  if (type === 'qris') return 'QRIS';
  return 'Transfer Bank BRI';
}

function formatTxStatusLabel(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'settlement' || s === 'capture' || s === 'paid' || s === 'lunas') {
    return 'Terverifikasi / Lunas';
  }
  if (s === 'pending' || s === 'unpaid') {
    return 'Menunggu Pembayaran';
  }
  return 'Kedaluwarsa';
}

export const KeuanganTransaksiClient: React.FC<KeuanganTransaksiClientProps> = ({
  initialTransactions,
  initialDonations = [],
  initialAnnouncements = [],
}) => {
  const [activeTab, setActiveTab] = useState<'SEWA' | 'DUKA_CITA'>('SEWA');
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [donations, setDonations] = useState<SocialDonationRecord[]>(initialDonations);
  const [announcements, setAnnouncements] = useState<SocialAnnouncement[]>(initialAnnouncements);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnn(true);
    const res = await createSocialAnnouncementAction({ title: annTitle, description: annDesc });
    setIsSavingAnn(false);
    if (res.success && res.announcement) {
      setAnnouncements((prev) => [res.announcement!, ...prev]);
      setIsAnnModalOpen(false);
      setAnnTitle('');
      setAnnDesc('');
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleCloseAnnouncement = async (id: string) => {
    const res = await closeSocialAnnouncementAction(id);
    if (res.success) {
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: false } : a)));
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Reconciliation state
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<GatewayReconciliationResult | null>(null);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Iuran Sosial / Duka Cita (Seikhlasnya) state
  const [donationSearch, setDonationSearch] = useState('');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donTitle, setDonTitle] = useState('');
  const [donDonorName, setDonDonorName] = useState('');
  const [donRoomCode, setDonRoomCode] = useState('');
  const [donAmount, setDonAmount] = useState('');
  const [donMethod, setDonMethod] = useState<'TUNAI' | 'TRANSFER' | 'DANA'>('TUNAI');
  const [donDate, setDonDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [donNotes, setDonNotes] = useState('');
  const [isSavingDonation, setIsSavingDonation] = useState(false);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [deletingDonationId, setDeletingDonationId] = useState<string | null>(null);

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError(null);
    setIsSavingDonation(true);
    try {
      const numericAmount = Number(donAmount.replace(/[^0-9]/g, ''));
      const res = await addSocialDonationAction({
        title: donTitle,
        donorName: donDonorName,
        roomCode: donRoomCode || '-',
        amount: numericAmount,
        method: donMethod,
        notes: donNotes,
        date: donDate,
      });
      if (res.success && res.record) {
        setDonations((prev) => [res.record!, ...prev]);
        setIsDonationModalOpen(false);
        setDonTitle('');
        setDonDonorName('');
        setDonRoomCode('');
        setDonAmount('');
        setDonMethod('TUNAI');
        setDonNotes('');
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setDonationError(res.message);
      }
    } finally {
      setIsSavingDonation(false);
    }
  };

  const handleDeleteDonation = async (id: string) => {
    setDeletingDonationId(id);
    try {
      const res = await deleteSocialDonationAction(id);
      if (res.success) {
        setDonations((prev) => prev.filter((d) => d.id !== id));
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } finally {
      setDeletingDonationId(null);
    }
  };

  const filteredDonations = donations.filter((d) => {
    if (!donationSearch.trim()) return true;
    const q = donationSearch.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.donorName.toLowerCase().includes(q) ||
      d.roomCode.toLowerCase().includes(q) ||
      d.notes.toLowerCase().includes(q)
    );
  });

  const totalDonationAmount = donations.reduce((acc, d) => acc + d.amount, 0);

  const handleReconcile = async () => {
    setIsReconciling(true);
    const res = await reconcileGatewayTransactionsAction();
    if (res.success && res.result) {
      setReconcileResult(res.result);
      setIsReconcileModalOpen(true);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 5000);

      // Sinkronkan state lokal
      setTransactions((prev) =>
        prev.map((t) => {
          const item = res.result.items.find((i) => i.orderId === t.orderId);
          if (item && item.gatewayStatus !== t.transactionStatus) {
            return {
              ...t,
              transactionStatus: item.gatewayStatus,
              settlementTime:
                item.gatewayStatus === 'settlement' ? new Date().toISOString() : t.settlementTime,
            };
          }
          return t;
        })
      );
    }
    setIsReconciling(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    // Status filter
    if (statusFilter !== 'ALL' && t.transactionStatus !== statusFilter) {
      return false;
    }

    // Method filter
    if (methodFilter !== 'ALL' && t.paymentType !== methodFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchOrder = t.orderId.toLowerCase().includes(q);
      const matchInv = t.invoiceNumber.toLowerCase().includes(q);
      const matchName = t.userName.toLowerCase().includes(q);
      const matchRoom = t.roomCode.toLowerCase().includes(q);
      if (!matchOrder && !matchInv && !matchName && !matchRoom) {
        return false;
      }
    }

    return true;
  });

  const settlementCount = transactions.filter((t) => t.transactionStatus === 'settlement').length;
  const pendingCount = transactions.filter((t) => t.transactionStatus === 'pending').length;
  const expireCount = transactions.filter((t) => t.transactionStatus === 'expire').length;

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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Riwayat Pembayaran Sewa & Iuran Sosial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
            Riwayat Pembayaran &amp; Iuran Duka Cita
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Catatan pembayaran sewa kamar dan iuran duka cita sukarela penghuni kos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'SEWA' ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-400 block text-[10px]">Terverifikasi Lunas</span>
                  <span className="font-bold text-emerald-700">{settlementCount} Transaksi</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-400 block text-[10px]">Menunggu</span>
                  <span className="font-bold text-amber-600">{pendingCount} Transaksi</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-400 block text-[10px]">Kedaluwarsa</span>
                  <span className="font-bold text-rose-600">{expireCount} Transaksi</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReconcile}
                disabled={isReconciling}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                <span>{isReconciling ? 'Mencocokkan...' : 'Rekonsiliasi Gateway'}</span>
              </button>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-[hsl(186,72%,24%)] text-xs font-bold transition-colors cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Buat Pengumuman Duka Cita</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDonationError(null);
                  setIsDonationModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Iuran Manual</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab('SEWA')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'SEWA'
              ? 'bg-[hsl(186,72%,24%)] text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Pembayaran Sewa · {transactions.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DUKA_CITA')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'DUKA_CITA'
              ? 'bg-[hsl(186,72%,24%)] text-white'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Iuran Duka Cita · {donations.length}</span>
        </button>
      </div>

      {activeTab === 'DUKA_CITA' ? (
        <div className="space-y-5">
          {announcements.filter((a) => a.isActive).map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-extrabold text-amber-950 block">
                  Pengumuman Aktif ke Semua Penghuni: {ann.title}
                </span>
                <p className="text-amber-900">{ann.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCloseAnnouncement(ann.id)}
                className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-bold shrink-0 cursor-pointer"
              >
                Tutup Pengumuman
              </button>
            </div>
          ))}

          {/* Info Banner + KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                Total Dana Sosial Terkumpul
              </span>
              <p className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                {formatRupiah(totalDonationAmount)}
              </p>
              <p className="text-[11px] text-teal-900/80">
                Dari {donations.length} catatan sumbangan sukarela (seikhlasnya).
              </p>
            </div>

            <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-zinc-200 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-sm font-heading font-extrabold text-zinc-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-[hsl(186,72%,24%)]" />
                  <span>Iuran Duka Cita Sukarela</span>
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Pencatatan sumbangan sukarela penghuni kos saat ada musibah atau keluarga berduka, terpisah dari pendapatan sewa kamar.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  placeholder="Cari nama penyumbang, nomor kamar, atau kegiatan duka cita..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                />
              </div>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {filteredDonations.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <HeartHandshake className="w-9 h-9 text-zinc-300 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">
                  Belum ada catatan iuran duka cita / sosial
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Klik tombol &ldquo;Catat Iuran Duka Cita&rdquo; di kanan atas untuk mencatat sumbangan seikhlasnya dari penghuni kamar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                    <tr>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Kegiatan / Tujuan Duka Cita</th>
                      <th className="p-3.5">Penyumbang &amp; Kamar</th>
                      <th className="p-3.5">Metode</th>
                      <th className="p-3.5 text-right">Nominal (Seikhlasnya)</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredDonations.map((don) => (
                      <tr key={don.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="p-3.5 whitespace-nowrap font-semibold text-zinc-800 tabular-nums">
                          {don.date}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-zinc-900 block">{don.title}</span>
                          {don.notes && (
                            <span className="text-[11px] text-zinc-500 block">{don.notes}</span>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="font-bold text-zinc-900 block">{don.donorName}</span>
                          <span className="text-[11px] text-zinc-500">Kamar {don.roomCode}</span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {don.method}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-right font-heading font-extrabold text-emerald-700 tabular-nums">
                          {formatRupiah(don.amount)}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteDonation(don.id)}
                            disabled={deletingDonationId === don.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition-colors disabled:opacity-50 cursor-pointer"
                            title="Hapus catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor order (KOS-...), invoice, nama penghuni, atau kamar..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-zinc-900 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('settlement')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'settlement' ? 'bg-white text-emerald-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Menunggu
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('expire')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'expire' ? 'bg-white text-rose-700 font-bold' : 'hover:text-zinc-900'
              }`}
            >
              Kedaluwarsa
            </button>
          </div>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 bg-white cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">Semua Metode</option>
            <option value="bank_transfer">Transfer Bank BRI</option>
            <option value="qris">QRIS</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Receipt className="w-8 h-8 text-zinc-300 mx-auto" />
            <p className="text-sm font-bold text-zinc-700">Tidak ada transaksi yang cocok</p>
            <p className="text-xs text-zinc-500">Coba ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold">
                  <tr>
                    <th className="p-3.5">Order ID Gateway</th>
                    <th className="p-3.5">No. Invoice & Tanggal</th>
                    <th className="p-3.5">Pembayar</th>
                    <th className="p-3.5">Kamar</th>
                    <th className="p-3.5">Saluran Bayar</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5 text-center">Status Transaksi</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="tabular-nums font-bold text-zinc-900 block">{tx.orderId}</span>
                        <span className="text-[10px] text-zinc-400 tabular-nums">
                          {tx.midtransTransactionId.substring(0, 18)}...
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="tabular-nums text-zinc-800 font-semibold block">{tx.invoiceNumber}</span>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-zinc-900 block">{tx.userName}</span>
                        <span className="text-[11px] text-zinc-500">{tx.userPhone}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-zinc-900">Kamar {tx.roomCode}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-medium text-zinc-800">
                        {formatPaymentMethodLabel(tx.paymentType, tx.bank)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right font-heading font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(tx.grossAmount)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded ${
                            tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : tx.transactionStatus === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {formatTxStatusLabel(tx.transactionStatus)}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right">
                        <NextLink
                          href={`/keuangan/transaksi/${tx.orderId}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors min-h-[36px]"
                        >
                          <span>Detail</span>
                          <ArrowRight className="w-3 h-3 text-zinc-400" />
                        </NextLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 640px) */}
            <div className="sm:hidden divide-y divide-zinc-100 p-3 space-y-3">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="tabular-nums text-xs font-bold text-zinc-900 block">
                        {tx.orderId}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {tx.userName} · Kamar {tx.roomCode}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded shrink-0 ${
                        tx.transactionStatus === 'settlement' || tx.transactionStatus === 'capture'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : tx.transactionStatus === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {formatTxStatusLabel(tx.transactionStatus)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-zinc-200/60 text-xs space-y-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-500">Invoice:</span>
                      <span className="tabular-nums font-semibold text-zinc-800 break-all">{tx.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-500">Saluran Bayar:</span>
                      <span className="font-medium text-zinc-800">
                        {formatPaymentMethodLabel(tx.paymentType, tx.bank)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-100 pt-1 mt-1 font-bold">
                      <span className="text-zinc-800">Nominal:</span>
                      <span className="text-[hsl(186,72%,24%)] font-heading font-extrabold text-sm tabular-nums">
                        {formatRupiah(tx.grossAmount)}
                      </span>
                    </div>
                  </div>

                  <NextLink
                    href={`/keuangan/transaksi/${tx.orderId}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>Lihat Rincian Transaksi</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  </NextLink>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
        </>
      )}

      {/* Modal Buat Pengumuman Duka Cita ke Semua Penghuni */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/55">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                Buat Pengumuman Iuran Duka Cita
              </h3>
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1">
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Contoh: Duka Cita Keluarga Penghuni Kamar 12"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1">
                  Deskripsi / Informasi Kemalangan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={annDesc}
                  onChange={(e) => setAnnDesc(e.target.value)}
                  placeholder="Tuliskan keterangan singkat. Penghuni dapat mengirim iuran seikhlasnya via Bank BRI atau mengabaikan pengumuman ini."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingAnn}
                  className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingAnn ? 'Mengirim...' : 'Kirim ke Semua Penghuni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Iuran Sosial / Duka Cita */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/55 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[hsl(186,72%,24%)]">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                    Catat Iuran Duka Cita (Seikhlasnya)
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Tersimpan terpisah dari pendapatan sewa kos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDonationModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDonation} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1">
                  Kegiatan / Tujuan Duka Cita *
                </label>
                <input
                  type="text"
                  required
                  value={donTitle}
                  onChange={(e) => setDonTitle(e.target.value)}
                  placeholder="Contoh: Duka Cita Orang Tua Penghuni Kamar 12"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Nama Penyumbang *
                  </label>
                  <input
                    type="text"
                    required
                    value={donDonorName}
                    onChange={(e) => setDonDonorName(e.target.value)}
                    placeholder="Contoh: Aisyah"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    No. Kamar
                  </label>
                  <input
                    type="text"
                    value={donRoomCode}
                    onChange={(e) => setDonRoomCode(e.target.value)}
                    placeholder="Contoh: 14"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Nominal (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={donAmount}
                    onChange={(e) => setDonAmount(e.target.value)}
                    placeholder="20000"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-bold tabular-nums focus:outline-hidden focus:ring-2 focus:ring-[hsl(186,72%,24%)]/20 focus:border-[hsl(186,72%,24%)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Metode Penyerahan
                  </label>
                  <select
                    value={donMethod}
                    onChange={(e) => setDonMethod(e.target.value as 'TUNAI' | 'TRANSFER' | 'DANA')}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-semibold bg-white focus:outline-hidden"
                  >
                    <option value="TUNAI">Tunai / Cash</option>
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="DANA">DANA / E-Wallet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={donDate}
                    onChange={(e) => setDonDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={donNotes}
                    onChange={(e) => setDonNotes(e.target.value)}
                    placeholder="Dititip via..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {donationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {donationError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsDonationModalOpen(false)}
                  disabled={isSavingDonation}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingDonation}
                  className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingDonation ? 'Menyimpan...' : 'Simpan Sumbangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Rekonsiliasi Gateway */}
      {isReconcileModalOpen && reconcileResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-3xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-extrabold text-zinc-900">
                    Hasil Rekonsiliasi Midtrans Gateway
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Waktu rekonsiliasi: {new Date(reconcileResult.reconciledAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReconcileModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Reconciliation KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 block text-[11px]">Total Transaksi</span>
                <span className="font-heading font-extrabold text-lg text-zinc-900">
                  {reconcileResult.totalChecked}
                </span>
                <span className="text-[10px] text-zinc-400 block">Transaksi Diperiksa</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-emerald-700 block text-[11px] font-semibold">Cocok 100%</span>
                <span className="font-heading font-extrabold text-lg text-emerald-800">
                  {reconcileResult.matchedCount}
                </span>
                <span className="text-[10px] text-emerald-600 block">Status & Nominal Sesuai</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="text-blue-700 block text-[11px] font-semibold">Disinkronkan</span>
                <span className="font-heading font-extrabold text-lg text-blue-800">
                  {reconcileResult.autoSyncedCount}
                </span>
                <span className="text-[10px] text-blue-600 block">Auto-Sync ke Settlement</span>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-zinc-500 block text-[11px]">Selisih Nominal</span>
                <span className="font-heading font-extrabold text-lg text-zinc-900 tabular-nums">
                  {formatRupiah(reconcileResult.discrepancyAmount)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Nol Selisih (Akurat)</span>
              </div>
            </div>

            {/* Total Comparison Banner */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-zinc-500">Gross Total di Sistem: </span>
                <strong className="text-zinc-900 tabular-nums">{formatRupiah(reconcileResult.systemGrossTotal)}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Gross Total di Gateway Midtrans: </span>
                <strong className="text-emerald-700 tabular-nums">{formatRupiah(reconcileResult.gatewayGrossTotal)}</strong>
              </div>
            </div>

            {/* Reconciliation Item Table */}
            <div className="overflow-y-auto flex-1 border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 font-bold sticky top-0">
                  <tr>
                    <th className="p-3">Order ID & Invoice</th>
                    <th className="p-3">Penghuni / Kamar</th>
                    <th className="p-3">Status Sistem</th>
                    <th className="p-3">Status Gateway</th>
                    <th className="p-3 text-right">Nominal</th>
                    <th className="p-3 text-right">Hasil Rekonsiliasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {reconcileResult.items.map((item) => (
                    <tr key={item.orderId} className="hover:bg-zinc-50/60">
                      <td className="p-3 tabular-nums">
                        <span className="font-bold text-zinc-900 block">{item.orderId}</span>
                        <span className="text-[10px] text-zinc-400">{item.invoiceNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-zinc-900 block">{item.userName}</span>
                        <span className="text-[10px] text-zinc-500">Kamar {item.roomCode}</span>
                      </td>
                      <td className="p-3">
                        <span className="tabular-nums text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                          {formatTxStatusLabel(item.systemStatus)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="tabular-nums text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {formatTxStatusLabel(item.gatewayStatus)}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums">
                        {formatRupiah(item.systemAmount)}
                      </td>
                      <td className="p-3 text-right">
                        {item.resolution === 'AUTO_SYNCED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            Disinkronkan
                          </span>
                        ) : item.resolution === 'MATCHED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cocok 100%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Selisih
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsReconcileModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup Ringkasan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
