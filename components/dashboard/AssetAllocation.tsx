'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationData {
    name: string;
    value: number;
    color: string;
}

interface AssetAllocationProps {
    data: AllocationData[];
}

export function AssetAllocation({ data }: AssetAllocationProps) {
    // Mock data if empty
    const chartData = data.length > 0 ? data : [
        { name: 'Romance Dawn', value: 40, color: '#eab308' },
        { name: 'Paramount War', value: 30, color: '#f97316' },
        { name: 'Pillars of Strength', value: 20, color: '#ef4444' },
        { name: 'Kingdoms of Intrigue', value: 10, color: '#a855f7' },
    ];

    return (
        <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as AllocationData;
                                return (
                                    <div className="bg-popover border border-border p-2 rounded text-xs shadow-xl">
                                        <span className="font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ background: data.color }}></span>
                                            {data.name}
                                        </span>
                                        <span className="text-muted-foreground ml-4">
                                            {data.value}%
                                        </span>
                                    </div>
                                )
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <span className="text-xs text-muted-foreground block">Assets</span>
                    <span className="text-xl font-bold block">{chartData.length}</span>
                </div>
            </div>
        </div>
    );
}
