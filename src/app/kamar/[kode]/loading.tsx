import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function DetailKamarLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Back button */}
      <Skeleton className="h-6 w-36 rounded-lg" />

      {/* Hero Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-80 md:col-span-2 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-38 rounded-2xl" />
          <Skeleton className="h-38 rounded-2xl" />
        </div>
      </div>

      {/* Content & Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
