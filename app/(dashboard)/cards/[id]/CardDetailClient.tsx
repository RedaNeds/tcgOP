'use client';


import { CardWithHistory } from '@/lib/actions/cards';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Sparkles, Swords, Palette, Layers, Heart } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { Card } from '@/types';
import { useCurrency } from '@/lib/hooks/use-currency';
import { useToast } from '@/components/ui/toast';
import { addToWishlist } from '@/lib/actions/wishlist';

const RARITY_COLORS: Record<string, string> = {
    'C': 'bg-gray-500/20 text-gray-400',
    'UC': 'bg-green-500/20 text-green-400',
    'R': 'bg-blue-500/20 text-blue-400',
    'SR': 'bg-purple-500/20 text-purple-400',
    'SEC': 'bg-yellow-500/20 text-yellow-400',
    'L': 'bg-red-500/20 text-red-400',
};

interface CardDetailClientProps {
    card: CardWithHistory;
}

export function CardDetailClient({ card }: CardDetailClientProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const { format: formatCurrency } = useCurrency();
    const { toast } = useToast();

    const handleAddToWishlist = async () => {
        const result = await addToWishlist(card.id, card.currentPrice * 0.9);
        if (result.success) {
            toast(`${card.name} added to wishlist (target: 10% below current)`, 'success');
        } else {
            toast('Failed to add to wishlist', 'error');
        }
    };

    const rarityClass = RARITY_COLORS[card.rarity] || 'bg-muted text-muted-foreground';

    // Convert to the Card type for AddCardModal
    const cardForModal: Card = {
        id: card.id,
        name: card.name,
        code: card.code,
        set: card.set,
        rarity: card.rarity,
        image: card.image || '/card-placeholder.svg',
        price: card.currentPrice,
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <div className="mb-6">
                <Link href="/cards" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors">
                    <ArrowLeft size={16} />
                    Back to Catalog
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Card Image */}
                <div className="lg:col-span-1">
                    <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-sm">
                        <div className="relative aspect-[5/7] w-full rounded-xl overflow-hidden bg-muted">
                            <Image
                                src={card.image || '/card-placeholder.svg'}
                                alt={card.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                        >
                            <Plus size={18} />
                            Add to Portfolio
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            className="w-full mt-2 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
                        >
                            <Heart size={18} />
                            Add to Wishlist
                        </button>
                    </div>
                </div>

                {/* Card Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${rarityClass}`}>
                                {card.rarity}
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded-md text-muted-foreground font-mono">
                                {card.code}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold">{card.name}</h1>
                        <p className="text-muted-foreground mt-1">{card.set}</p>
                    </div>

                    {/* Price */}
                    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Market Price</p>
                        <p className="text-4xl font-bold">{formatCurrency(card.currentPrice)}</p>
                    </div>

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {card.color && (
                            <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Palette size={14} />
                                    <span className="text-xs font-medium">Color</span>
                                </div>
                                <p className="font-semibold text-sm">{card.color}</p>
                            </div>
                        )}
                        {card.type && (
                            <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Layers size={14} />
                                    <span className="text-xs font-medium">Type</span>
                                </div>
                                <p className="font-semibold text-sm">{card.type}</p>
                            </div>
                        )}
                        {card.power !== null && (
                            <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Swords size={14} />
                                    <span className="text-xs font-medium">Power</span>
                                </div>
                                <p className="font-semibold text-sm">{card.power.toLocaleString()}</p>
                            </div>
                        )}
                        {card.attribute && (
                            <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Sparkles size={14} />
                                    <span className="text-xs font-medium">Attribute</span>
                                </div>
                                <p className="font-semibold text-sm">{card.attribute}</p>
                            </div>
                        )}
                    </div>

                    {/* Price History Chart */}
                    {card.priceHistory.length > 1 && (
                        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Price History</h2>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={card.priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickFormatter={(val) => format(parseISO(val), 'MMM d')}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#64748b"
                                            fontSize={12}
                                            tickFormatter={(val) => `$${val}`}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Price']}
                                            labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#colorPrice)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {card.priceHistory.length <= 1 && (
                        <div className="bg-card rounded-xl border border-border/50 p-8 shadow-sm text-center">
                            <Package className="mx-auto mb-3 text-muted-foreground" size={32} />
                            <p className="text-muted-foreground text-sm">
                                Price history will appear here after multiple price syncs.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add to Portfolio Modal */}
            {
                showAddModal && (
                    <AddCardModal
                        isOpen={showAddModal}
                        card={cardForModal}
                        onClose={() => setShowAddModal(false)}
                    />
                )
            }
        </main>
    );
}
