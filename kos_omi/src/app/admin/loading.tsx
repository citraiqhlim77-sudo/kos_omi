import React from 'react';
import { Skeleton, DashboardKpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-8 w-64 rounded-xl" />
      </div>

      <DashboardKpiSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={4} />
        <TableSkeleton rows={4} />
      </div>
    </div>
  );
}
