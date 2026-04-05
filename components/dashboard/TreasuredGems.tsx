'use client';

import { useMemo, useRef } from 'react';
import { PortfolioItem } from '@/types';
import { HoloCard } from '@/components/ui/HoloCard';
import { motion } from 'framer-motion';
import { Crown, Sparkles, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCurrency } from '@/lib/hooks/use-currency';
import Link from 'next/link';
import Image from 'next/image';

interface TreasuredGemsProps {
    items: PortfolioItem[];
}

export function TreasuredGems({ items }: TreasuredGemsProps) {
    const { format: fmt } = useCurrency();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Algorithm to select the "Gems"
    const gems = useMemo(() => {
        if (!items.length) return [];

        // 1. Prestigious Rarities
        const prestigeRarities = ['SEC', 'AA', 'SP', 'L', 'SR'];
        const prestigeItems = items.filter(item => 
            prestigeRarities.includes(item.rarity?.toUpperCase())
        );

        // 2. High Value Items (not already in prestige)
        const highValueItems = [...items]
            .sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
            .filter(item => !prestigeItems.find(p => p.id === item.id))
            .slice(0, 5);

        // Combine and Sort by Value
        const combined = [...prestigeItems, ...highValueItems]
            .sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
            .slice(0, 10); // Limit to top 10

        return combined;
    }, [items]);

    if (gems.length === 0) return null;

    return (
        <section className="mt-12 mb-16 relative">
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Crown size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">Treasured Gems</h2>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">The Hall of Fame • {gems.length} Elites</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                     <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                        className="p-2 glass hover:bg-white/10 rounded-full border-white/5 transition-all"
                     >
                        <ChevronLeft size={18} />
                     </button>
                     <button 
                        onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                        className="p-2 glass hover:bg-white/10 rounded-full border-white/5 transition-all"
                     >
                        <ChevronRight size={18} />
                     </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar mask-fade-right"
                style={{ scrollbarWidth: 'none' }}
            >
                {gems.map((gem, idx) => (
                    <motion.div 
                        key={gem.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="snap-start first:ml-2 last:mr-8 min-w-[240px] md:min-w-[280px]"
                    >
                        <div className="relative group">
                            {/* Ranking Badge */}
                            <div className="absolute -top-3 -left-3 z-30 w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center font-black italic text-sm shadow-2xl group-hover:scale-110 transition-transform">
                                #{idx + 1}
                            </div>

                            {/* Main Card Container */}
                            <Link href={`/app/cards/${gem.cardId}`}>
                                <div className="space-y-4">
                                    <div className="relative">
                                        {/* Glow Effect for Top Items */}
                                        {idx < 3 && (
                                            <div className="absolute inset-0 bg-primary/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                        )}
                                        
                                        <HoloCard 
                                            rarity={gem.rarity as any} 
                                            className="w-full aspect-[2.5/3.5] rounded-2xl shadow-2xl"
                                        >
                                            <Image
                                                src={gem.image || '/card-placeholder.svg'}
                                                alt={gem.name}
                                                fill
                                                sizes="(max-width: 768px) 240px, 280px"
                                                className="w-full h-full object-cover rounded-2xl"
                                                unoptimized
                                            />
                                            
                                            {/* Overlay Info */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold text-primary tracking-widest">{gem.code}</span>
                                                    {gem.isGraded && (
                                                        <span className="text-[8px] font-black bg-white/10 border border-white/10 px-2 py-0.5 rounded-full">
                                                            GRADED {gem.gradingCompany} {gem.certId?.slice(-2)}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-black italic uppercase tracking-tighter truncate mb-2">{gem.name}</h3>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/40 uppercase leading-none">Market Value</span>
                                                        <span className="text-lg font-black tracking-tight">{fmt(gem.currentPrice)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] font-black text-white/40 uppercase leading-none">Rarity</span>
                                                        <span className="text-xs font-black text-amber-500 italic uppercase underline decoration-2 underline-offset-2">{gem.rarity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </HoloCard>
                                    </div>

                                    {/* Action Button (Hidden by default, reveal on hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 px-2">
                                        <div className="glass border-white/5 p-3 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={14} className="text-amber-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">View Detail</span>
                                            </div>
                                            <TrendingUp size={14} className="text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State / Ghost Card for "Add more" */}
                {gems.length < 5 && (
                    <div className="snap-start min-w-[200px] flex items-center justify-center">
                        <div className="w-full aspect-[2.5/3.5] glass border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center p-6 opacity-30 hover:opacity-50 transition-opacity cursor-pointer">
                            <Sparkles className="w-8 h-8 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Add more gems to gallery</p>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .mask-fade-right {
                    -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
                    mask-image: linear-gradient(to right, black 85%, transparent 100%);
                }
            `}</style>
        </section>
    );
}
