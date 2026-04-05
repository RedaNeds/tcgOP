'use client';

import dynamic from 'next/dynamic';
import { motion, type Variants } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PortfolioHistoryData } from '@/lib/actions/history';

const PriceChart = dynamic(() => import('@/components/dashboard/PriceChart').then((mod) => mod.PriceChart), {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
});

const AssetAllocation = dynamic(() => import('@/components/dashboard/AssetAllocation').then((mod) => mod.AssetAllocation), {
    ssr: false,
    loading: () => <Skeleton className="h-[350px] w-full" />,
});

interface AllocationEntry {
    name: string;
    value: number;
    color: string;
}

interface DashboardPerformanceSectionProps {
    historyData: PortfolioHistoryData[];
    allocationData: AllocationEntry[];
    itemVariants: Variants;
}

export function DashboardPerformanceSection({
    historyData,
    allocationData,
    itemVariants,
}: DashboardPerformanceSectionProps) {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h3 className="font-black text-2xl tracking-tighter">Performance Pulse</h3>
                        <p className="text-muted-foreground text-xs font-bold">Portfolio value over time</p>
                    </div>
                </div>
                <div className="relative z-10 h-[350px]">
                    <PriceChart data={historyData} />
                </div>
            </div>

            <div className="glass rounded-[2.5rem] p-10 border-white/5">
                <h3 className="font-black text-2xl tracking-tighter mb-8">Asset Gravity</h3>
                <AssetAllocation data={allocationData} />
                <div className="mt-8 space-y-4">
                    {allocationData.map((entry) => (
                        <div key={entry.name} className="flex justify-between items-center group/leg">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs font-bold text-muted-foreground group-hover/leg:text-foreground transition-colors">{entry.name}</span>
                            </div>
                            <span className="text-xs font-black">{entry.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
