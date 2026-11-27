import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { ensurePostgresHydrated } from '@/server/persistence';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface LiveNotificationItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ count: 0, fingerprint: 'anon', items: [] });
    }

    const store = await ensurePostgresHydrated();
    const items: LiveNotificationItem[] = [];
    const role = user.role;
    const emailNorm = (user.email || '').toLowerCase().trim();

    if (role === 'PENGELOLA' || role === 'ADMIN') {
      for (const rsv of store.reservations) {
        const pay = store.payments.find((p) => p.reservationCode === rsv.code);
        if (rsv.status === 'PENDING_REVIEW') {
          items.push({
            id: `rsv-pending-${rsv.code}`,
            title: `Reservasi Baru · Kamar ${rsv.roomCode}`,
            detail: `${rsv.userName} menunggu verifikasi pengelola`,
            href: `/pengelola/reservasi/${rsv.code}`,
            createdAt: rsv.updatedAt || rsv.createdAt,
          });
        } else if (rsv.status === 'APPROVED' && pay?.status === 'PENDING') {
          items.push({
            id: `pay-pending-${pay.invoiceCode}`,
            title: `Bukti Transfer BRI · Kamar ${rsv.roomCode}`,
            detail: `${rsv.userName} menunggu validasi pembayaran`,
            href: `/pengelola/reservasi/${rsv.code}`,
            createdAt: rsv.updatedAt || pay.createdAt,
          });
        } else if (rsv.status === 'PAID') {
          items.push({
            id: `rsv-paid-${rsv.code}`,
            title: `Siap Check-in · Kamar ${rsv.roomCode}`,
            detail: `Pembayaran ${rsv.userName} sudah lunas`,
            href: '/pengelola/checkin',
            createdAt: rsv.updatedAt || rsv.createdAt,
          });
        }
      }
    }

    if (role === 'CALON_PENGHUNI') {
      const myRsvs = store.reservations.filter(
        (r) => r.userEmail.toLowerCase().trim() === emailNorm
      );
      for (const rsv of myRsvs) {
        const pay = store.payments.find((p) => p.reservationCode === rsv.code);
        if (rsv.status === 'APPROVED' && pay?.status === 'UNPAID') {
          items.push({
            id: `calon-approved-${rsv.code}`,
            title: `Reservasi Kamar ${rsv.roomCode} Disetujui`,
            detail: 'Silakan transfer ke Bank BRI dan unggah bukti transfer',
            href: '/calon/dashboard',
            createdAt: rsv.updatedAt || rsv.createdAt,
          });
        } else if (rsv.status === 'PAID') {
          items.push({
            id: `calon-paid-${rsv.code}`,
            title: `Pembayaran Kamar ${rsv.roomCode} Divalidasi Lunas`,
            detail: 'Pembayaran Anda telah diverifikasi. Siap Check-in!',
            href: '/calon/dashboard',
            createdAt: rsv.updatedAt || rsv.createdAt,
          });
        } else if (rsv.status === 'REJECTED') {
          items.push({
            id: `calon-rejected-${rsv.code}`,
            title: `Reservasi Kamar ${rsv.roomCode} Ditolak`,
            detail: rsv.rejectionReason || 'Silakan cek detail alasan pada portal',
            href: '/calon/dashboard',
            createdAt: rsv.updatedAt || rsv.createdAt,
          });
        }
      }
    }

    if (role === 'KEUANGAN') {
      for (const pay of store.payments) {
        if (pay.status === 'PENDING') {
          items.push({
            id: `keu-pay-${pay.invoiceCode}`,
            title: `Konfirmasi Transfer · Kamar ${pay.roomCode}`,
            detail: `Invoice ${pay.invoiceCode} menunggu validasi`,
            href: '/keuangan/transaksi',
            createdAt: pay.createdAt,
          });
        }
      }
      for (const log of store.notificationLogs.slice(0, 5)) {
        if (log.template.startsWith('pengajuan_tempo_')) {
          items.push({
            id: `keu-ext-${log.id}`,
            title: 'Pengajuan Perpanjangan Tempo',
            detail: log.recipientName || log.template,
            href: '/keuangan/tagihan',
            createdAt: log.createdAt,
          });
        }
      }
    }

    if (role === 'PENGHUNI') {
      const myTenancy = store.tenancies.find(
        (t) => t.userEmail.toLowerCase().trim() === emailNorm && t.status === 'AKTIF'
      );
      const roomCode = myTenancy?.roomCode;
      if (roomCode) {
        for (const log of store.notificationLogs.slice(0, 15)) {
          if (
            log.template.includes(`kamar_${roomCode}`) ||
            (log.recipientName && log.recipientName.includes(`Kamar ${roomCode}`))
          ) {
            items.push({
              id: `penghuni-ntf-${log.id}`,
              title: log.template.includes('peringatan_final')
                ? `Peringatan Final · Kamar ${roomCode}`
                : `Pengingat Tagihan · Kamar ${roomCode}`,
              detail: 'Buka halaman Tagihan Sewa untuk melihat jadwal kamar Anda',
              href: '/penghuni/tagihan',
              createdAt: log.createdAt,
            });
          }
        }
      }
    }

    if (role === 'ADMIN') {
      for (const log of store.notificationLogs.slice(0, 8)) {
        if (log.template.includes('reset_password') || log.template.includes('lupa_password')) {
          items.push({
            id: `adm-reset-${log.id}`,
            title: 'Permintaan Reset Sandi',
            detail: `${log.recipientName || log.recipient}`,
            href: '/admin/pengguna',
            createdAt: log.createdAt,
          });
        }
      }
    }

    const sorted = items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    const fingerprint = sorted.map((i) => `${i.id}:${i.createdAt}`).join('|') || 'empty';

    return NextResponse.json({
      count: sorted.length,
      fingerprint,
      items: sorted,
    });
  } catch {
    return NextResponse.json({ count: 0, fingerprint: 'err', items: [] });
  }
}
