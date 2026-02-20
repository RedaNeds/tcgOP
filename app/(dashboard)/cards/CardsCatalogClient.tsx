'use client';


import { CardListItem } from '@/lib/actions/cards';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardImage } from '@/components/ui/CardImage';

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
}

export function CardsCatalogClient({ cards, filters }: CardsCatalogClientProps) {
    const [query, setQuery] = useState('');
    const [selectedSet, setSelectedSet] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedRarity, setSelectedRarity] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const CARDS_PER_PAGE = 48;

    const filteredCards = useMemo(() => {
        return cards.filter((card) => {
            if (query) {
                const q = query.toLowerCase();
                if (!card.name.toLowerCase().includes(q) && !card.code.toLowerCase().includes(q)) {
                    return false;
                }
            }
            if (selectedSet && card.set !== selectedSet) return false;
            if (selectedColor && card.color !== selectedColor) return false;
            if (selectedRarity && card.rarity !== selectedRarity) return false;
            if (selectedType && card.type !== selectedType) return false;
            return true;
        });
    }, [cards, query, selectedSet, selectedColor, selectedRarity, selectedType]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [query, selectedSet, selectedColor, selectedRarity, selectedType]);

    const hasActiveFilters = selectedSet || selectedColor || selectedRarity || selectedType;

    const clearFilters = () => {
        setSelectedSet('');
        setSelectedColor('');
        setSelectedRarity('');
        setSelectedType('');
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Card Catalog</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Browse {cards.length} cards across all sets.
                </p>
            </header>

            {/* Search + Filter Toggle */}
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
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
                                    value={selectedSet}
                                    onChange={(e) => setSelectedSet(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Sets</option>
                                    {filters.sets.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
                                <select
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Colors</option>
                                    {filters.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rarity</label>
                                <select
                                    value={selectedRarity}
                                    onChange={(e) => setSelectedRarity(e.target.value)}
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">All Rarities</option>
                                    {filters.rarities.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
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
                {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''} found
            </p>

            {/* Card Grid (paginated) */}
            {(() => {
                const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
                const currentPage = Math.min(page, totalPages || 1);
                const pagedCards = filteredCards.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);

                return (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {pagedCards.map((card) => {
                                const rarityClass = RARITY_COLORS[card.rarity] || '';
                                return (
                                    <Link
                                        key={card.id}
                                        href={`/cards/${card.id}`}
                                        className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                                    >
                                        <div className="relative aspect-[5/7] w-full bg-muted">
                                            <CardImage
                                                src={card.image}
                                                alt={card.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-medium truncate">{card.name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-muted-foreground font-mono">{card.code}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rarityClass}`}>
                                                    {card.rarity}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold mt-2 text-green-500">${card.currentPrice.toFixed(2)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                                <button
                                    onClick={() => { setPage(Math.max(1, currentPage - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage <= 1}
                                    aria-label="Previous page"
                                    className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => { setPage(Math.min(totalPages, currentPage + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={currentPage >= totalPages}
                                    aria-label="Next page"
                                    className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}

            {filteredCards.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg font-medium">No cards found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
            )}
        </main>
    );
}
