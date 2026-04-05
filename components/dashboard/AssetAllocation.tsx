'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface AllocationData {
    name: string;
    value: number;
    color: string;
}

interface AssetAllocationProps {
    data: AllocationData[];
}

export function AssetAllocation({ data }: AssetAllocationProps) {
    if (data.length === 0) {
        return (
            <div className="h-[250px] w-full flex flex-col items-center justify-center text-center">
                <PieChartIcon size={32} className="text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Add cards to see allocation</p>
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full relative" style={{ minHeight: 250, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload as AllocationData;
                                return (
                                    <div className="bg-popover border border-border p-2 rounded text-xs shadow-xl">
                                        <span className="font-bold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ background: d.color }}></span>
                                            {d.name}
                                        </span>
                                        <span className="text-muted-foreground ml-4">
                                            {d.value}%
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
                    <span className="text-xl font-bold block">{data.length}</span>
                </div>
            </div>
        </div>
    );
}
