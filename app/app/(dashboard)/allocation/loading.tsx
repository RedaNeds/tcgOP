'use client';



function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

export default function AllocationLoading() {
    return (

        <main className="flex-1 md:ml-64 p-8 pb-20 md:pb-8">
            <div className="mb-8">
                <Skeleton className="h-8 w-36 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border/50 p-6">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <Skeleton className="h-[250px] w-full" />
                    </div>
                ))}
            </div>
        </main>
    );
}
