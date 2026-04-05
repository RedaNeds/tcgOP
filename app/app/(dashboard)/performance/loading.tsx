'use client';



function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export default function PerformanceLoading() {
    return (
        <main className="flex-1 md:ml-64 p-8 pb-20 md:pb-8">
            <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/50 p-6">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-card rounded-xl border border-border/50 p-6 mb-8">
                <Skeleton className="h-5 w-36 mb-4" />
                <Skeleton className="h-[250px] w-full" />
            </div>

            {/* Asset Grid */}
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/50 p-3">
                        <Skeleton className="aspect-[5/7] w-full mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ))}
            </div>
        </main>
    );
}
