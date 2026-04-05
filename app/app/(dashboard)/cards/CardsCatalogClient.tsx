'use client';

import { CardListItem } from '@/lib/actions/cards';
import { addToPortfolio } from '@/lib/actions/portfolio';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Plus, Check, Layers } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CardImage } from '@/components/ui/CardImage';
import { useToast } from '@/components/ui/toast';
import { useCurrency } from '@/lib/hooks/use-currency';
import { EmptyState } from '@/components/ui/EmptyState';

const RARITY_COLORS: Record<string, string> = {
    'C': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'UC': 'bg-green-500/20 text-green-400 border-green-500/30',
    'R': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'SR': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SEC': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'L': 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface CardsCatalogClientProps {
    cards: CardListItem[];
    filters: {
        sets: string[];
        colors: string[];
        types: string[];
        rarities: string[];
    };
    totalCount: number;
    currentPage: number;
    totalPages: number;
    activeFilters: {
        q: string;
        set: string;
        color: string;
        rarity: string;
        type: string;
    };
}

export function CardsCatalogClient({
    cards,
    filters,
    totalCount,
    currentPage,
    totalPages,
    activeFilters,
}: CardsCatalogClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { format: formatPrice } = useCurrency();
    const [showFilters, setShowFilters] = useState(
        !!(activeFilters.set || activeFilters.color || activeFilters.rarity || activeFilters.type)
    );
    const [searchInput, setSearchInput] = useState(activeFilters.q);
    const [addingCardId, setAddingCardId] = useState<string | null>(null);

    const hasActiveFilters = activeFilters.set || activeFilters.color || activeFilters.rarity || activeFilters.type || activeFilters.q;

    const pathname = usePathname();
    const mainRef = useRef<HTMLElement>(null);

    // Scroll to top when page changes
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    // Build URL with given params
    const buildUrl = (overrides: Record<string, string>) => {
        const params = new URLSearchParams();
        const merged = { ...activeFilters, ...overrides };

        if (merged.q) params.set('q', merged.q);
        if (merged.set) params.set('set', merged.set);
        if (merged.color) params.set('color', merged.color);
        if (merged.rarity) params.set('rarity', merged.rarity);
        if (merged.type) params.set('type', merged.type);
        if (overrides.page && overrides.page !== '1') params.set('page', overrides.page);

        const qs = params.toString();
        return `${pathname}${qs ? `?${qs}` : ''}`;
    };

    const handleSearch = () => {
        router.push(buildUrl({ q: searchInput, page: '1' }));
    };

    const handleFilterChange = (key: string, value: string) => {
        router.push(buildUrl({ [key]: value, page: '1' }));
    };

    const clearFilters = () => {
        setSearchInput('');
        router.push(pathname);
    };

    const handleQuickAdd = async (e: React.MouseEvent, card: CardListItem) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (addingCardId) return;
        
        setAddingCardId(card.id);
        const res = await addToPortfolio([{
            cardId: card.id,
            quantity: 1,
            purchasePrice: card.currentPrice
        }]);

        if (res.success) {
            toast(`Added ${card.name} to portfolio!`, 'success');
            // Small delay to show checkmark
            setTimeout(() => setAddingCardId(null), 1500);
        } else {
            toast(res.error || 'Failed to add card', 'error');
            setAddingCardId(null);
        }
    };

    return (
        <main ref={mainRef} className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Card Catalog</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Browse {totalCount} cards across all sets.
                </p>
            </header>

            {/* Search + Filter Toggle */}
            <div className="flex gap-3 mb-6">
                <form
                    className="relative flex-1"
                    onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                >
                    <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </form>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border hover:bg-secondary'}`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="bg-card rounded-xl border border-border/50 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Set</label>
                                <select
                                    value={activeFilters.set}
                                    onChange={(e) => handleFilterChange('set', e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Sets</option>
                                    {filters.sets.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
                                <select
                                    value={activeFilters.color}
                                    onChange={(e) => handleFilterChange('color', e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Colors</option>
                                    {filters.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rarity</label>
                                <select
                                    value={activeFilters.rarity}
                                    onChange={(e) => handleFilterChange('rarity', e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Rarities</option>
                                    {filters.rarities.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                                <select
                                    value={activeFilters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Types</option>
                                    {filters.types.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="col-span-2 md:col-span-4 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 py-1 transition-colors"
                                >
                                    <X size={12} /> Clear all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-4">
                {totalCount} card{totalCount !== 1 ? 's' : ''} found
                {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
            </p>

            {/* Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {cards.map((card) => {
                    const rarityClass = RARITY_COLORS[card.rarity] || '';
                    return (
                        <Link
                            key={card.id}
                            href={`/cards/${card.id}`}
                            className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200 relative"
                        >
                            <div className="relative aspect-[5/7] w-full bg-muted overflow-hidden">
                                <CardImage
                                    src={card.image}
                                    alt={card.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                    <button
                                        onClick={(e) => handleQuickAdd(e, card)}
                                        disabled={addingCardId === card.id}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
                                            addingCardId === card.id 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-primary text-primary-foreground hover:scale-110 active:scale-95'
                                        }`}
                                    >
                                        {addingCardId === card.id ? <Check size={24} /> : <Plus size={24} />}
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-black truncate flex-1">{card.name}</p>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ml-2 ${rarityClass}`}>
                                        {card.rarity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground font-mono font-bold">{card.code}</span>
                                    <p className="text-sm font-black text-blue-500">{formatPrice(card.currentPrice)}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                    {currentPage <= 1 ? (
                        <div className="p-2 rounded-lg border border-border bg-secondary/50 opacity-30 cursor-not-allowed">
                            <ChevronLeft size={18} />
                        </div>
                    ) : (
                        <Link
                            href={buildUrl({ page: String(Math.max(1, currentPage - 1)) })}
                            scroll={false}
                            aria-label="Previous page"
                            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </Link>
                    )}
                    
                    <span className="text-sm font-medium">
                        Page {currentPage} / {totalPages}
                    </span>

                    {currentPage >= totalPages ? (
                        <div className="p-2 rounded-lg border border-border bg-secondary/50 opacity-30 cursor-not-allowed">
                            <ChevronRight size={18} />
                        </div>
                    ) : (
                        <Link
                            href={buildUrl({ page: String(Math.min(totalPages, currentPage + 1)) })}
                            scroll={false}
                            aria-label="Next page"
                            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                        >
                            <ChevronRight size={18} />
                        </Link>
                    )}
                </div>
            )}

            {cards.length === 0 && (
                <EmptyState
                    title="No cards found"
                    description="Try adjusting your search query or clearing active filters."
                    icon={<Layers className="text-muted-foreground" size={24} />}
                    action={
                        hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                            >
                                Clear Filters
                            </button>
                        ) : undefined
                    }
                    className="mt-6"
                />
            )}
        </main>
    );
}
