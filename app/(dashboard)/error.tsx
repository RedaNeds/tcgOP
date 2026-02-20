'use client';


import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (

        <main className="flex-1 md:ml-64 flex items-center justify-center p-8 pb-20 md:pb-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-destructive" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    An unexpected error occurred. This might be a temporary issue.
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                    <RotateCcw size={16} />
                    Try Again
                </button>
            </div>
        </main>
    );
}
