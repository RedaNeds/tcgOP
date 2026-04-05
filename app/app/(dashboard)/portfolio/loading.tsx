'use client';



function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export default function PortfolioLoading() {
    return (
        <main className="flex-1 md:ml-64 p-8 pb-20 md:pb-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </header>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <Skeleton className="h-10 w-full md:w-96" />
                <div className="flex gap-2 w-full md:w-auto">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border text-xs flex justify-between bg-muted/30">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="divide-y divide-border/50">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <Skeleton className="w-10 h-14 rounded flex-shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
