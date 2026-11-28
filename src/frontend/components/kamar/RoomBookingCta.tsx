'use client';

import React,{ useState,useEffect } from 'react';
import NextLink from 'next/link';
import { getClientSession } from '@/lib/auth-client';
import { ArrowRight,Lock,UserPlus,LogIn } from 'lucide-react';

interface RoomBookingCtaProps {
  roomCode: string;
  isLoggedInServer?: boolean;
  isOpenSlot?: boolean;
}

export const RoomBookingCta: React.FC<RoomBookingCtaProps> = ({
  roomCode,
  isLoggedInServer = false,
  isOpenSlot = false,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isLoggedInServer);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const clientUser = getClientSession();
    if (clientUser || isLoggedInServer) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setMounted(true);
  }, [isLoggedInServer]);

  const redirectTarget = encodeURIComponent(`/reservasi/${roomCode}`);

  if (mounted && !isLoggedIn) {
    return (
      <div className="space-y-2.5">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <Lock size={13} className="text-amber-700 shrink-0" />
            <span>Wajib Daftar / Masuk Akun Dulu</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Sebelum memesan kamar, silakan daftar akun Calon Penghuni atau masuk terlebih dahulu.
          </p>
        </div>

        <NextLink
          href={`/daftar?redirect=${redirectTarget}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg transition-all active:scale-[0.99]"
        >
          <UserPlus size={16} />
          Daftar Akun & Pesan Kamar Ini
        </NextLink>

        <NextLink
          href={`/login?redirect=${redirectTarget}`}
          className="w-full inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
        >
          <LogIn size={14} />
          Sudah Punya Akun? Masuk untuk Pesan
        </NextLink>
      </div>
    );
  }

  return (
    <>
      <NextLink
        href={`/reservasi/${roomCode}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] text-white font-bold text-sm px-4 py-3.5 rounded-lg transition-all active:scale-[0.99]"
      >
        {isOpenSlot ? 'Pesan 1 Slot Teman Sekamar (Rp 2.500.000)' : 'Reservasi Kamar Ini'}
        <ArrowRight size={16} />
      </NextLink>
      <p className="text-[11px] text-center text-zinc-500">
        Pembayaran via Transfer Bank BRI
      </p>
    </>
  );
};
