'use client';

import { useCurrency } from '@/lib/hooks/use-currency';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { aggregatePnL, getPnLColor, formatPnLPrefix } from '@/lib/utils/calculations';
import { useMemo } from 'react';

interface PortfolioStatsProps {
    items: { quantity: number; purchasePrice: number; currentPrice: number }[];
}

export function PortfolioStats({ items }: PortfolioStatsProps) {
    const { format: fmt } = useCurrency();
    const { cost, value, pnl } = useMemo(() => aggregatePnL(items), [items]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass p-6 rounded-2xl shadow-sm hover:marine-glow transition-all duration-300">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total Value</p>
                <p className="text-3xl font-black mt-1 text-blue-400">{fmt(value)}</p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-sm hover:marine-glow transition-all duration-300">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Cost Basis</p>
                <p className="text-3xl font-black mt-1">{fmt(cost)}</p>
            </div>
            <div className="glass p-6 rounded-2xl shadow-sm flex items-center justify-between hover:marine-glow transition-all duration-300">
                <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total P&L</p>
                    <p className={`text-3xl font-black mt-1 ${getPnLColor(pnl)}`}>
                        {formatPnLPrefix(pnl)}{fmt(pnl)}
                    </p>
                </div>
                <div className={`p-3 rounded-2xl ${pnl >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                    {pnl >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                </div>
            </div>
        </div>
    );
}
