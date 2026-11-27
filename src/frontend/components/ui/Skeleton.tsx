import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-200/80 ${className}`}
      {...props}
    />
  );
};

// 1. Skeleton untuk Card Kamar (Katalog 67 Kamar)
export const RoomCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
          <Skeleton className="h-4 w-32 rounded" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// 2. Skeleton untuk Tabel Data
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24 ml-auto" />
      </div>
      <div className="divide-y divide-zinc-100 p-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Skeleton untuk KPI Dasbor
export const DashboardKpiSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
};

// 4. Skeleton untuk Invoice & Detail Dokumen
export const InvoiceSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-zinc-200 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-start border-b border-zinc-100 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <Skeleton className="h-7 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-2 text-right flex flex-col items-end">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="flex justify-end pt-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
    </div>
  );
};
