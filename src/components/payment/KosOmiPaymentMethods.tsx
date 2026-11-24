'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Building2,
  Wallet,
  Copy,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export interface PaymentMethodItem {
  id:
    | 'qris'
    | 'dana'
    | 'bca_va'
    | 'bri_va'
    | 'bni_va'
    | 'echannel'
    | 'permata_va'
    | 'gopay'
    | 'shopeepay';
  label: string;
  shortDesc: string;
  category: 'BANK' | 'QRIS' | 'EWALLET';
  accountNumber?: string;
  accountHolder: string;
  badgeColor: string;
}

/**
 * Kanal resmi Payment Gateway Kos Omi (Midtrans Snap):
 * QRIS ('qris'), DANA ('dana' - 082246424353), Transfer Bank / Virtual Account ('bca_va', 'bri_va', 'bni_va', 'echannel', 'permata_va'),
 * serta E-Wallet ('gopay', 'shopeepay').
 */
export const KOS_OMI_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'qris',
    label: 'QRIS Midtrans',
    shortDesc: 'Scan QRIS dari semua m-Banking, DANA, GoPay, ShopeePay',
    category: 'QRIS',
    accountHolder: 'KOS OMI SUNGAI BANGEK PADANG',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'dana',
    label: 'DANA (E-Wallet)',
    shortDesc: 'Pembayaran via DANA (082246424353)',
    category: 'EWALLET',
    accountNumber: '082246424353',
    accountHolder: 'Kos Omi Sungai Bangek (DANA)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'bca_va',
    label: 'BCA Virtual Account',
    shortDesc: 'BCA Mobile / myBCA / KlikBCA (bca_va)',
    category: 'BANK',
    accountNumber: '88012-0812-3456-789',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans VA)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'bri_va',
    label: 'BRI Virtual Account (BRIVA)',
    shortDesc: 'BRImo / ATM BRI (bri_va)',
    category: 'BANK',
    accountNumber: '77812-0812-3456-789',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans VA)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'bni_va',
    label: 'BNI Virtual Account',
    shortDesc: 'Wondr by BNI / BNI Mobile (bni_va)',
    category: 'BANK',
    accountNumber: '98812-0812-3456-789',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans VA)',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'echannel',
    label: 'Mandiri Bill Payment',
    shortDesc: 'Livin by Mandiri (echannel - Kode: 70012)',
    category: 'BANK',
    accountNumber: '70012-0812-3456-789',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans VA)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'permata_va',
    label: 'Permata Virtual Account',
    shortDesc: 'PermataME / ATM Bersama (permata_va)',
    category: 'BANK',
    accountNumber: '8528-0812-3456-789',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans VA)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'gopay',
    label: 'GoPay (E-Wallet)',
    shortDesc: 'Pembayaran instan via Gojek / GoPay (gopay)',
    category: 'EWALLET',
    accountNumber: '0813-7432-9562',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans GoPay)',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'shopeepay',
    label: 'ShopeePay (E-Wallet)',
    shortDesc: 'Pembayaran instan via ShopeePay (shopeepay)',
    category: 'EWALLET',
    accountNumber: '0813-7432-9562',
    accountHolder: 'Kos Omi Sungai Bangek (Midtrans ShopeePay)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

interface KosOmiPaymentSelectorProps {
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
  amountFormatted?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const KosOmiPaymentSelector: React.FC<KosOmiPaymentSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amountFormatted = 'Rp 5.000.000',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeMethod =
    KOS_OMI_PAYMENT_METHODS.find(
      (m) => m.id.toLowerCase() === selectedMethod.toLowerCase()
    ) || KOS_OMI_PAYMENT_METHODS[0];

