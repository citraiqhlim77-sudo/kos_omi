'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentInvoice, Reservation } from '@/types/reservation';
import { formatRupiah } from '@/data/rooms';
import { settlePaymentAction, getOrCreateSnapTokenAction } from '@/actions/payments';
import { loadSnapScript } from '@/lib/payment/snap-client';
import { KosOmiPaymentSelector } from '@/components/payment/KosOmiPaymentMethods';
import {
  X,
  Clock,
  ArrowRight,
  AlertCircle,
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
  const [selectedMethod, setSelectedMethod] = useState<string>('QRIS');
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
      if (!snapToken) {
        const snapRes = await getOrCreateSnapTokenAction(invoice.invoiceCode);
        if (snapRes.success && snapRes.snapToken) {
          setSnapToken(snapRes.snapToken);
        }
      }

      const result = await settlePaymentAction(invoice.invoiceCode, selectedMethod);

      if (result.success) {
        if (result.payment) {
          onSuccess?.(result.payment);
        }
        router.push(`/pembayaran/selesai?order_id=${invoice.invoiceCode}`);
      } else {
        setError(result.message || 'Pembayaran gagal diproses.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header Modal Pembayaran Kos Omi */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(186,72%,24%)] flex items-center justify-center font-bold text-sm overflow-hidden p-0"><img src="/logo-kos-omi.png" alt="Logo Kos Omi" className="w-full h-full object-cover" /></div>
            <div>
              <p className="text-xs text-zinc-400 font-medium">Pembayaran Sewa Kamar Kos Omi</p>
              <h3 className="font-heading font-extrabold text-base leading-tight">
                Kos Omi Sungai Bangek, Padang
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ringkasan Tagihan */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 font-medium block">Nomor Invoice</span>
              <span className="font-heading font-bold text-zinc-800 text-sm">
                {invoice.invoiceCode}
              </span>
              <span className="text-xs text-zinc-500 block mt-0.5">
                Kamar {reservation?.roomCode || invoice.roomCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500 font-medium block">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-[hsl(186,72%,24%)] font-heading tabular-nums">
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

          {/* Pilihan Metode Pembayaran Lengkap: QRIS, BRI, BCA, BSI, Nagari, SeaBank, DANA, ShopeePay + Upload Bukti */}
          <KosOmiPaymentSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            amountFormatted={formatRupiah(invoice.amount)}
          />

          {/* Batas Waktu Bayar */}
          <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-xs flex items-center gap-2">
            <Clock size={15} className="text-amber-700 shrink-0" />
            <span>
              Pastikan nominal transfer sesuai tagihan. Konfirmasi pembayaran tercatat otomatis di sistem Kos Omi.
            </span>
          </div>

          {/* Tombol Aksi Bayar */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handlePay}
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Memproses Konfirmasi Pembayaran...' : `Konfirmasi & Bayar ${formatRupiah(invoice.amount)} (${selectedMethod})`}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
