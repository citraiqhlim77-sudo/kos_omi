'use client';

import React from 'react';
import { OperationalDecisionAnalytics } from '@/types/finance';
import { formatRupiah } from '@/data/rooms';
import {
Lightbulb,
Layers,
ShieldCheck,
UserCheck
} from 'lucide-react';

interface OperationalDecisionAnalyticsPanelProps {
  analytics?: OperationalDecisionAnalytics;
}

export const OperationalDecisionAnalyticsPanel: React.FC<
  OperationalDecisionAnalyticsPanelProps
> = ({ analytics }) => {
  if (!analytics) return null;

  const { occupancy, collectionRate, reservationConversion } = analytics;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[hsl(186,72%,24%)] bg-[hsl(180,33%,95%)] px-2.5 py-0.5 rounded-md border border-[hsl(186,50%,82%)]">
              Decision Support System (DSS)
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-heading font-extrabold text-zinc-900 mt-1">
            Analitik Pendukung Keputusan Operasional Pengelola Kos Omi
          </h2>
          <p className="text-xs text-zinc-500">
            Indikator strategis okupansi per lantai, rasio kolektibilitas tagihan semesteran, dan konversi reservasi kamar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. OKUPANSI KAMAR & PERBANDINGAN LANTAI 1 VS LANTAI 2 */}
        <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/90 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  1. Analitik Okupansi Kamar
                </span>
                <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                  Total & Lantai 1 vs Lantai 2
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-heading font-extrabold text-[hsl(186,72%,24%)] tabular-nums">
                  {occupancy.totalOccupancyRate}%
                </span>
                <span className="text-xs text-zinc-500 ml-1.5">
                  ({occupancy.occupiedRooms + occupancy.bookedRooms}/{occupancy.totalRooms} kamar aktif)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {occupancy.availableRooms} Tersedia
              </span>
            </div>

            {/* Progress Bar Total */}
            <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className="h-full bg-[hsl(186,72%,24%)] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(4, occupancy.totalOccupancyRate))}%` }}
              />
            </div>

            {/* Perbandingan Lantai 1 vs Lantai 2 */}
            <div className="pt-2 space-y-2.5 text-xs border-t border-zinc-200/80">
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-zinc-700">
                  <span>{occupancy.floor1.label}</span>
                  <span className="tabular-nums text-zinc-900">
                    {occupancy.floor1.occupancyRate}% ({occupancy.floor1.occupiedRooms + occupancy.floor1.bookedRooms}/{occupancy.floor1.totalRooms})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(4, occupancy.floor1.occupancyRate))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-zinc-700">
                  <span>{occupancy.floor2.label}</span>
                  <span className="tabular-nums text-zinc-900">
                    {occupancy.floor2.occupancyRate}% ({occupancy.floor2.occupiedRooms + occupancy.floor2.bookedRooms}/{occupancy.floor2.totalRooms})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(4, occupancy.floor2.occupancyRate))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rekomendasi Keputusan */}
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Rekomendasi Keputusan:</span>
            </div>
            <p className="leading-relaxed text-amber-900/90">{occupancy.recommendation}</p>
          </div>
        </div>

        {/* 2. COLLECTION RATE ANALYTICS (LUNAS VS TERLAMBAT/BELUM BAYAR) */}
        <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/90 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  2. Rasio Kolektibilitas Kas
                </span>
                <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                  Collection Rate Tagihan Semester
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-heading font-extrabold text-emerald-700 tabular-nums">
                  {collectionRate.collectionRate}%
                </span>
                <span className="text-xs text-zinc-500 ml-1.5">
                  ({collectionRate.paidBillsCount}/{collectionRate.totalBillsCount} tagihan lunas)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Tunggakan: {collectionRate.delinquencyRate}%
              </span>
            </div>

            {/* Stacked Progress Bar Lunas vs Belum Bayar */}
            <div className="w-full h-2.5 rounded-full bg-amber-200 overflow-hidden flex">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, collectionRate.collectionRate))}%` }}
              />
            </div>

            {/* Breakdown Nominal */}
            <div className="pt-2 space-y-2 text-xs border-t border-zinc-200/80">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Tagihan Lunas ({collectionRate.paidBillsCount} Invoice):</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {formatRupiah(collectionRate.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">
                  Belum Bayar / Terlambat ({collectionRate.unpaidBillsCount + collectionRate.overdueBillsCount}):
                </span>
                <span className="font-bold text-amber-700 tabular-nums">
                  {formatRupiah(collectionRate.unpaidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-zinc-200/60 font-bold text-zinc-900">
                <span>Total Nilai Tagihan:</span>
                <span className="tabular-nums">{formatRupiah(collectionRate.totalBilledAmount)}</span>
              </div>
            </div>
          </div>

          {/* Rekomendasi Keputusan */}
          <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Rekomendasi Keputusan:</span>
            </div>
            <p className="leading-relaxed text-emerald-900/90">{collectionRate.recommendation}</p>
          </div>
        </div>

        {/* 3. KONVERSI RESERVASI (LUNAS/CHECKIN VS DITOLAK/KEDALUWARSA/DIBATALKAN) */}
        <div className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/90 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  3. Efektivitas Konversi Reservasi
                </span>
                <h3 className="text-sm font-heading font-extrabold text-zinc-900">
                  Lunas/Check-in vs Batal/Ditolak
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-heading font-extrabold text-indigo-700 tabular-nums">
                  {reservationConversion.conversionRate}%
                </span>
                <span className="text-xs text-zinc-500 ml-1.5">
                  ({reservationConversion.paidOrCheckinCount}/{reservationConversion.totalReservations} konversi)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Batal/Ditolak: {reservationConversion.dropOffRate}%
              </span>
            </div>

            {/* Progress Bar Konversi */}
            <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden flex">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, reservationConversion.conversionRate))}%`,
                }}
              />
            </div>

            {/* Rincian Status Reservasi */}
            <div className="pt-2 space-y-2 text-xs border-t border-zinc-200/80">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Berhasil Lunas / Check-in:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {reservationConversion.paidOrCheckinCount} Reservasi
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Menunggu Verifikasi / Bayar:</span>
                <span className="font-bold text-amber-700 tabular-nums">
                  {reservationConversion.pendingOrApprovedCount} Reservasi
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600">Ditolak / Kedaluwarsa / Batal:</span>
                <span className="font-bold text-rose-700 tabular-nums">
                  {reservationConversion.rejectedCount + reservationConversion.expiredOrCancelledCount} Reservasi
                </span>
              </div>
            </div>
          </div>

          {/* Rekomendasi Keputusan */}
          <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 text-[11px] text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Rekomendasi Keputusan:</span>
            </div>
            <p className="leading-relaxed text-indigo-900/90">
              {reservationConversion.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
