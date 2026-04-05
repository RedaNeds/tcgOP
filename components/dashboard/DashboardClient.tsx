'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Crown, AlertTriangle, Layers, LayoutGrid } from 'lucide-react';
import { Card, PortfolioItem } from '@/types';
import { removeFromPortfolio } from '@/lib/actions/portfolio';
import { PortfolioHistoryData } from '@/lib/actions/history';
import { useCurrency } from '@/lib/hooks/use-currency';
import { useToast } from '@/components/ui/toast';
import { exportPortfolioCSV } from '@/lib/actions/export';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CollectionMastery } from '@/components/dashboard/CollectionMastery';
import { TreasuredGems } from '@/components/dashboard/TreasuredGems';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardArsenalFilters, type DashboardSortField } from '@/components/dashboard/DashboardArsenalFilters';
import { DashboardArsenalGrid } from '@/components/dashboard/DashboardArsenalGrid';
import { DashboardModals } from '@/components/dashboard/DashboardModals';
import { DashboardPerformanceSection } from '@/components/dashboard/DashboardPerformanceSection';
import { aggregatePnL } from '@/lib/utils/calculations';
import { getSetColor } from '@/lib/constants';

// Counter component for stats
function AnimatedNumber({ value }: { value: number }) {
    const { format: fmt } = useCurrency();
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const start = 0;
        const end = value;
        const duration = 1000;
        const startTime = Date.now();

        const timer = setInterval(() => {
            const timePassed = Date.now() - startTime;
            if (timePassed >= duration) {
                setDisplayValue(end);
                clearInterval(timer);
                return;
            }
            const progress = timePassed / duration;
            setDisplayValue(start + (end - start) * (1 - Math.pow(1 - progress, 3))); // easeOutCubic
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{fmt(displayValue)}</span>;
}

import { SetProgressSummary } from '@/lib/actions/set-progress';

interface DashboardClientProps {
    initialItems: PortfolioItem[];
    historyData: PortfolioHistoryData[];
    userName: string;
    setsProgress: SetProgressSummary[];
}

export function DashboardClient({ initialItems, historyData, userName, setsProgress }: DashboardClientProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [detailedItemId, setDetailedItemId] = useState<string | null>(null);
    const { format: fmt } = useCurrency();
    const { toast } = useToast();
    const router = useRouter();

    const items = initialItems;

    // ─── FILTER & PAGINATION STATE ──────────────────────────────
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<DashboardSortField>('value');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterSet, setFilterSet] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 12;

    const uniqueSets = useMemo(() => 
        Array.from(new Set(items.map(i => i.set))).filter(Boolean).sort(),
        [items]
    );

    // ─── COMPUTED VALUES ───────────────────────────────────────────
    const { value: totalValue, pnl: pnlValue, pnlPercent } = useMemo(() => 
        aggregatePnL(items), 
        [items]
    );

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

    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

    // ─── FILTERING & SORTING LOGIC ───────────────────────────────
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const cardName = item.name || '';
            const cardCode = item.code || '';
            const cardSet = item.set || '';
            
            const matchesSearch = 
                cardName.toLowerCase().includes(search.toLowerCase()) ||
                cardCode.toLowerCase().includes(search.toLowerCase()) ||
                cardSet.toLowerCase().includes(search.toLowerCase());

            const matchesSet = filterSet === 'All' || item.set === filterSet;

            return matchesSearch && matchesSet;
        });
    }, [items, search, filterSet]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            let valA: number | string;
            let valB: number | string;

            switch (sortField) {
                case 'value':
                    valA = a.quantity * (a.currentPrice || 0);
                    valB = b.quantity * (b.currentPrice || 0);
                    break;
                case 'pnl':
                    valA = (a.quantity * (a.currentPrice || 0)) - (a.quantity * (a.purchasePrice || 0));
                    valB = (b.quantity * (b.currentPrice || 0)) - (b.quantity * (b.purchasePrice || 0));
                    break;
                case 'name':
                    valA = a.name || '';
                    valB = b.name || '';
                    break;
                case 'dateAdded':
                    valA = new Date(a.dateAdded || 0).getTime();
                    valB = new Date(b.dateAdded || 0).getTime();
                    break;
                default:
                    valA = 0;
                    valB = 0;
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }

            const numericA = typeof valA === 'number' ? valA : 0;
            const numericB = typeof valB === 'number' ? valB : 0;
            return sortOrder === 'asc' ? numericA - numericB : numericB - numericA;
        });
    }, [filteredItems, sortField, sortOrder]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return sortedItems.slice(startIndex, startIndex + PAGE_SIZE);
    }, [sortedItems, currentPage]);

    const totalPages = Math.ceil(sortedItems.length / PAGE_SIZE);

    const handleExport = async () => {
        try {
            const csv = await exportPortfolioCSV();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `optcg-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast('Portfolio exported as CSV', 'success');
        } catch {
            toast('Could not generate CSV export', 'error');
        }
    };

    const executeRemove = async () => {
        if (!confirmRemoveId) return;
        try {
            await removeFromPortfolio(confirmRemoveId);
            toast('Card removed from portfolio', 'info');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast('Failed to remove card', 'error');
        }
        setConfirmRemoveId(null);
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
            { label: 'Top Performer', card: topPerformer?.name || 'N/A', value: `${topPerformer?.pnlPct > 0 ? '+' : ''}${topPerformer?.pnlPct.toFixed(1)}%`, icon: TrendingUp, color: 'text-green-400', rarity: 'SEC' as const },
            { label: 'Most Valuable', card: mostValuable?.name || 'N/A', value: fmt(mostValuable?.value || 0), icon: Crown, color: 'text-yellow-400', rarity: 'PARA' as const },
            { label: 'Underperformer', card: biggestLoser?.name || 'N/A', value: `${biggestLoser?.pnlPct.toFixed(1)}%`, icon: AlertTriangle, color: biggestLoser?.pnlPct < 0 ? 'text-red-400' : 'text-muted-foreground', rarity: 'DEFAULT' as const },
        ];
    }, [items, fmt]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                type: "spring" as const, 
                stiffness: 300, 
                damping: 30 
            } 
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 max-w-7xl mx-auto"
        >
            <DashboardHero
                userName={userName}
                trackedCount={items.length}
                pnlValue={pnlValue}
                pnlPercent={pnlPercent}
                totalValueNode={<AnimatedNumber value={totalValue} />}
                pnlValueNode={<AnimatedNumber value={pnlValue} />}
                insights={insights}
                onExport={handleExport}
                onAddAsset={() => setIsAddModalOpen(true)}
                itemVariants={itemVariants}
            />

            {/* NEW: Treasured Gems Showcase */}
            <motion.div variants={itemVariants}>
                <TreasuredGems items={items} />
            </motion.div>

            <DashboardPerformanceSection
                historyData={historyData}
                allocationData={allocationData}
                itemVariants={itemVariants}
            />

            {/* COLLECTION MASTERY SECTION */}
            <motion.div variants={itemVariants}>
                <CollectionMastery setsProgress={setsProgress} />
            </motion.div>

            {/* YOUR ARSENAL (Assets Grid) */}
            <motion.section variants={itemVariants} className="pt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                    <div>
                        <h3 className="font-black text-3xl tracking-tighter">Your Arsenal</h3>
                        <p className="text-muted-foreground text-sm font-bold">
                            {filteredItems.length !== items.length 
                                ? `Showing ${filteredItems.length} of ${items.length} Strategic Assets`
                                : `${items.length} Strategic Assets collected`
                            }
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Link 
                            href="/portfolio"
                            className="bg-secondary/40 hover:bg-secondary text-xs font-black px-4 py-2 rounded-xl transition-colors border border-white/5 flex items-center gap-2"
                        >
                            <LayoutGrid size={14} /> VIEW ALL
                        </Link>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 marine-glow">
                            <Layers className="w-12 h-12 text-primary" />
                        </div>
                        <h4 className="text-3xl font-black mb-3">Begin Your Voyage</h4>
                        <p className="text-muted-foreground font-medium max-w-sm mb-10 px-6">
                            The seas are empty, Captain. Track your One Piece TCG collection by adding tactical cards.
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-primary-foreground hover:brightness-110 px-10 py-4 rounded-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                        >
                            <Plus size={24} /> ADD YOUR FIRST CARD
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <DashboardArsenalFilters
                            search={search}
                            setSearch={setSearch}
                            sortField={sortField}
                            setSortField={setSortField}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            filterSet={filterSet}
                            setFilterSet={setFilterSet}
                            uniqueSets={uniqueSets}
                        />

                        <DashboardArsenalGrid
                            sortedItems={sortedItems}
                            paginatedItems={paginatedItems}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            formatCurrency={fmt}
                            setDetailedItemId={setDetailedItemId}
                            setConfirmRemoveId={setConfirmRemoveId}
                            setSearch={setSearch}
                            setFilterSet={setFilterSet}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                )}
            </motion.section>

            <DashboardModals
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                selectedCard={selectedCard}
                setSelectedCard={setSelectedCard}
                confirmRemoveId={confirmRemoveId}
                setConfirmRemoveId={setConfirmRemoveId}
                detailedItemId={detailedItemId}
                setDetailedItemId={setDetailedItemId}
                items={items}
                executeRemove={executeRemove}
            />
        </motion.div>
    );
}
