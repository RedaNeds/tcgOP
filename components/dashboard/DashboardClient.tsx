'use client';


import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { AssetAllocation } from '@/components/dashboard/AssetAllocation';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { CardSearch } from '@/components/cards/CardSearch';
import { useState, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, Crown, AlertTriangle, Layers } from 'lucide-react';
import { Card, PortfolioItem } from '@/types';
import { format, subDays } from 'date-fns';
import Image from 'next/image';
import { removeFromPortfolio } from '@/lib/actions/portfolio';
import { PortfolioHistoryData } from '@/lib/actions/history';
import { useCurrency } from '@/lib/hooks/use-currency';
import { CardImage } from '@/components/ui/CardImage';
import { useToast } from '@/components/ui/toast';

const SET_COLORS: Record<string, string> = {
    'Romance Dawn': '#eab308',
    'Awakening of the New Era': '#f97316',
    'Straw Hat Crew': '#22c55e',
    'Paramount War': '#ef4444',
    'Pillars of Strength': '#a855f7',
    'Kingdoms of Intrigue': '#3b82f6',
    'Twin Champions': '#06b6d4',
};

const getSetColor = (set: string) => SET_COLORS[set] || '#6b7280';

interface DashboardClientProps {
    initialItems: PortfolioItem[];
    historyData: PortfolioHistoryData[];
    userName: string;
}

