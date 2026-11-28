'use client';

import React,{ useEffect,useRef,useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell,X } from 'lucide-react';

interface LiveNotifItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

export const LiveNotifBell: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<LiveNotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const [seenFingerprint, setSeenFingerprint] = useState<string>('');
  const [latestToast, setLatestToast] = useState<LiveNotifItem | null>(null);
  const lastFpRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/notifications/live', { cache: 'no-store' });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          count: number;
          fingerprint: string;
          userRole?: string;
          items: LiveNotifItem[];
        };
        if (!active) return;

        // Jika akun Calon Penghuni baru saja di-Check-in oleh Pengelola -> arahkan otomatis ke Portal Penghuni Aktif!
        if (
          data.userRole === 'PENGHUNI' &&
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/calon')
        ) {
          window.location.href = '/penghuni/dashboard';
          return;
        }

        setItems(Array.isArray(data.items) ? data.items : []);

        if (lastFpRef.current !== null && data.fingerprint !== lastFpRef.current) {
          // Ada pembaruan baru dari role lain — refresh halaman otomatis & tampilkan pesan singkat
          if (data.items && data.items.length > 0) {
            setLatestToast(data.items[0]);
            setTimeout(() => {
              if (active) setLatestToast(null);
            }, 6000);
          }
          router.refresh();
        }
        lastFpRef.current = data.fingerprint;
      } catch {
        // Abaikan jika offline sesaat
      }
    };

    poll();
    const timer = setInterval(poll, 10000);
    const onFocus = () => poll();
    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  const currentFp = items.map((i) => `${i.id}:${i.createdAt}`).join('|');
  const hasUnread = items.length > 0 && currentFp !== seenFingerprint;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setSeenFingerprint(currentFp);
        }}
        aria-label="Notifikasi"
        className="relative p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-900">
              Notifikasi Terbaru
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              Belum ada notifikasi baru.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <NextLink
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-zinc-50 transition-colors space-y-0.5"
                >
                  <p className="text-xs font-bold text-zinc-900">{item.title}</p>
                  <p className="text-[11px] text-zinc-600 leading-snug">{item.detail}</p>
                </NextLink>
              ))}
            </div>
          )}
        </div>
      )}

      {latestToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-zinc-900 text-white rounded-2xl shadow-2xl border border-zinc-700 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-xs font-extrabold">{latestToast.title}</p>
            <p className="text-[11px] text-zinc-300 leading-snug">{latestToast.detail}</p>
            <NextLink
              href={latestToast.href}
              onClick={() => setLatestToast(null)}
              className="inline-block text-[11px] font-bold text-teal-300 hover:underline pt-1"
            >
              Lihat Sekarang →
            </NextLink>
          </div>
          <button
            type="button"
            onClick={() => setLatestToast(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
