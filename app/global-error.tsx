'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    void error;
    return (
        <html>
            <body className="bg-background text-foreground">
                <div className="min-h-screen flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            A critical error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={reset}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            <RotateCcw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
