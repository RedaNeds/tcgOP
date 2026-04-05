'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { useState, useTransition, useCallback } from 'react';
import { getPortfolioHistory, type HistoryRange, type PortfolioHistoryData } from '@/lib/actions/history';
import { useCurrency } from '@/lib/hooks/use-currency';

const RANGES: { label: string; value: HistoryRange }[] = [
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: 'MAX', value: 'MAX' },
];

interface PriceChartProps {
    data: PortfolioHistoryData[];
}

export function PriceChart({ data: initialData }: PriceChartProps) {
    const [selectedRange, setSelectedRange] = useState<HistoryRange>('1M');
    const [chartData, setChartData] = useState(initialData);
    const [isPending, startTransition] = useTransition();
    const { format: fmt } = useCurrency();

    const handleRangeChange = useCallback((range: HistoryRange) => {
        setSelectedRange(range);
        startTransition(async () => {
            const newData = await getPortfolioHistory(range);
            setChartData(newData);
        });
    }, []);

    const data = chartData;

    if (!data || data.length === 0) {
        return <div className="h-[350px] w-full bg-secondary/10 animate-pulse rounded-xl" />;
    }

    // Calculate period change
    const firstValue = data[0]?.value ?? 0;
    const lastValue = data[data.length - 1]?.value ?? 0;
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    const isPositive = change >= 0;
    const dynamicColor = isPositive ? '#22c55e' : '#ef4444';

    return (
        <div className="h-[400px] w-full flex flex-col">
            {/* Period Stats + Range Selector */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{fmt(change)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                </div>
                <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-white/5">
                    {RANGES.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => handleRangeChange(value)}
                            disabled={isPending}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                                selectedRange === value
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            } ${isPending ? 'opacity-50' : ''}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className={`flex-1 min-h-0 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`} style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValueDynamic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={dynamicColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={dynamicColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#525252', fontSize: 11 }}
                            tickFormatter={(str) => format(new Date(str), 'MMM d')}
                            minTickGap={40}
                        />
                        <YAxis
                            hide
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl">
                                            <p className="text-muted-foreground text-xs mb-1">{label ? format(new Date(label as string), 'PPP') : ''}</p>
                                            <p className="text-primary font-bold text-lg">
                                                {fmt(payload[0].value as number)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={dynamicColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValueDynamic)"
                            animationDuration={500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
