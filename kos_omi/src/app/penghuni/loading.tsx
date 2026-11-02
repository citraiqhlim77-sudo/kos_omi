import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function PenghuniLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-8 w-56 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="md:col-span-2 h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>

      <TableSkeleton rows={4} />
    </div>
  );
}
