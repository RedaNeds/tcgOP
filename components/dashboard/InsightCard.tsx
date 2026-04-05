import Link from 'next/link';
import { AlertTriangle, TrendingUp, TrendingDown, Info, ArrowRight } from 'lucide-react';
import { Insight } from '@/lib/actions/performance';

interface InsightCardProps {
    insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
    const { type, title, description, actionLabel, actionUrl } = insight;

    const styles = {
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            iconColor: 'text-yellow-500',
            Icon: AlertTriangle,
        },
        success: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            iconColor: 'text-green-500',
            Icon: TrendingUp,
        },
        danger: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            iconColor: 'text-red-500',
            Icon: TrendingDown,
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            iconColor: 'text-blue-500',
            Icon: Info,
        },
    };

    const style = styles[type] || styles.info;
    const Icon = style.Icon;

    return (
        <div className={`p-4 rounded-xl border ${style.bg} ${style.border} flex gap-4 items-start transition-all hover:bg-opacity-70`}>
            <div className={`p-2 rounded-lg bg-background/50 ${style.iconColor} shrink-0`}>
                <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {description}
                </p>
                {actionLabel && actionUrl && (
                    <Link
                        href={actionUrl}
                        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline"
                    >
                        {actionLabel} <ArrowRight size={12} />
                    </Link>
                )}
            </div>
        </div>
    );
}
