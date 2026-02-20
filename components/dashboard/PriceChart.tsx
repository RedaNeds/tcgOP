'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

interface PriceChartProps {
    data: { date: string; value: number }[];
    color?: string;
}

export function PriceChart({ data, color = "#22c55e" }: PriceChartProps) {
    // If no data, show empty state or skeleton?
    // For now we assume data is passed.

    if (!data || data.length === 0) {
        return <div className="h-[350px] w-full bg-secondary/10 animate-pulse rounded-xl" />;
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#525252', fontSize: 12 }}
                        tickFormatter={(str) => format(new Date(str), 'MMM d')}
                        minTickGap={30}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                                        <p className="text-muted-foreground text-xs mb-1">{label ? format(new Date(label as string), 'PPP') : ''}</p>
                                        <p className="text-primary font-bold text-lg">
                                            ${(payload[0].value as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