  const handleCopy = (text: string, id: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    navigator.clipboard?.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-zinc-700 block">
          Pilih Metode Pembayaran (QRIS, DANA 082246424353, Transfer Bank VA, GoPay, ShopeePay):
        </span>

        {/* Pilihan 9 Kanal Resmi (QRIS, DANA, BCA, BRI, BNI, Mandiri, Permata, GoPay, ShopeePay) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {KOS_OMI_PAYMENT_METHODS.map((m) => {
            const isSelected = activeMethod.id === m.id;
            const Icon =
              m.category === 'QRIS'
                ? QrCode
                : m.category === 'BANK'
                ? Building2
                : Wallet;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMethod(m.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[hsl(186,72%,24%)] bg-blue-50/70 ring-2 ring-[hsl(186,72%,24%)]/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    size={15}
                    className={
                      isSelected ? 'text-[hsl(186,72%,24%)]' : 'text-zinc-500'
                    }
                  />
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 tabular-nums">
                    {m.category === 'BANK' ? 'TRANSFER VA' : m.category}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 block leading-tight">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 tabular-nums">
                    {m.accountNumber || 'Scan Barcode QRIS'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KOTAK DETAIL TUJUAN TRANSFER / QRIS / DANA */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
        {activeMethod.category === 'QRIS' ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-32 bg-white p-2.5 rounded-xl border-2 border-zinc-200 shadow-xs flex flex-col items-center justify-center shrink-0">
              <div className="w-full flex items-center justify-between px-1 pb-1 border-b border-zinc-100 mb-1.5">
                <span className="text-[9px] font-black tracking-tight text-zinc-900">QRIS</span>
                <span className="text-[8px] font-bold text-rose-600">GPN</span>
              </div>
              <svg
                viewBox="0 0 120 120"
                className="w-20 h-20 text-zinc-900"
                aria-label="Kode QRIS Midtrans Kos Omi"
              >
                <rect width="120" height="120" fill="#ffffff" />
                <rect x="6" y="6" width="32" height="32" fill="none" stroke="#18181b" strokeWidth="5" />
                <rect x="14" y="14" width="16" height="16" fill="#18181b" />
                <rect x="82" y="6" width="32" height="32" fill="none" stroke="#18181b" strokeWidth="5" />
                <rect x="90" y="14" width="16" height="16" fill="#18181b" />
                <rect x="6" y="82" width="32" height="32" fill="none" stroke="#18181b" strokeWidth="5" />
                <rect x="14" y="90" width="16" height="16" fill="#18181b" />
                <rect x="44" y="44" width="32" height="32" rx="6" fill="#0f766e" />
                <text x="60" y="64" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  OMI
                </text>
              </svg>
              <span className="text-[8px] font-bold text-zinc-500 mt-1">
                NMID: ID1026048291538
              </span>
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                QRIS Resmi Kos Omi (Mendukung DANA, m-Banking, GoPay, ShopeePay)
              </span>
              <p className="text-xs font-extrabold text-zinc-900">
                {activeMethod.accountHolder} • Tagihan: {amountFormatted}
              </p>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Lakukan scan &amp; transfer sebesar <strong>{amountFormatted}</strong>. Setelah Anda benar-benar melakukan transfer, klik tombol konfirmasi di bawah agar <strong>Pengelola Kos memeriksa dana masuk &amp; memvalidasi pembayaran Anda</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">
                Tujuan Transfer {activeMethod.label}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${activeMethod.badgeColor}`}
              >
                {activeMethod.category === 'BANK'
                  ? `Virtual Account (${activeMethod.id})`
                  : `E-Wallet (${activeMethod.label})`}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block">
                  {activeMethod.category === 'BANK'
                    ? 'Nomor Virtual Account Tujuan'
                    : `Nomor ${activeMethod.label} Kos Omi`}
                </span>
                <span className="tabular-nums font-extrabold text-base sm:text-lg text-zinc-900 tracking-wide">
                  {activeMethod.accountNumber}
                </span>
                <span className="text-xs text-zinc-600 block font-medium">
                  Penerima: <strong>{activeMethod.accountHolder}</strong> • Nominal: <strong>{amountFormatted}</strong>
                </span>
              </div>

              {activeMethod.accountNumber && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(activeMethod.accountNumber!, activeMethod.id)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  {copiedId === activeMethod.id ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Salin Nomor</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
          <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Ketentuan Validasi Pembayaran:</strong> Pembayaran <strong>tidak langsung berstatus Lunas</strong> sebelum dana benar-benar masuk. Setelah Anda mengirim konfirmasi pembayaran di bawah, <strong>Pengelola Kos akan memeriksa mutasi rekening/DANA (082246424353) dan memvalidasi pelunasan Anda</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
