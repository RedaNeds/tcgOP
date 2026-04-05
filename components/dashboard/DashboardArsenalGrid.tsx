import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { PortfolioItem } from '@/types';
import { CardImage } from '@/components/ui/CardImage';
import { HoloCard } from '@/components/ui/HoloCard';

interface DashboardArsenalGridProps {
    sortedItems: PortfolioItem[];
    paginatedItems: PortfolioItem[];
    currentPage: number;
    totalPages: number;
    formatCurrency: (value: number) => string;
    setDetailedItemId: (id: string) => void;
    setConfirmRemoveId: (id: string) => void;
    setSearch: (value: string) => void;
    setFilterSet: (value: string) => void;
    setCurrentPage: (value: number | ((prev: number) => number)) => void;
}

export function DashboardArsenalGrid({
    sortedItems,
    paginatedItems,
    currentPage,
    totalPages,
    formatCurrency,
    setDetailedItemId,
    setConfirmRemoveId,
    setSearch,
    setFilterSet,
    setCurrentPage,
}: DashboardArsenalGridProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {paginatedItems.map((item) => {
                        const currentPrice = item.currentPrice ?? item.purchasePrice ?? 0;
                        const purchasePrice = item.purchasePrice ?? 0;
                        const itemValue = item.quantity * currentPrice;
                        const itemCost = item.quantity * purchasePrice;
                        const itemPnl = itemValue - itemCost;
                        const isPositive = itemPnl >= 0;
                        const cardName = item.name || item.cardId || 'Unknown Card';
                        const cardCode = item.code || item.cardId || '-';

                        return (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setDetailedItemId(item.id)}
                                className="cursor-pointer group h-full"
                            >
                                <HoloCard rarity={itemValue > 500 ? 'SEC' : itemValue > 100 ? 'SR' : 'DEFAULT'} className="h-full">
                                    <div className="p-5 flex gap-4 items-center">
                                        <div className="w-16 h-24 flex-shrink-0 relative rounded-lg overflow-hidden shadow-xl border border-white/5">
                                            <CardImage
                                                src={item.image}
                                                alt={cardName}
                                                fill
                                                className="object-cover"
                                                priority={paginatedItems.indexOf(item) < 8}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 py-0.5">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 pr-2">
                                                    <h4 className="font-black text-sm truncate leading-tight group-hover:text-primary transition-colors">{cardName}</h4>
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 px-1.5 py-0.5 rounded mt-1 inline-block">{cardCode}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[10px] font-bold text-muted-foreground">x{item.quantity}</span>
                                            </div>

                                            <div className="flex items-end justify-between mt-2">
                                                <div>
                                                    <p className="text-lg font-black tracking-tighter leading-none">{formatCurrency(itemValue)}</p>
                                                    <p className={`text-[9px] font-black uppercase mt-1 flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                        {formatCurrency(Math.abs(itemPnl))}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmRemoveId(item.id);
                                                    }}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    aria-label={`Remove ${cardName} from portfolio`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </HoloCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {sortedItems.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center glass rounded-3xl border-dashed border-2 border-white/5">
                    <Search size={48} className="text-muted-foreground/30 mb-4" />
                    <h4 className="text-xl font-bold">No assets match your search</h4>
                    <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters or search query.</p>
                    <button
                        onClick={() => {
                            setSearch('');
                            setFilterSet('All');
                        }}
                        className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-white/5">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-3 glass rounded-xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-secondary/40 transition-colors border-white/5"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Page</span>
                        <span className="glass px-4 py-2 rounded-lg text-sm font-black">{currentPage}</span>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">of {totalPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-3 glass rounded-xl disabled:opacity-20 disabled:cursor-not-allowed hover:bg-secondary/40 transition-colors border-white/5"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
