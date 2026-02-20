

function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export default function CardsLoading() {
    return (
        <main className="flex-1 md:ml-64 p-8 pb-20 md:pb-8">
            <div className="mb-8">
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="flex gap-3 mb-6">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(18)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <Skeleton className="aspect-[5/7] w-full" />
                        <div className="p-3">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-3 w-16 mb-2" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
