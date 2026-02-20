'use client';


function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export default function DashboardLoading() {
    return (

        <main className="flex-1 md:ml-64 p-8 pb-20 md:pb-8">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </header>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                        <Skeleton className="h-4 w-24 mb-3" />
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-card rounded-xl border border-border/50 p-6 mb-10 shadow-sm flex gap-12">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <Skeleton className="h-6 w-36 mb-6" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                    <Skeleton className="h-6 w-32 mb-6" />
                    <Skeleton className="w-[200px] h-[200px] rounded-full mx-auto mb-8" />
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                        <Skeleton className="h-4 w-[90%]" />
                    </div>
                </div>
            </div>

            {/* Assets */}
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border border-border/50 flex gap-4 items-center">
                        <Skeleton className="w-12 h-16 rounded" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-4 w-16 mb-2" />
                            <Skeleton className="h-3 w-12 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
