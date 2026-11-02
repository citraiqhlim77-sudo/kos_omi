'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentInvoice, Reservation } from '@/types/reservation';
import { formatRupiah } from '@/data/rooms';
import { settlePaymentAction, getOrCreateSnapTokenAction } from '@/actions/payments';
import { loadSnapScript } from '@/lib/payment/snap-client';
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentInvoice;
  reservation?: Reservation;
  onSuccess?: (paidInvoice: PaymentInvoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  reservation,
  onSuccess,
}) => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'GOPAY'>('QRIS');
  const [snapToken, setSnapToken] = useState<string | null>(invoice.snapToken || null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadSnapScript();
      if (!snapToken) {
        getOrCreateSnapTokenAction(invoice.invoiceCode).then((res) => {
          if (res.success && res.snapToken) {
            setSnapToken(res.snapToken);
          }
        });
      }
    }
  }, [isOpen, invoice.invoiceCode, snapToken]);

  if (!isOpen) return null;

  const handlePay = () => {
    setError(null);
    startTransition(async () => {
      // Pastikan Snap token telah diinisialisasi & disimpan pada invoice di database
      if (!snapToken) {
        const snapRes = await getOrCreateSnapTokenAction(invoice.invoiceCode);
        if (snapRes.success && snapRes.snapToken) {
          setSnapToken(snapRes.snapToken);
        }
      }

      // Panggil Server Action untuk menyelesaikan pembayaran di server
      const result = await settlePaymentAction(invoice.invoiceCode, selectedMethod);

      if (result.success) {
        if (result.payment) {
          onSuccess?.(result.payment);
        }
        // Alihkan ke /pembayaran/selesai dengan order_id
        router.push(`/pembayaran/selesai?order_id=${invoice.invoiceCode}`);
      } else {
        setError(result.message || 'Pembayaran gagal diproses.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header Modal Midtrans Snap Mock */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(217,91%,45%)] flex items-center justify-center font-bold text-sm">
              KO
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Midtrans Snap Payment Gateway</p>
              <h3 className="font-heading font-extrabold text-base leading-tight">
                Kos Omi Sungai Bangek, Padang
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ringkasan Tagihan */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Nomor Invoice</span>
              <span className="font-heading font-bold text-slate-800 text-sm">
                {invoice.invoiceCode}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Kamar {reservation?.roomCode || invoice.roomCode} {reservation?.durationMonths ? `(${reservation.durationMonths} Bulan)` : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium block">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-[hsl(217,91%,45%)] font-heading tabular-nums">
                {formatRupiah(invoice.amount)}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pemilihan Metode Pembayaran */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Pilih Saluran Pembayaran Resmi Midtrans:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* QRIS */}
              <button
                type="button"
                onClick={() => setSelectedMethod('QRIS')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  selectedMethod === 'QRIS'
                    ? 'border-[hsl(217,91%,45%)] bg-blue-50/50 ring-1 ring-[hsl(217,91%,45%)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded bg-white shadow-sm border border-slate-100 text-slate-700">
                  <QrCode size={18} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">QRIS Mandiri</span>
                  <span className="text-[10px] text-slate-500 block">BCA, Mandiri, GoPay, OVO</span>
                </div>
              </button>

              {/* BCA VA */}
              <button
                type="button"
                onClick={() => setSelectedMethod('BCA_VA')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  selectedMethod === 'BCA_VA'
                    ? 'border-[hsl(217,91%,45%)] bg-blue-50/50 ring-1 ring-[hsl(217,91%,45%)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded bg-white shadow-sm border border-slate-100 text-blue-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">BCA Virtual Account</span>
                  <span className="text-[10px] text-slate-500 block">Verifikasi otomatis 24 jam</span>
                </div>
              </button>

              {/* Mandiri VA */}
              <button
                type="button"
                onClick={() => setSelectedMethod('MANDIRI_VA')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  selectedMethod === 'MANDIRI_VA'
                    ? 'border-[hsl(217,91%,45%)] bg-blue-50/50 ring-1 ring-[hsl(217,91%,45%)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded bg-white shadow-sm border border-slate-100 text-amber-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Mandiri Bill Payment</span>
                  <span className="text-[10px] text-slate-500 block">Livin&apos; by Mandiri</span>
                </div>
              </button>

              {/* GoPay */}
              <button
                type="button"
                onClick={() => setSelectedMethod('GOPAY')}
                className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                  selectedMethod === 'GOPAY'
                    ? 'border-[hsl(217,91%,45%)] bg-blue-50/50 ring-1 ring-[hsl(217,91%,45%)]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded bg-white shadow-sm border border-slate-100 text-emerald-600">
                  <Wallet size={18} />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">GoPay / GoPay Later</span>
                  <span className="text-[10px] text-slate-500 block">Aplikasi Gojek</span>
                </div>
              </button>
            </div>
          </div>

          {/* Batas Waktu Bayar */}
          <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-xs flex items-center gap-2">
            <Clock size={15} className="text-amber-700 shrink-0" />
            <span>
              Batas waktu penyelesaian: <strong>24 jam</strong> sejak invoice diterbitkan.
            </span>
          </div>

          {/* Tombol Aksi Bayar */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handlePay}
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? 'Memproses Verifikasi Server...' : `Bayar ${formatRupiah(invoice.amount)} Sekarang`}
              <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Transaksi dilindungi sertifikasi PCI-DSS Level 1 Midtrans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
