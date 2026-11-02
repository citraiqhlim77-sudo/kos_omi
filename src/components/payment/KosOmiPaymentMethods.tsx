'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Building2,
  Wallet,
  Copy,
  Check,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export interface PaymentMethodItem {
  id: string;
  label: string;
  shortDesc: string;
  category: 'QRIS' | 'BANK' | 'EWALLET';
  accountNumber?: string;
  accountHolder: string;
  badgeColor: string;
}

export const KOS_OMI_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'QRIS',
    label: 'QRIS Kos Omi',
    shortDesc: 'Scan dari semua m-Banking & E-Wallet',
    category: 'QRIS',
    accountHolder: 'KOS OMI SUNGAI BANGEK PADANG',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  // TRANSFER BANK: BRI, BCA, BSI, Bank Nagari, SeaBank
  {
    id: 'BRI',
    label: 'Bank BRI',
    shortDesc: 'Transfer / BRImo',
    category: 'BANK',
    accountNumber: '5412-01-028491-53-8',
    accountHolder: 'Ibu Kos Omi',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'BCA',
    label: 'Bank BCA',
    shortDesc: 'Transfer / BCA Mobile / myBCA',
    category: 'BANK',
    accountNumber: '8410-5928-14',
    accountHolder: 'Ibu Kos Omi',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'BSI',
    label: 'Bank Syariah Indonesia (BSI)',
    shortDesc: 'Transfer / BYOND / BSI Mobile',
    category: 'BANK',
    accountNumber: '7198-4520-18',
    accountHolder: 'Ibu Kos Omi',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'BANK_NAGARI',
    label: 'Bank Nagari',
    shortDesc: 'Transfer / Ollin by Nagari',
    category: 'BANK',
    accountNumber: '2100-0210-48291-5',
    accountHolder: 'Ibu Kos Omi',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'SEABANK',
    label: 'SeaBank',
    shortDesc: 'Transfer Instan Bebas Admin',
    category: 'BANK',
    accountNumber: '9018-4729-1052',
    accountHolder: 'Ibu Kos Omi',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  // E-WALLET: DANA, ShopeePay
  {
    id: 'DANA',
    label: 'DANA (E-Wallet)',
    shortDesc: 'Kirim ke Nomor DANA Ibu Kos',
    category: 'EWALLET',
    accountNumber: '0813-7432-9562',
    accountHolder: 'Ibu Kos Omi (+62 813-7432-9562)',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'SHOPEEPAY',
    label: 'ShopeePay (E-Wallet)',
    shortDesc: 'Transfer ke ShopeePay Ibu Kos',
    category: 'EWALLET',
    accountNumber: '0813-7432-9562',
    accountHolder: 'Ibu Kos Omi (+62 813-7432-9562)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

interface KosOmiPaymentSelectorProps {
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
  amountFormatted?: string;
}

export const KosOmiPaymentSelector: React.FC<KosOmiPaymentSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amountFormatted,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  const activeMethod =
    KOS_OMI_PAYMENT_METHODS.find((m) => m.id === selectedMethod) ||
    KOS_OMI_PAYMENT_METHODS[0];

  const handleCopy = (text: string, id: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    navigator.clipboard?.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-zinc-700 block">
          Pilih Metode Pembayaran (QRIS, Transfer Bank, atau E-Wallet):
        </span>

        {/* Pilihan Metode dalam Grid Rapi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KOS_OMI_PAYMENT_METHODS.map((m) => {
            const isSelected = selectedMethod === m.id;
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
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {m.category}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xs text-zinc-900 block leading-tight">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                    {m.accountNumber || 'Scan Barcode'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kotak Detail Nomor Rekening / E-Wallet / QRIS */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
        {activeMethod.category === 'QRIS' ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Simulasi Visual QR Code */}
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-zinc-200 flex flex-col items-center justify-center shrink-0">
              <QrCode className="w-20 h-20 text-zinc-900" />
              <span className="text-[9px] font-extrabold text-zinc-600 mt-0.5">
                QRIS GPN
              </span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                QRIS Resmi Kos Omi
              </span>
              <p className="text-xs font-extrabold text-zinc-900">
                {activeMethod.accountHolder}
              </p>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Buka aplikasi <strong>BRI, BCA, BSI, Bank Nagari, SeaBank, DANA, atau ShopeePay</strong> Anda, lalu scan kode QRIS di samping{amountFormatted ? ` sebesar ${amountFormatted}` : ''}.
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
                {activeMethod.category === 'BANK' ? 'Transfer Bank' : 'E-Wallet Resmi'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block">
                  {activeMethod.category === 'BANK'
                    ? 'Nomor Rekening Tujuan'
                    : 'Nomor E-Wallet Tujuan'}
                </span>
                <span className="tabular-nums font-extrabold text-base sm:text-lg text-zinc-900 tracking-wide">
                  {activeMethod.accountNumber}
                </span>
                <span className="text-xs text-zinc-600 block font-medium">
                  a.n. <strong>{activeMethod.accountHolder}</strong>
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

        {/* Unggah Bukti Pembayaran (Sesuai Laporan Activity Diagram 2.2.2.8) */}
        <div className="pt-2 border-t border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[11px] text-zinc-600">
            <span className="font-bold text-zinc-800 block">
              Unggah Bukti Pembayaran / Struk Transfer:
            </span>
            {proofFileName ? (
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> Berkas siap: {proofFileName}
              </span>
            ) : (
              <span>Format JPG, PNG, atau PDF (Opsional saat simulasi)</span>
            )}
          </div>

          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs cursor-pointer shrink-0 transition-colors">
            <Upload size={13} className="text-[hsl(186,72%,24%)]" />
            <span>{proofFileName ? 'Ganti Bukti' : 'Pilih File Bukti'}</span>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
