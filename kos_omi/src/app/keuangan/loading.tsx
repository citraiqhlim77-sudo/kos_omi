import React from 'react';
import { Skeleton, DashboardKpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function KeuanganLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-8 w-60 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <DashboardKpiSkeleton />

      {/* Chart Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      <TableSkeleton rows={5} />
    </div>
  );
}
