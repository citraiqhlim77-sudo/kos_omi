import React from 'react';
import type { RoomStatus } from '@/types/room';
import type { ReservationStatus, PaymentStatus } from '../../types/reservation';
import { CheckCircle2, Clock, UserCheck, AlertCircle, FileCheck, XCircle } from 'lucide-react';

interface BadgeProps {
  status: RoomStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md', className = '' }) => {
  const configs = {
    TERSEDIA: {
      label: 'Tersedia',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    DIPESAN: {
      label: 'Sedang Dipesan',
      icon: Clock,
      style: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    TERISI: {
      label: 'Terisi Penuh',
      icon: UserCheck,
      style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    },
    NONAKTIF: {
      label: 'Dalam Perawatan',
      icon: AlertCircle,
      style: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const current = configs[status] || configs.TERSEDIA;
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1 font-medium',
    md: 'text-xs md:text-sm px-3 py-1 gap-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 13,
    md: 15,
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border transition-colors ${current.style} ${sizeClasses[size]} ${className}`}
    >
      <IconComponent size={iconSizes[size]} className="shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};

export const ReservationStatusBadge: React.FC<{ status: ReservationStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const configs: Record<ReservationStatus, { label: string; icon: any; style: string }> = {
    PENDING_REVIEW: {
      label: 'Menunggu Verifikasi (2x24 Jam)',
      icon: Clock,
      style: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    APPROVED: {
      label: 'Disetujui - Siap Bayar (24 Jam)',
      icon: FileCheck,
      style: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    PAID: {
      label: 'Lunas - Siap Check-in',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    REJECTED: {
      label: 'Reservasi Ditolak',
      icon: XCircle,
      style: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    EXPIRED: {
      label: 'Waktu Bayar Kedaluwarsa',
      icon: AlertCircle,
      style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    },
    CANCELLED: {
      label: 'Reservasi Dibatalkan',
      icon: XCircle,
      style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    },
  };

  const item = configs[status] || configs.PENDING_REVIEW;
  const Icon = item.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${item.style} ${sizeClass}`}>
      <Icon size={size === 'sm' ? 13 : 15} className="shrink-0" />
      <span>{item.label}</span>
    </span>
  );
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const configs: Record<PaymentStatus, { label: string; icon: any; style: string }> = {
    UNPAID: {
      label: 'Menunggu Pembayaran',
      icon: Clock,
      style: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    PENDING: {
      label: 'Menunggu Konfirmasi',
      icon: Clock,
      style: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    SETTLEMENT: {
      label: 'Lunas Terverifikasi',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    EXPIRED: {
      label: 'Kedaluwarsa',
      icon: AlertCircle,
      style: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    },
    CANCELLED: {
      label: 'Dibatalkan',
      icon: XCircle,
      style: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  };

  const item = configs[status] || configs.UNPAID;
  const Icon = item.icon;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-md border ${item.style} ${sizeClass}`}>
      <Icon size={size === 'sm' ? 13 : 15} className="shrink-0" />
      <span>{item.label}</span>
    </span>
  );
};
