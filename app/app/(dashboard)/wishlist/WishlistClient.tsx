'use client';


import { WishlistItemWithCard, removeFromWishlist } from '@/lib/actions/wishlist';
import { useCurrency } from '@/lib/hooks/use-currency';
import { useToast } from '@/components/ui/toast';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, 
    ExternalLink, 
    TrendingDown, 
    Target, 
    Heart, 
    Search, 
    Plus, 
    X,
    LayoutGrid,
    List,
    Edit2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConvertToPortfolioModal } from '@/components/cards/ConvertToPortfolioModal';
import { CardSearch } from '@/components/cards/CardSearch';
import { AddWishlistModal } from '@/components/cards/AddWishlistModal';
import { EditWishlistItemModal } from '@/components/cards/EditWishlistItemModal';

interface Props {
    items: WishlistItemWithCard[];
}

export function WishlistClient({ items }: Props) {
    const { format } = useCurrency();
    const { toast } = useToast();
    const router = useRouter();
    const [removing, setRemoving] = useState<string | null>(null);
    const [convertingItem, setConvertingItem] = useState<WishlistItemWithCard | null>(null);
    const [editingItem, setEditingItem] = useState<WishlistItemWithCard | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filterSet, setFilterSet] = useState('All');
    const [filterStatus, setFilterStatus] = useState<'all' | 'at-target' | 'watching'>('all');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedCardForWishlist, setSelectedCardForWishlist] = useState<any | null>(null);

    const uniqueSets = Array.from(new Set(items.map((item) => item.card.set))).sort();

    const handleRemove = async (id: string, cardName: string) => {
        setRemoving(id);
        const result = await removeFromWishlist(id);
        if (result.success) {
            toast(`Removed ${cardName} from wishlist`, 'info');
            router.refresh();
        } else {
            toast('Failed to remove item', 'error');
        }
        setRemoving(null);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.card.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSet = filterSet === 'All' || item.card.set === filterSet;
        const isAtTarget = item.card.currentPrice <= item.targetPrice;
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'at-target' && isAtTarget) ||
            (filterStatus === 'watching' && !isAtTarget);

        return matchesSearch && matchesSet && matchesStatus;
    });

    const atTarget = filteredItems.filter(i => i.card.currentPrice <= i.targetPrice);
    const watching = filteredItems.filter(i => i.card.currentPrice > i.targetPrice);

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                            <Heart size={32} className="text-rose-500" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">Wishlist</h1>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        Track hunting targets and get alerted when they hit your price.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-rose-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter wishlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-secondary/30 border border-border/50 rounded-2xl pl-12 pr-4 h-12 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-medium text-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setIsSearchModalOpen(true)}
                        className="h-12 px-6 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 uppercase tracking-widest whitespace-nowrap"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Item
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-3 mb-8">
                <div className="flex gap-2">
                    <select value={filterSet} onChange={(e) => setFilterSet(e.target.value)} className="bg-secondary/30 border border-border/50 rounded-xl px-3 h-10 text-sm font-medium">
                        <option value="All">All Sets</option>
                        {uniqueSets.map((setName) => <option key={setName} value={setName}>{setName}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'at-target' | 'watching')} className="bg-secondary/30 border border-border/50 rounded-xl px-3 h-10 text-sm font-medium">
                        <option value="all">All Status</option>
                        <option value="at-target">At Target</option>
                        <option value="watching">Watching</option>
                    </select>
                </div>
                <div className="flex glass rounded-xl p-1 w-fit">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}><LayoutGrid size={16} /></button>
                    <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}><List size={16} /></button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-white/10 mx-auto max-w-2xl">
                    <div className="w-24 h-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center mb-8 border border-white/5 shadow-inner">
                        <Heart className="text-muted-foreground/30" size={48} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-3">Your wishlist is empty</h2>
                    <p className="text-muted-foreground font-medium max-w-sm mb-10 leading-relaxed px-6">
                        Start tracking cards you want by adding them here. We&apos;ll monitor prices for you.
                    </p>
                    <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all shadow-2xl shadow-primary/30 uppercase tracking-widest"
                    >
                        Find Cards to Watch
                    </button>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-muted-foreground font-bold italic">No cards matching &quot;{searchQuery}&quot; in your wishlist.</p>
                    <button onClick={() => setSearchQuery('')} className="text-rose-400 text-sm font-black mt-2 uppercase tracking-widest hover:underline underline-offset-4">Clear filter</button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="space-y-16">
                    {/* Price Alerts — cards at or below target */}
                    {atTarget.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <TrendingDown size={24} className="text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        Active Alerts
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full font-black border border-green-500/20 ml-2">
                                            {atTarget.length}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-muted-foreground font-medium">These cards hit your target price!</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {atTarget.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            format={format}
                                            onRemove={handleRemove}
                                            onConvert={() => setConvertingItem(item)}
                                            onEdit={() => setEditingItem(item)}
                                            removing={removing === item.id}
                                            isAlert
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}

                    {/* Watching */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <Target size={24} className="text-yellow-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-foreground/80">
                                    Watching
                                    <span className="text-[10px] bg-secondary/80 text-muted-foreground px-2.5 py-0.5 rounded-full font-black border border-border/50 ml-2">
                                        {watching.length}
                                    </span>
                                </h2>
                                <p className="text-sm text-muted-foreground font-medium">Waiting for the right price.</p>
                            </div>
                        </div>
                        
                        {watching.length === 0 && searchQuery === '' ? (
                            <div className="text-center py-12 glass rounded-3xl border-dashed border-white/5">
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">All targets hit or none added.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {watching.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            format={format}
                                            onRemove={handleRemove}
                                            onConvert={() => setConvertingItem(item)}
                                            onEdit={() => setEditingItem(item)}
                                            removing={removing === item.id}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border/50 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/30 border-b border-border/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="p-3">Card</th>
                                <th className="p-3">Set</th>
                                <th className="p-3 text-right">Current</th>
                                <th className="p-3 text-right">Target</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredItems.map((item) => {
                                const isAtTarget = item.card.currentPrice <= item.targetPrice;
                                return (
                                    <tr key={item.id} className="hover:bg-secondary/10 cursor-pointer" onClick={() => setEditingItem(item)}>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 relative rounded overflow-hidden bg-muted">
                                                    <Image src={item.card.image || '/card-placeholder.svg'} alt={item.card.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{item.card.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.card.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">{item.card.set}</td>
                                        <td className="p-3 text-right text-sm font-medium">{format(item.card.currentPrice)}</td>
                                        <td className="p-3 text-right text-sm font-medium">{format(item.targetPrice)}</td>
                                        <td className="p-3 text-xs font-black uppercase tracking-wider">
                                            <span className={isAtTarget ? 'text-green-400' : 'text-muted-foreground'}>{isAtTarget ? 'At Target' : 'Watching'}</span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-1.5 rounded hover:bg-secondary" title="Edit wishlist item"><Edit2 size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setConvertingItem(item); }} className="p-1.5 rounded text-green-500 hover:bg-green-500/10" title="Mark as acquired"><Target size={14} className="rotate-45" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {convertingItem && (
                <ConvertToPortfolioModal
                    isOpen={!!convertingItem}
                    item={convertingItem}
                    onClose={() => setConvertingItem(null)}
                    onSuccess={() => {
                        router.refresh();
                    }}
                />
            )}

            {editingItem && (
                <EditWishlistItemModal
                    isOpen={!!editingItem}
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSuccess={() => router.refresh()}
                    onMarkAcquired={() => {
                        setConvertingItem(editingItem);
                        setEditingItem(null);
                    }}
                />
            )}

            {/* Add Flow Modals */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)}>
                    <div className="w-full max-w-2xl bg-card border border-border/50 rounded-[2.5rem] shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black tracking-tighter">Add to Wishlist</h2>
                            <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <CardSearch 
                            onSelect={(card) => {
                                setSelectedCardForWishlist(card);
                                setIsSearchModalOpen(false);
                            }} 
                        />
                    </div>
                </div>
            )}

            <AddWishlistModal
                isOpen={!!selectedCardForWishlist}
                card={selectedCardForWishlist}
                onClose={() => setSelectedCardForWishlist(null)}
            />
        </main>
    );
}

function WishlistCard({
    item,
    format,
    onRemove,
    onConvert,
    onEdit,
    removing,
    isAlert,
}: {
    item: WishlistItemWithCard;
    format: (n: number) => string;
    onRemove: (id: string, name: string) => void;
    onConvert: () => void;
    onEdit: () => void;
    removing: boolean;
    isAlert?: boolean;
}) {
    const priceDiff = ((item.card.currentPrice - item.targetPrice) / item.targetPrice) * 100;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={onEdit}
            className={`bg-card rounded-xl border overflow-hidden transition-colors ${isAlert ? 'border-green-500/40 ring-1 ring-green-500/20' : 'border-border/50'
                } cursor-pointer`}
        >
            <div className="flex gap-4 p-4">
                {/* Card Image */}
                <div className="shrink-0 group">
                    <div className="w-16 h-[90px] relative rounded-lg overflow-hidden bg-muted">
                        <Image
                            src={item.card.image || '/card-placeholder.svg'}
                            alt={item.card.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                        />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="hover:text-primary transition-colors">
                        <h3 className="font-medium text-sm truncate">{item.card.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.card.code} · {item.card.set}</p>

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-bold">{format(item.card.currentPrice)}</span>
                        <span className="text-xs text-muted-foreground">current</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-yellow-400">
                            {format(item.targetPrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">target</span>
                        <span className={`text-xs font-medium ml-auto ${priceDiff <= 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                            {priceDiff <= 0 ? '✓ Hit!' : `${priceDiff.toFixed(0)}% above`}
                        </span>
                    </div>

                    {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic truncate">{item.notes}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onConvert(); }}
                        className="p-1.5 rounded-md text-green-500 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                        title="I acquired this card"
                    >
                        <Target size={14} className="rotate-45" />
                    </button>
                    <Link
                        href={`/cards/${item.card.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                        title="View Card"
                    >
                        <ExternalLink size={14} />
                    </Link>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(item.id, item.card.name); }}
                        disabled={removing}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Remove from wishlist"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
