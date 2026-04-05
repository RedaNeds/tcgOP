'use client';


import { PerformanceData } from '@/lib/actions/performance';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, LineChart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/toast';

interface PerformanceClientProps {
    initialData: PerformanceData;
}

export function PerformanceClient({ initialData }: PerformanceClientProps) {
    const { chartData, topMovers, totalValue, totalPnL, pnlPercent } = initialData;
    const router = useRouter();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    const syncPrices = async () => {
        setSyncError(null);
        setIsSyncing(true);
        try {
            const res = await fetch('/api/cron/update-prices');
            const payload = await res.json().catch(() => null) as {
                success?: boolean;
                updated?: number;
                skipped?: number;
                errors?: number;
                requestDurationMs?: number;
            } | null;

            if (!res.ok || !payload?.success) {
                setSyncError('Price sync failed. Please try again in a few moments.');
                return;
            }

            const took = payload.requestDurationMs ? ` in ${(payload.requestDurationMs / 1000).toFixed(1)}s` : '';
            toast(
                `Prices synced: ${payload.updated ?? 0} updated, ${payload.skipped ?? 0} unchanged, ${payload.errors ?? 0} errors${took}`,
                'success'
            );
            router.refresh();
        } catch {
            setSyncError('Unable to reach price service. Check your connection and retry.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Performance</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Track your collection value and market trends.
                    </p>
                </div>
                <button
                    onClick={syncPrices}
                    disabled={isSyncing}
                    className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSyncing ? 'Syncing...' : 'Sync Prices'}
                </button>
            </header>

            {syncError ? (
                <ErrorState
                    title="Price sync error"
                    description={syncError}
                    onRetry={syncPrices}
                    className="mb-8"
                />
            ) : null}

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium">Net Worth</p>
                    <p className="text-3xl font-bold mt-2">${totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium">Total P&L</p>
                    <div className="flex items-end gap-3 mt-2">
                        <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toFixed(2)}
                        </p>
                        <span className={`text-sm font-medium mb-1 ${pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Evolution</h2>
                    {/* Time range selector (future) */}
                    <div className="flex gap-2 text-xs font-medium bg-secondary/30 p-1 rounded-lg">
                        <button className="px-3 py-1 rounded-md bg-background shadow-sm text-foreground">30D</button>
                        <button className="px-3 py-1 rounded-md text-muted-foreground opacity-50 cursor-not-allowed">90D</button>
                        <button className="px-3 py-1 rounded-md text-muted-foreground opacity-50 cursor-not-allowed">1Y</button>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                title="No performance history yet"
                                description="As soon as your portfolio has tracked data points, your value and cost evolution will appear here."
                                icon={<LineChart className="text-muted-foreground" size={24} />}
                                className="w-full max-w-xl"
                            />
                        </div>
                    ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickFormatter={(val) => `$${val}`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
                                labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                            />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                name="Cost Basis"
                                stroke="#64748b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="url(#colorCost)"
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name="Portfolio Value"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gainers / Losers (Just top movers for now) */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border/50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="text-blue-500" size={20} />
                            Top Movers (24h)
                        </h2>
                    </div>
                    <div className="divide-y divide-border/50">
                        {topMovers.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No significant price movements yet.</div>
                        ) : (
                            topMovers.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-14 bg-muted rounded overflow-hidden relative flex-shrink-0 border border-border/50">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <Link href={`/cards/${item.id}`} className="font-medium text-sm text-foreground hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">{item.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">${item.price.toFixed(2)}</p>
                                        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(item.changePercent).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Placeholder for future "Worst Performers" or other stats */}
                <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 flex flex-col items-center justify-center text-center opacity-70">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                        <TrendingDown size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">More Insights Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                        Track your biggest losers, set alerts, and analyze concentration risk in the next update.
                    </p>
                </div>
            </div>
        </main>
    );
}
