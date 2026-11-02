'use client';

import React, { useState } from 'react';
import { MonthlyTrendData } from '@/types/finance';
import { formatRupiah } from '@/data/rooms';

interface FinancialTrendChartProps {
  data: MonthlyTrendData[];
}

export const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({ data }) => {
  const [activePoint, setActivePoint] = useState<MonthlyTrendData | null>(data[data.length - 1] || null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxIncome = 90000000; // Skala maksimal Rp 90 Juta
  const chartHeight = 240;

  // Generate path untuk line kurva total
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = chartHeight - (d.totalIncome / maxIncome) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.map((p, i) => {
    const [x, y] = p.split(',');
    return `${i === 0 ? 'M' : 'L'} ${x}% ${y}`;
  }).join(' ')}`;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <h2 className="text-base font-heading font-extrabold text-slate-900">
              Tren Pemasukan Finansial 12 Bulan Terakhir
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik agregasi pendapatan sewa bulanan dan deposit booking resmi Kos Omi
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[hsl(217,91%,45%)]" />
            <span className="text-slate-600 font-medium">Sewa Kamar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-sky-400" />
            <span className="text-slate-600 font-medium">Booking / Deposit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Garis Tren Total</span>
          </div>
        </div>
      </div>

      {/* Active Month Highlight Box */}
      {activePoint && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Bulan Terpilih:</span>
            <span className="font-heading font-extrabold text-slate-900 text-sm">{activePoint.label} ({activePoint.month})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Total Pendapatan:</span>
            <span className="font-heading font-extrabold text-[hsl(217,91%,45%)] text-sm tabular-nums">
              {formatRupiah(activePoint.totalIncome)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Sewa Bulanan:</span>
            <span className="font-bold text-slate-800 text-sm tabular-nums">
              {formatRupiah(activePoint.rentIncome)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Transaksi Lunas:</span>
            <span className="font-bold text-emerald-700 text-sm tabular-nums">
              {activePoint.transactionCount} Transaksi
            </span>
          </div>
        </div>
      )}

      {/* Visual Chart Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Y Axis Guide Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>Rp 80 Jt</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>Rp 60 Jt</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>Rp 40 Jt</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-0.5">
            <span>Rp 20 Jt</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
            <span>Rp 0</span>
          </div>
        </div>

        {/* Bars and Columns */}
        <div className="relative h-60 flex items-end justify-between gap-1 sm:gap-2 px-10 z-10">
          {data.map((item, idx) => {
            const totalPct = (item.totalIncome / maxIncome) * 100;
            const rentPct = (item.rentIncome / maxIncome) * 100;
            const bookingPct = (item.bookingIncome / maxIncome) * 100;
            const isHovered = hoverIndex === idx || activePoint?.month === item.month;

            return (
              <div
                key={item.month}
                onMouseEnter={() => {
                  setActivePoint(item);
                  setHoverIndex(idx);
                }}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Bar Stack */}
                <div
                  className={`w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-150 ${
                    isHovered ? 'ring-2 ring-[hsl(217,91%,45%)]/40 scale-y-[1.02]' : 'opacity-90'
                  }`}
                  style={{ height: `${totalPct}%` }}
                >
                  {/* Rent Bar */}
                  <div
                    style={{ height: `${(item.rentIncome / item.totalIncome) * 100}%` }}
                    className="w-full bg-[hsl(217,91%,45%)] transition-colors group-hover:bg-[hsl(217,91%,40%)]"
                  />
                  {/* Booking Bar */}
                  <div
                    style={{ height: `${(item.bookingIncome / item.totalIncome) * 100}%` }}
                    className="w-full bg-sky-400 transition-colors group-hover:bg-sky-500"
                  />
                </div>

                {/* X Axis Label */}
                <span
                  className={`text-[10px] mt-2 whitespace-nowrap font-medium transition-colors ${
                    isHovered ? 'text-[hsl(217,91%,45%)] font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
