'use client';

import React,{ useState } from 'react';
import {
type SocialAnnouncement,
submitPenghuniSocialDonationAction,
} from '@/actions/rent-schedule';
import { HeartHandshake,X,CheckCircle2,Copy,Check } from 'lucide-react';

interface SocialDonationBannerProps {
  announcements: SocialAnnouncement[];
}

export const SocialDonationBanner: React.FC<SocialDonationBannerProps> = ({
  announcements,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<SocialAnnouncement | null>(null);
  const [amount, setAmount] = useState('10000');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const visible = announcements.filter((a) => !dismissedIds.includes(a.id));
  if (visible.length === 0 && !feedback) return null;

  const handleCopyBri = () => {
    navigator.clipboard?.writeText('763701006296502');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    setError(null);
    setIsSubmitting(true);
    const res = await submitPenghuniSocialDonationAction({
      title: activeModal.title,
      amount: Number(amount.replace(/[^0-9]/g, '')),
      method: 'TRANSFER',
      notes,
    });
    setIsSubmitting(false);
    if (res.success) {
      setFeedback(res.message);
      setDismissedIds((prev) => [...prev, activeModal.id]);
      setActiveModal(null);
      setAmount('10000');
      setNotes('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="space-y-3">
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {visible.map((ann) => (
        <div
          key={ann.id}
          className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(186,72%,24%)] text-white flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[hsl(186,72%,24%)] border border-teal-200">
                  Pengumuman Duka Cita · Sukarela
                </span>
              </div>
              <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                {ann.title}
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed max-w-2xl">
                {ann.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setActiveModal(ann);
              }}
              className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Ikut Berdonasi
            </button>
            <button
              type="button"
              onClick={() => setDismissedIds((prev) => [...prev, ann.id])}
              className="px-3.5 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Abaikan
            </button>
          </div>
        </div>
      ))}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                  Iuran Duka Cita Sukarela
                </h3>
                <p className="text-[11px] text-zinc-500">{activeModal.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Transfer Bank BRI</span>
                <strong className="text-sm font-extrabold text-zinc-900 tabular-nums">
                  763701006296502
                </strong>
                <span className="block text-[11px] text-zinc-600">a.n. YULASTRI</span>
              </div>
              <button
                type="button"
                onClick={handleCopyBri}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <form onSubmit={handleDonate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                  Nominal Sumbangan Seikhlasnya
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {['2000', '5000', '10000', '20000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        amount === preset
                          ? 'bg-[hsl(186,72%,24%)] text-white border-[hsl(186,72%,24%)]'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      Rp {Number(preset).toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1000}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-bold tabular-nums"
                  placeholder="Masukkan nominal seikhlasnya"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-800 block mb-1">
                  Ucapan / Catatan Singkat
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Turut berduka cita..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Konfirmasi Sudah Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
