import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    description: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = 'Something went wrong',
    description,
    onRetry,
    className = ''
}: ErrorStateProps) {
    return (
        <div className={`rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center ${className}`}>
            <div className="mb-4 flex justify-center text-red-400">
                <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            {onRetry ? (
                <div className="mt-6">
                    <button
                        onClick={onRetry}
                        className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                    >
                        Retry
                    </button>
                </div>
            ) : null}
        </div>
    );
}
