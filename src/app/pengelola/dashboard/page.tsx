import React from 'react';
import { Metadata } from 'next';
import NextLink from 'next/link';
import { fetchRoomStatsAction, fetchRoomsAction } from '@/actions/rooms';
import { fetchAllReservationsAction } from '@/actions/reservations';
import {
  fetchCheckinCandidatesAction,
  fetchRegisteredCalonAccountsAction,
} from '@/actions/tenancy';
import { getOccupancyAnalytics } from '@/lib/reports/revenue';
import { PengelolaNav } from '@/components/pengelola/PengelolaNav';
import {
  BedDouble,
  Users,
  CalendarCheck,
  LogIn,
  LogOut,
  Wrench,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { ROOM_STATUS_LABELS, ROOM_TYPE_LABELS } from '@/types/room';
import { formatRupiah } from '@/data/rooms';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dasbor Operasional Pengelola | Kos Omi',
  description:
    'Ringkasan harian 67 kamar Kos Omi, status ketersediaan real-time, reservasi menunggu verifikasi, dan jadwal check-in.',
};

export default async function PengelolaDashboardPage() {
  const [stats, rooms, reservations, checkinRes, calonRes] = await Promise.all([
    fetchRoomStatsAction(),
    fetchRoomsAction(),
    fetchAllReservationsAction(),
    fetchCheckinCandidatesAction(),
    fetchRegisteredCalonAccountsAction(),
  ]);

  const registeredCalonCount = calonRes.accounts.length;
  const unbookedCalonCount = calonRes.accounts.filter(
    (a) => a.reservationStatus === 'BELUM_RESERVASI'
  ).length;

  const pendingReservationsCount = reservations.filter(
    (r) => r.status === 'PENDING_REVIEW'
  ).length;
  const waitingPaymentValidationCount = reservations.filter(
    (r) => r.status === 'APPROVED' && r.payment?.status === 'PENDING'
  ).length;
  const readyCheckinCount = checkinRes.candidates.filter(
    (c) => c.status === 'LUNAS'
  ).length;

  const occupancyRate = Math.round((stats.occupied / stats.total) * 100);
  const occupancyAnalytics = getOccupancyAnalytics();

  // Group rooms by floor (Lantai 1 & Lantai 2)
  const floorSummary = [1, 2].map((fl) => {
    const floorRooms = rooms.filter((r) => r.floor === fl);
    return {
      floor: fl,
      total: floorRooms.length,
      available: floorRooms.filter((r) => r.status === 'TERSEDIA').length,
      booked: floorRooms.filter((r) => r.status === 'DIPESAN').length,
      occupied: floorRooms.filter((r) => r.status === 'TERISI').length,
      maintenance: floorRooms.filter((r) => r.status === 'NONAKTIF').length,
    };
  });

  return (
    <div className="bg-zinc-50 min-h-screen">
      <PengelolaNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Pusat Operasional
              </span>
              <span className="text-xs text-zinc-500 font-medium">Kos Omi Sungai Bangek, Padang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 tracking-tight">
              Dasbor Pengelola Kos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Pantau tingkat keterisian 67 kamar, verifikasi pengajuan reservasi masuk, serta kelola check-in & check-out harian.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <NextLink
              href="/pengelola/penghuni?tab=calon"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>
                Calon Terdaftar ({registeredCalonCount}
                {unbookedCalonCount > 0 ? ` · ${unbookedCalonCount} Baru` : ''})
              </span>
            </NextLink>
            <NextLink
              href="/pengelola/kamar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[hsl(186,72%,24%)] hover:bg-[hsl(186,74%,18%)] transition-colors"
            >
              <BedDouble className="w-4 h-4" />
              <span>Kelola 67 Kamar</span>
            </NextLink>
          </div>
        </div>

        {/* Notifikasi Masuk Pengelola (Real-Time Alert Banner) */}
        {(pendingReservationsCount > 0 || waitingPaymentValidationCount > 0 || readyCheckinCount > 0) && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-ping" />
                    NOTIFIKASI BARU PENGELOLA
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-heading font-extrabold text-amber-950">
                  {waitingPaymentValidationCount > 0
                    ? `Ada ${waitingPaymentValidationCount} Konfirmasi Transfer / Pembayaran Masuk Menunggu Validasi Pengelola!`
                    : pendingReservationsCount > 0
                      ? `Ada ${pendingReservationsCount} Pengajuan Reservasi Kamar Baru Menunggu Persetujuan Anda!`
                      : `Ada ${readyCheckinCount} Calon Penghuni Sudah Lunas & Siap Check-In!`}
                </h2>
                <p className="text-xs text-amber-900">
                  {waitingPaymentValidationCount > 0
                    ? 'Calon penghuni telah mengirim konfirmasi transfer. Silakan cek mutasi rekening/DANA (082246424353) Anda dan klik Validasi Pembayaran Lunas di menu Reservasi.'
                    : pendingReservationsCount > 0
                      ? `Calon penghuni baru saja mengajukan reservasi (${reservations
                        .filter((r) => r.status === 'PENDING_REVIEW')
                        .map((r) => `${r.userName} - Kamar No. ${r.roomCode}`)
                        .join(', ')}). Klik tombol di samping untuk menyetujui dan menerbitkan invoice pembayaran.`
                      : 'Pembayaran reservasi telah lunas terverifikasi. Silakan proses serah terima kunci kamar (Check-In).'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(pendingReservationsCount > 0 || waitingPaymentValidationCount > 0) && (
                <NextLink
                  href="/pengelola/reservasi"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                >
                  <span>
                    {waitingPaymentValidationCount > 0
                      ? `Validasi Pembayaran Masuk (${waitingPaymentValidationCount})`
                      : `Buka & Setujui Reservasi (${pendingReservationsCount})`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              )}
              {readyCheckinCount > 0 && (
                <NextLink
                  href="/pengelola/checkin"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <span>Proses Check-In ({readyCheckinCount})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
              )}
            </div>
          </div>
        )}

        {/* Real-time Metric Cards (Bisa Diklik Langsung ke Halamannya) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kamar Terisi */}
          <NextLink
            href="/pengelola/penghuni"
            className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-blue-400 transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 group-hover:text-blue-700">
                Kamar Terisi
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
              {stats.occupied}
              <span className="text-xs text-zinc-500 font-normal ml-1">/ {stats.total} kamar</span>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold flex items-center justify-between">
              <span>Tingkat Hunian: {occupancyRate}%</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </NextLink>

          {/* Kamar Kosong / Tersedia */}
          <NextLink
            href="/pengelola/kamar"
            className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-emerald-400 transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-700">
                Kamar Kosong
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <BedDouble className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
              {stats.available}
              <span className="text-xs text-zinc-500 font-normal ml-1">siap huni</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-between">
              <span>Lihat 67 kamar</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </NextLink>

          {/* Dipesan */}
          <NextLink
            href="/pengelola/reservasi"
            className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-amber-400 transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 group-hover:text-amber-700">
                Sedang Dipesan
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
              {stats.booked}
              <span className="text-xs text-zinc-500 font-normal ml-1">kamar</span>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold flex items-center justify-between">
              <span>Buka daftar reservasi</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </NextLink>

          {/* Dalam Perawatan */}
          <NextLink
            href="/pengelola/kamar"
            className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-rose-400 transition-all space-y-2 block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 group-hover:text-rose-700">
                Perawatan (Nonaktif)
              </span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-heading font-extrabold text-zinc-900 tabular-nums">
              {stats.maintenance}
              <span className="text-xs text-zinc-500 font-normal ml-1">kamar</span>
            </div>
            <div className="text-[11px] text-rose-700 font-semibold flex items-center justify-between">
              <span>Perbaikan fasilitas & sanitasi</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </NextLink>
        </div>

        {/* Occupancy Progress Bar */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-800">Distribusi Keterisian 67 Kamar</span>
            <span className="text-zinc-600">{occupancyRate}% Terisi Penuh</span>
          </div>

          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${(stats.occupied / stats.total) * 100}%` }}
              className="bg-blue-600 h-full transition-all"
              title={`Terisi: ${stats.occupied}`}
            />
            <div
              style={{ width: `${(stats.booked / stats.total) * 100}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Dipesan: ${stats.booked}`}
            />
            <div
              style={{ width: `${(stats.available / stats.total) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Tersedia: ${stats.available}`}
            />
            <div
              style={{ width: `${(stats.maintenance / stats.total) * 100}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Perawatan: ${stats.maintenance}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Terisi: {stats.occupied}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Dipesan: {stats.booked}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Tersedia: {stats.available}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Perawatan: {stats.maintenance}</span>
            </div>
          </div>
        </div>

        {/* Operational Task Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NextLink
            href="/pengelola/reservasi"
            className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 group-hover:text-[hsl(186,72%,24%)]">
                  Verifikasi Reservasi
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingReservationsCount} Pending
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Tinjau foto KTP dan biodata calon penghuni sebelum menyetujui invoice sewa.
              </p>
            </div>
          </NextLink>

          <NextLink
            href="/pengelola/checkin"
            className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 group-hover:bg-blue-100 transition-colors">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-900 group-hover:text-[hsl(186,72%,24%)]">
                  Proses Check-in
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {readyCheckinCount} Siap
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Proses serah terima kunci untuk calon penghuni dengan invoice lunas.
              </p>
            </div>
          </NextLink>

          <NextLink
            href="/pengelola/checkout"
            className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-400 transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 group-hover:bg-zinc-200 transition-colors">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-zinc-900 group-hover:text-[hsl(186,72%,24%)]">
                Proses Check-out
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Pemeriksaan tagihan akhir, serah terima kunci, dan pengosongan kamar.
              </p>
            </div>
          </NextLink>
        </div>

        {/* Floor-by-Floor Summary Table & Analytics Comparison (Lantai 1 vs Lantai 2) */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Analitik & Ringkasan Keterisian Kamar: Lantai 1 vs Lantai 2
              </h2>
              <p className="text-xs text-zinc-500">
                Perbandingan okupansi Lantai 1 (Kamar No. 1–33) dan Lantai 2 (Kamar No. 34–67) untuk keputusan operasional
              </p>
            </div>
            <NextLink
              href="/pengelola/kamar"
              className="text-xs font-bold text-[hsl(186,72%,24%)] hover:underline inline-flex items-center gap-1"
            >
              <span>Buka Tabel 67 Kamar Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NextLink>
          </div>

          {/* Visualisasi Perbandingan Lantai 1 vs Lantai 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900">{occupancyAnalytics.floor1.label}</span>
                <span className="font-extrabold text-sky-700 tabular-nums">
                  {occupancyAnalytics.floor1.occupancyRate}% Aktif ({occupancyAnalytics.floor1.occupiedRooms + occupancyAnalytics.floor1.bookedRooms}/{occupancyAnalytics.floor1.totalRooms} Kamar)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(4, occupancyAnalytics.floor1.occupancyRate))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Terisi/Dipesan: {occupancyAnalytics.floor1.occupiedRooms + occupancyAnalytics.floor1.bookedRooms} kamar</span>
                <span className="text-emerald-700 font-semibold">Tersedia: {occupancyAnalytics.floor1.availableRooms} kamar</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900">{occupancyAnalytics.floor2.label}</span>
                <span className="font-extrabold text-indigo-700 tabular-nums">
                  {occupancyAnalytics.floor2.occupancyRate}% Aktif ({occupancyAnalytics.floor2.occupiedRooms + occupancyAnalytics.floor2.bookedRooms}/{occupancyAnalytics.floor2.totalRooms} Kamar)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(4, occupancyAnalytics.floor2.occupancyRate))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Terisi/Dipesan: {occupancyAnalytics.floor2.occupiedRooms + occupancyAnalytics.floor2.bookedRooms} kamar</span>
                <span className="text-emerald-700 font-semibold">Tersedia: {occupancyAnalytics.floor2.availableRooms} kamar</span>
              </div>
            </div>
          </div>

          {/* Rekomendasi Keputusan Operasional Pengelola */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block">Rekomendasi Keputusan Operasional:</span>
              <p className="leading-relaxed text-amber-900/90 mt-0.5">{occupancyAnalytics.recommendation}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                  <th className="py-2.5 px-3">Lantai</th>
                  <th className="py-2.5 px-3">Total Kamar</th>
                  <th className="py-2.5 px-3 text-emerald-700">Tersedia</th>
                  <th className="py-2.5 px-3 text-amber-700">Dipesan</th>
                  <th className="py-2.5 px-3 text-blue-700">Terisi</th>
                  <th className="py-2.5 px-3 text-rose-700">Perawatan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {floorSummary.map((f) => (
                  <tr key={f.floor} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-900">
                      Lantai {f.floor}
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-700">
                      {f.total} Kamar
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700 tabular-nums">
                      {f.available}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700 tabular-nums">
                      {f.booked}
                    </td>
                    <td className="py-3 px-3 font-bold text-blue-700 tabular-nums">
                      {f.occupied}
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-700 tabular-nums">
                      {f.maintenance}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <NextLink
                        href={`/pengelola/kamar`}
                        className="text-xs font-bold text-[hsl(186,72%,24%)] hover:underline"
                      >
                        Kelola
                      </NextLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
