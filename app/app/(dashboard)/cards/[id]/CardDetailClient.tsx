'use client';


import { CardWithHistory } from '@/lib/actions/cards';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Sparkles, Swords, Palette, Layers, Heart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { AddWishlistModal } from '@/components/cards/AddWishlistModal';
import { HoloCard } from '@/components/ui/HoloCard';
import { ExternalLink } from 'lucide-react';
import { getTCGPlayerUrl, getCardmarketUrl } from '@/lib/marketplace';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { Card } from '@/types';
import { useCurrency } from '@/lib/hooks/use-currency';

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
    holdings: any[];
}

export function CardDetailClient({ card, holdings }: CardDetailClientProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWishlistModal, setShowWishlistModal] = useState(false);
    const { format: formatCurrency } = useCurrency();

    const rarityClass = RARITY_COLORS[card.rarity] || 'bg-muted text-muted-foreground';

    const totalOwned = holdings.reduce((acc, h) => acc + h.quantity, 0);
    const avgPurchasePrice = totalOwned > 0 
        ? holdings.reduce((acc, h) => acc + (h.quantity * h.purchasePrice), 0) / totalOwned 
        : 0;
    const totalPnl = totalOwned > 0 ? (card.currentPrice - avgPurchasePrice) * totalOwned : 0;
    const pnlPercent = avgPurchasePrice > 0 ? ((card.currentPrice - avgPurchasePrice) / avgPurchasePrice) * 100 : 0;

    // Convert to the Card type for AddCardModal
    const cardForModal: Card = {
        id: card.id,
        name: card.name,
        code: card.code,
        set: card.set,
        rarity: card.rarity,
        image: card.image || '/card-placeholder.svg',
        currentPrice: card.currentPrice,
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8">
            <nav className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Link href="/cards" className="hover:text-foreground transition-colors">Cards</Link>
                <span>/</span>
                <Link href={`/sets/${encodeURIComponent(card.set)}`} className="hover:text-foreground transition-colors">{card.set}</Link>
                <span>/</span>
                <span className="text-foreground">{card.code}</span>
            </nav>
            <div className="mb-6">
                <Link href="/cards" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors font-bold uppercase tracking-tighter">
                    <ArrowLeft size={16} />
                    Back to Catalog
                </Link>
            </div>
            {/* Immersive Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-x-0 -top-40 h-[1000px] opacity-15 blur-[120px]">
                    <Image src={card.image || '/card-placeholder.svg'} alt="bg" fill className="object-cover" unoptimized />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[500px] bg-gradient-to-t from-blue-500/10 to-transparent blur-[120px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
            </div>

            <div className="flex flex-col lg:flex-row gap-12 relative max-w-7xl mx-auto z-10">
                {/* Left Column: Showcase */}
                <aside className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-8 h-fit">
                    <HoloCard rarity={card.rarity === 'SEC' ? 'SEC' : card.rarity === 'SR' ? 'SR' : 'DEFAULT'} className="w-full">
                        <div className="relative aspect-[5/7] w-full rounded-3xl overflow-hidden bg-muted shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] border border-white/10 group">
                            <Image
                                src={card.image || '/card-placeholder.svg'}
                                alt={card.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                unoptimized
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                <p className="text-white text-xs font-black tracking-widest uppercase">Inspect Holographic Finish</p>
                            </div>
                        </div>
                    </HoloCard>
                    
                    <div className="mt-8 space-y-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 w-full rounded-2xl font-black flex items-center justify-center gap-3 text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group border border-white/5 uppercase tracking-widest"
                        >
                            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" /> Add to Portfolio
                        </button>
                        <button
                            onClick={() => setShowWishlistModal(true)}
                            className="glass text-foreground hover:bg-white/5 h-16 w-full rounded-2xl font-black flex items-center justify-center gap-3 text-sm border border-white/10 transition-all hover:scale-[1.02] active:scale-95 group uppercase tracking-widest"
                        >
                            <Heart className="h-5 w-5 transition-transform group-hover:scale-110 text-rose-500" /> Watch Card
                        </button>
                    </div>
                </aside>

                {/* Right Column: Data Hub */}
                <main className="flex-1 space-y-8 min-w-0">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-current/20 ${rarityClass}`}>
                                {card.rarity}
                            </span>
                            <span className="text-[10px] bg-secondary/80 backdrop-blur-md px-3 py-1 rounded-full text-muted-foreground font-mono font-black border border-border/50">
                                {card.code}
                            </span>
                            {totalOwned > 0 && (
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-black border border-green-500/20 uppercase tracking-widest">
                                    Owned x{totalOwned}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">{card.name}</h1>
                            <p className="text-xl text-muted-foreground font-medium mt-2">
                                <Link href={`/sets/${encodeURIComponent(card.set)}`} className="hover:text-foreground underline underline-offset-4 transition-colors">
                                    {card.set}
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Price & Marketplace Action */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
                            <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 relative z-10">Current Market Value</p>
                            <div className="flex items-end gap-3 relative z-10">
                                <p className="text-6xl font-black">{formatCurrency(card.currentPrice)}</p>
                                <span className="text-green-500 font-black text-sm mb-2 flex items-center gap-1">
                                    <TrendingUp size={16} /> +12.4% <span className="text-[10px] text-muted-foreground/50 font-medium">30d</span>
                                </span>
                            </div>
                        </div>

                        <div className="glass rounded-[2.5rem] p-10 border-white/5 flex flex-col justify-center">
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Marketplace Links</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <a
                                    href={getTCGPlayerUrl(card.name, card.code)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <span>TCGPlayer</span>
                                    <ExternalLink size={14} />
                                </a>
                                <a
                                    href={getCardmarketUrl(card.name, card.code)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <span>Cardmarket</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* My Holdings Hero (if owned) */}
                    {totalOwned > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-green-500/10 to-blue-500/5 rounded-[2.5rem] p-10 border border-green-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Package size={120} className="text-green-500 rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-green-400 uppercase tracking-[0.3em] mb-8">Personal Holdings</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total Quantity</p>
                                        <p className="text-3xl font-black">{totalOwned}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Avg. Cost</p>
                                        <p className="text-3xl font-black">{formatCurrency(avgPurchasePrice)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Unrealized P&L</p>
                                        <p className={`text-3xl font-black ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Performance</p>
                                        <p className={`text-3xl font-black ${pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {card.color && (
                            <AttributeCard icon={<Palette size={16} />} label="Color" value={card.color} />
                        )}
                        {card.type && (
                            <AttributeCard icon={<Layers size={16} />} label="Type" value={card.type} />
                        )}
                        {card.power !== null && (
                            <AttributeCard icon={<Swords size={16} />} label="Power" value={card.power.toLocaleString()} />
                        )}
                        {card.attribute && (
                            <AttributeCard icon={<Sparkles size={16} />} label="Attribute" value={card.attribute} />
                        )}
                    </div>

                    {/* Price History Chart */}
                    <div className="glass rounded-[2.5rem] border-white/5 p-10 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="font-black text-3xl tracking-tighter">Market Trajectory</h3>
                            <div className="flex gap-2">
                                {['7D', '30D', '90D', '1Y', 'ALL'].map(t => (
                                    <button key={t} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${t === '90D' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {card.priceHistory.length > 1 ? (
                            <div className="relative z-10 h-[300px]">
                                <PriceChart 
                                    data={card.priceHistory.map(ph => ({ 
                                        date: format(parseISO(ph.date), 'MMM dd'), 
                                        value: ph.price 
                                    }))} 
                                />
                            </div>
                        ) : (
                            <div className="h-[300px] flex flex-col justify-center items-center text-center relative z-10 border-2 border-dashed border-white/5 rounded-3xl">
                                <Package className="mb-4 text-muted-foreground/20" size={64} />
                                <p className="text-muted-foreground font-black text-lg max-w-xs">
                                    Insufficient price data to generate trajectory.
                                </p>
                                <p className="text-muted-foreground/50 text-sm mt-2">
                                    Our scouts are still gathering market history.
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals handled separately */}
            <AddCardModal isOpen={showAddModal} card={cardForModal} onClose={() => setShowAddModal(false)} />
            <AddWishlistModal isOpen={showWishlistModal} card={cardForModal} onClose={() => setShowWishlistModal(false)} />
        </main>
    );
}

function AttributeCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="glass rounded-3xl border-white/5 p-6 group hover:bg-white/5 transition-all">
            <div className="flex items-center gap-2 text-muted-foreground/60 mb-3 group-hover:text-blue-400 transition-colors">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="font-black text-lg tracking-tight">{value}</p>
        </div>
    );
}
