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

        <main className="flex-1 md:ml-64 flex items-center justify-center p-8 min-h-[80vh]">
            <div className="glass rounded-[3rem] p-12 max-w-lg w-full text-center border-red-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <AlertTriangle size={120} className="text-red-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <AlertTriangle className="text-red-500" size={40} />
                    </div>
                    
                    <h2 className="text-4xl font-black tracking-tighter mb-4">Signal Lost</h2>
                    <p className="text-muted-foreground mb-10 text-lg font-medium leading-relaxed">
                        We encountered a storm in the Grand Line. The application hit an unexpected error, but we can try to recover.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:brightness-110 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            <RotateCcw size={20} />
                            TRY RECOVERY
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-black text-sm hover:bg-secondary/80 transition-all border border-white/5"
                        >
                            RELOAD PAGE
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
