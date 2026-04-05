'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function PortfolioSkeleton() {
    return (
        <div className="flex-1 md:ml-64 p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-9 w-24 rounded-xl flex-shrink-0" />
                ))}
            </div>

            {/* Controls Skeleton */}
            <div className="flex flex-col md:flex-row gap-4 py-4 border-b border-border/50">
                <div className="flex-1 relative">
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-12 w-20 rounded-xl" />
                    <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="glass rounded-3xl border border-white/5 p-4 h-48 space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="w-20 h-28 rounded-lg" />
                            <div className="flex-1 space-y-2 pt-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                                <div className="mt-4 space-y-1">
                                    <Skeleton className="h-2 w-full" />
                                    <Skeleton className="h-2 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
