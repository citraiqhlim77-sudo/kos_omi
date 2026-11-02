import React from 'react';
import { Skeleton, RoomCardSkeleton } from '@/components/ui/Skeleton';

export default function KamarLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="h-10 w-80 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
        <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
      </div>

      {/* 67 Room Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <RoomCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