export function DashboardClient({ initialItems, historyData, userName }: DashboardClientProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const { format: fmt } = useCurrency();
    const { toast } = useToast();

    // Use initialItems directly - revalidation happens via Server Actions
    const items = initialItems;

    // ─── COMPUTED VALUES ───────────────────────────────────────────
    const totalCost = useMemo(() =>
        items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0),
        [items]
    );

    const totalValue = useMemo(() =>
        items.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0),
        [items]
    );

    const pnlValue = totalValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnlValue / totalCost) * 100 : 0;

    // The historyData is now calculated accurately on the server via `getPortfolioHistory`
    // and passed in as a prop. No need to simulate it client-side.

    // ─── ALLOCATION DATA (by set) ──────────────────────────────────
    const allocationData = useMemo(() => {
        if (items.length === 0) return [];
        const bySet: Record<string, number> = {};
        items.forEach(item => {
            const val = item.quantity * item.currentPrice;
            bySet[item.set] = (bySet[item.set] || 0) + val;
        });
        return Object.entries(bySet).map(([name, value]) => ({
            name,
            value: parseFloat(((value / totalValue) * 100).toFixed(1)),
            color: getSetColor(name),
        }));
    }, [items, totalValue]);

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this card from your portfolio?')) return;
        try {
            await removeFromPortfolio(id);
            toast('Card removed from portfolio', 'info');
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast('Failed to remove card', 'error');
        }
    };

    // ─── DYNAMIC INSIGHTS ──────────────────────────────────────────
    const insights = useMemo(() => {
        if (items.length === 0) return null;

        const itemsWithPnl = items.map(item => {
            const currentPrice = item.currentPrice ?? item.purchasePrice ?? 0;
            const cost = item.quantity * (item.purchasePrice ?? 0);
            const value = item.quantity * currentPrice;
            return { ...item, pnl: value - cost, pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0, value };
        });

        const sorted = [...itemsWithPnl].sort((a, b) => b.pnlPct - a.pnlPct);
        const topPerformer = sorted[0];
        const biggestLoser = sorted[sorted.length - 1];
        const mostValuable = [...itemsWithPnl].sort((a, b) => b.value - a.value)[0];

        return [
            { label: 'Top Performer', card: topPerformer?.name || 'N/A', value: `${topPerformer?.pnlPct > 0 ? '+' : ''}${topPerformer?.pnlPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Most Valuable', card: mostValuable?.name || 'N/A', value: fmt(mostValuable?.value || 0), icon: Crown, color: 'text-yellow-400' },
            { label: 'Underperformer', card: biggestLoser?.name || 'N/A', value: `${biggestLoser?.pnlPct.toFixed(1)}%`, icon: AlertTriangle, color: biggestLoser?.pnlPct < 0 ? 'text-red-400' : 'text-muted-foreground' },
        ];
    }, [items, fmt]);

    return (
        <>
            <header className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-muted-foreground">Welcome back,</p>
                    <h1 className="text-2xl font-bold">{userName}</h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    >
                        <Plus className="h-4 w-4" /> Add Asset
                    </button>
                </div>
            </header>

            {/* Dynamic Insights */}
            {insights && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {insights.map((insight) => (
                        <div key={insight.label} className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <insight.icon size={16} className={insight.color} />
                                <span className="text-xs text-muted-foreground font-medium">{insight.label}</span>
                            </div>
                            <p className="text-sm font-semibold truncate">{insight.card}</p>
                            <p className={`text-lg font-bold ${insight.color}`}>{insight.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Portfolio Summary */}
            <section className="mb-10">
                <PortfolioSummary
                    totalValue={items.length > 0 ? totalValue : 1650.00}
                    pnlValue={items.length > 0 ? pnlValue : 450.00}
                    pnlPercent={items.length > 0 ? pnlPercent : 37.5}
                />
            </section>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border/50 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg">Performance</h3>
                        <div className="flex gap-2 text-xs font-medium bg-secondary/30 p-1 rounded-lg">
                            <button className="px-3 py-1 rounded-md bg-background shadow-sm text-foreground">1M</button>
                            <button className="px-3 py-1 rounded-md text-muted-foreground hover:text-foreground">3M</button>
                            <button className="px-3 py-1 rounded-md text-muted-foreground hover:text-foreground">1Y</button>
                            <button className="px-3 py-1 rounded-md text-muted-foreground hover:text-foreground">ALL</button>
                        </div>
                    </div>
                    <PriceChart data={historyData} />
                </div>

                {/* Allocation */}
                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Allocation</h3>
                    <AssetAllocation data={allocationData} />

                    {/* Legend */}
                    <div className="mt-4 space-y-3">
                        {(allocationData.length > 0 ? allocationData : [
                            { name: 'Romance Dawn', value: 40, color: '#eab308' },
                            { name: 'Paramount War', value: 30, color: '#f97316' },
                            { name: 'Pillars of Strength', value: 20, color: '#ef4444' },
                        ]).map((entry) => (
                            <div key={entry.name} className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span>{entry.name}</span>
                                </div>
                                <span className="font-medium">{entry.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── YOUR ASSETS GRID ───────────────────────────────── */}
            <section>
                <h3 className="font-semibold text-lg mb-4">Your Assets ({items.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.length === 0 ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-card rounded-xl border border-border/50 border-dashed">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Layers className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="text-xl font-bold mb-2">Build Your Collection</h4>
                            <p className="text-muted-foreground text-sm max-w-sm mb-6">
                                Your portfolio is currently empty. Start tracking your One Piece TCG collection by adding your first cards.
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add Your First Card
                            </button>
                        </div>
                    ) : (
                        items.map((item) => {
                            const currentPrice = item.currentPrice ?? item.purchasePrice ?? 0;
                            const purchasePrice = item.purchasePrice ?? 0;
                            const itemValue = item.quantity * currentPrice;
                            const itemCost = item.quantity * purchasePrice;
                            const itemPnl = itemValue - itemCost;
                            const isPositive = itemPnl >= 0;
                            const cardName = item.name || item.cardId || 'Unknown Card';
                            const cardCode = item.code || item.cardId || '—';

                            return (
                                <div
                                    key={item.id}
                                    className="bg-card p-4 rounded-xl border border-border/50 flex gap-4 items-center hover:bg-secondary/20 transition-colors cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Card Image */}
                                    <div className="w-12 h-16 bg-muted rounded overflow-hidden relative z-10 flex-shrink-0">
                                        <CardImage
                                            src={item.image}
                                            alt={cardName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex-1 relative z-10 min-w-0">
                                        <p className="font-medium text-sm truncate">{cardName}</p>
                                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                                            <span className="bg-secondary px-1 rounded">{cardCode}</span>
                                            <span>{item.quantity}x</span>
                                        </div>
                                        <p className={`text-xs font-bold mt-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                            {isPositive ? '+' : ''}{fmt(itemPnl)}
                                        </p>
                                    </div>

                                    {/* Value */}
                                    <div className="text-right relative z-10 flex-shrink-0">
                                        <p className="font-bold text-sm">{fmt(itemValue)}</p>
                                        <p className="text-xs text-muted-foreground">{fmt(currentPrice)} ea</p>
                                    </div>

                                    {/* Delete button on hover */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                        aria-label={`Remove ${cardName} from portfolio`}
                                        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                                    >
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* ─── MODALS ─────────────────────────────────────────── */}
            {isAddModalOpen && !selectedCard && (
                <div className="fixed inset-0 z-50 flex items-start pt-32 justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                    <div className="w-full max-w-md bg-card p-6 rounded-xl shadow-2xl border border-secondary" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Search Card</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><Plus className="rotate-45" /></button>
                        </div>
                        <CardSearch onSelect={(card) => setSelectedCard(card)} />
                    </div>
                </div>
            )}

            {selectedCard && (
                <AddCardModal
                    isOpen={!!selectedCard}
                    card={selectedCard}
                    onClose={() => {
                        setSelectedCard(null);
                        setIsAddModalOpen(false);
                    }}
                />
            )}
        </>
    );
}
