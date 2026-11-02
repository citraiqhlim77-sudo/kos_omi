import React from 'react';
import { Skeleton, DashboardKpiSkeleton } from '@/components/ui/Skeleton';

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      <DashboardKpiSkeleton />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
