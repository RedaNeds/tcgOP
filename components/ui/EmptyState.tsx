import { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`rounded-2xl border border-border/60 bg-card/40 p-8 text-center ${className}`}>
            {icon ? <div className="mb-4 flex justify-center">{icon}</div> : null}
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
        </div>
    );
}
