'use client';

import { ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PortfolioSummaryProps {
    totalValue: number;
    pnlValue: number;
    pnlPercent: number;
}

export function PortfolioSummary({ totalValue, pnlValue, pnlPercent }: PortfolioSummaryProps) {
    const [hidden, setHidden] = useState(false);
    const isPositive = pnlValue >= 0;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <span>Net Wealth</span>
                <button onClick={() => setHidden(!hidden)} className="hover:text-primary transition-colors">
                    {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            <div className="flex items-baseline gap-4">
                <h2 className={cn("text-4xl font-bold tracking-tight transition-all", hidden && "blur-md select-none")}>
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>

                <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>
                        {isPositive ? '+' : ''}{pnlValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="opacity-70">
                        ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
