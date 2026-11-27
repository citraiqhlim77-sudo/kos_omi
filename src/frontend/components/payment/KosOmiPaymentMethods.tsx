'use client';

import React, { useState } from 'react';
import { QrCode, Building2, Copy, Check, Clock, Upload, Image as ImageIcon, X } from 'lucide-react';

export interface PaymentMethodItem {
  id: 'bri' | 'qris';
  label: string;
  shortDesc: string;
  category: 'BANK' | 'QRIS';
  accountNumber?: string;
  accountHolder: string;
  comingSoon?: boolean;
}

export const KOS_OMI_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'bri',
    label: 'Transfer Bank BRI',
    shortDesc: 'BRImo atau ATM BRI',
    category: 'BANK',
    accountNumber: '763701006296502',
    accountHolder: 'YULASTRI',
  },
  {
    id: 'qris',
    label: 'QRIS',
    shortDesc: 'Segera tersedia',
    category: 'QRIS',
    accountHolder: 'Kos Omi Sungai Bangek',
    comingSoon: true,
  },
];

interface KosOmiPaymentSelectorProps {
  selectedMethod: string;
  onSelectMethod: (methodId: string) => void;
  amountFormatted?: string;
  onValidationChange?: (isValid: boolean) => void;
  showProofUpload?: boolean;
  proofUrl?: string;
  onProofChange?: (proofDataUrl: string) => void;
}

export const KosOmiPaymentSelector: React.FC<KosOmiPaymentSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amountFormatted = 'Rp 5.000.000',
  showProofUpload = false,
  proofUrl = '',
  onProofChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localProof, setLocalProof] = useState<string>(proofUrl);

  const displayedProof = proofUrl || localProof;

  const activeMethod =
    KOS_OMI_PAYMENT_METHODS.find(
      (m) => !m.comingSoon && m.id.toLowerCase() === selectedMethod.toLowerCase()
    ) || KOS_OMI_PAYMENT_METHODS[0];

  const handleCopy = (text: string, id: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    navigator.clipboard?.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProofFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 900;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        const compressed = ctx
          ? (ctx.drawImage(img, 0, 0, canvas.width, canvas.height),
            canvas.toDataURL('image/jpeg', 0.78))
          : dataUrl;
        setLocalProof(compressed);
        onProofChange?.(compressed);
      };
      img.onerror = () => {
        setLocalProof(dataUrl);
        onProofChange?.(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleClearProof = () => {
    setLocalProof('');
    onProofChange?.('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-zinc-700 block">
          Metode Pembayaran
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {KOS_OMI_PAYMENT_METHODS.map((m) => {
            const isSelected = activeMethod.id === m.id && !m.comingSoon;
            const Icon = m.category === 'QRIS' ? QrCode : Building2;

            return (
              <button
                key={m.id}
                type="button"
                disabled={m.comingSoon}
                onClick={() => {
                  if (!m.comingSoon) onSelectMethod(m.id);
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                  m.comingSoon
                    ? 'border-zinc-200 bg-zinc-50/70 opacity-65 cursor-not-allowed'
                    : isSelected
                    ? 'border-[hsl(186,72%,24%)] bg-teal-50/60 ring-2 ring-[hsl(186,72%,24%)]/20 cursor-pointer'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[hsl(186,72%,24%)] text-white'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    <Icon size={17} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-zinc-900 block">
                      {m.label}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {m.shortDesc}
                    </span>
                  </div>
                </div>

                {m.comingSoon ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-600 shrink-0">
                    Segera Hadir
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Rekening BRI */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-700">
            Rekening Tujuan {activeMethod.label}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Bank BRI
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-zinc-200 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-zinc-500 block">
              Nomor Rekening BRI
            </span>
            <span className="tabular-nums font-extrabold text-base sm:text-lg text-zinc-900 tracking-wide">
              {activeMethod.accountNumber}
            </span>
            <span className="text-xs text-zinc-600 block mt-0.5">
              a.n. <strong>{activeMethod.accountHolder}</strong> · Nominal{' '}
              <strong>{amountFormatted}</strong>
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
                  <span>Salin</span>
                </>
              )}
            </button>
          )}
        </div>

        {showProofUpload && (
          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[hsl(186,72%,24%)]" />
                <span>Unggah Bukti Screenshot Transfer BRI</span>
              </span>
              {displayedProof && (
                <button
                  type="button"
                  onClick={handleClearProof}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <X size={12} />
                  <span>Ganti</span>
                </button>
              )}
            </div>

            {displayedProof ? (
              <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-zinc-100 max-h-52 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayedProof}
                  alt="Pratinjau Bukti Transfer Bank BRI"
                  className="max-h-52 w-auto object-contain"
                />
                <span className="absolute bottom-2 left-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Bukti transfer siap dikirim ke Pengelola
                </span>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-zinc-300 hover:border-[hsl(186,72%,24%)] rounded-xl p-4 text-center cursor-pointer transition-colors">
                <Upload size={18} className="text-zinc-400" />
                <span className="text-xs font-bold text-[hsl(186,72%,24%)]">
                  Pilih Screenshot / Foto Struk Transfer
                </span>
                <span className="text-[11px] text-zinc-500">
                  Format JPG atau PNG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofFile}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
          <Clock size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Transfer sesuai nominal tagihan, unggah bukti transfer, lalu klik konfirmasi agar Pengelola memverifikasi pembayaran Anda.
          </p>
        </div>
      </div>
    </div>
  );
};
