'use client';


import { WishlistItemWithCard, removeFromWishlist } from '@/lib/actions/wishlist';
import { useCurrency } from '@/lib/hooks/use-currency';
import { useToast } from '@/components/ui/toast';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, TrendingDown, Target, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConvertToPortfolioModal } from '@/components/cards/ConvertToPortfolioModal';

interface Props {
    items: WishlistItemWithCard[];
}

export function WishlistClient({ items }: Props) {
    const { format } = useCurrency();
    const { toast } = useToast();
    const router = useRouter();
    const [removing, setRemoving] = useState<string | null>(null);
    const [convertingItem, setConvertingItem] = useState<WishlistItemWithCard | null>(null);

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

    const atTarget = items.filter(i => i.card.currentPrice <= i.targetPrice);
    const watching = items.filter(i => i.card.currentPrice > i.targetPrice);

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Heart size={28} className="text-red-400" />
                    Wishlist
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Track cards you want to buy. Set target prices and get alerted when they drop.
                </p>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                        <Heart className="text-muted-foreground" size={36} />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        Browse the card catalog and add cards you want to track.
                    </p>
                    <Link
                        href="/cards"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                        Browse Cards
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Price Alerts — cards at or below target */}
                    {atTarget.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
                                <TrendingDown size={20} />
                                Price Alerts ({atTarget.length})
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                These cards have hit your target price — time to buy!
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {atTarget.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            format={format}
                                            onRemove={handleRemove}
                                            onConvert={() => setConvertingItem(item)}
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
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target size={20} className="text-yellow-400" />
                            Watching ({watching.length})
                        </h2>
                        {watching.length === 0 ? (
                            <p className="text-sm text-muted-foreground">All your wishlist cards have hit their target prices!</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {watching.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            format={format}
                                            onRemove={handleRemove}
                                            onConvert={() => setConvertingItem(item)}
                                            removing={removing === item.id}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {convertingItem && (
                <ConvertToPortfolioModal
                    isOpen={!!convertingItem}
                    item={convertingItem}
                    onClose={() => setConvertingItem(null)}
                    onSuccess={() => {
                        window.location.reload(); // Refresh to update wishlist and portfolio
                    }}
                />
            )}
        </main>
    );
}

function WishlistCard({
    item,
    format,
    onRemove,
    onConvert,
    removing,
    isAlert,
}: {
    item: WishlistItemWithCard;
    format: (n: number) => string;
    onRemove: (id: string, name: string) => void;
    onConvert: () => void;
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
            className={`bg-card rounded-xl border overflow-hidden transition-colors ${isAlert ? 'border-green-500/40 ring-1 ring-green-500/20' : 'border-border/50'
                }`}
        >
            <div className="flex gap-4 p-4">
                {/* Card Image */}
                <Link href={`/cards/${item.card.id}`} className="shrink-0 group">
                    <div className="w-16 h-[90px] relative rounded-lg overflow-hidden bg-muted">
                        <Image
                            src={item.card.image || '/card-placeholder.svg'}
                            alt={item.card.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                        />
                    </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <Link href={`/cards/${item.card.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-medium text-sm truncate">{item.card.name}</h3>
                    </Link>
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
                        onClick={onConvert}
                        className="p-1.5 rounded-md text-green-500 hover:text-green-600 hover:bg-green-500/10 transition-colors"
                        title="I acquired this card"
                    >
                        <Target size={14} className="rotate-45" />
                    </button>
                    <Link
                        href={`/cards/${item.card.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
                        title="View Card"
                    >
                        <ExternalLink size={14} />
                    </Link>
                    <button
                        onClick={() => onRemove(item.id, item.card.name)}
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
