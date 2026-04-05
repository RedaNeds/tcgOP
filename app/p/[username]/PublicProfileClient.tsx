'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Package, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicProfileClientProps {
    user: any;
    items: any[];
    wishlist: any[];
    username: string;
}

export function PublicProfileClient({ user, items, wishlist, username }: PublicProfileClientProps) {
    const [activeTab, setActiveTab] = useState<'collection' | 'trading'>('collection');
    const tradeItems = items.filter(item => item.isForTrade);

    return (
        <div className="flex flex-col min-h-screen">
            <header className="border-b border-white/5 bg-card/30 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-2xl font-black text-white">{(user?.name || username)[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                {user?.name || username}
                                {user?.isVerified && <Sparkles size={16} className="text-blue-400" />}
                            </h1>
                            <p className="text-sm text-white/40 font-medium">Standard Grade Collector</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 glass-dark p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('collection')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'collection' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Package size={14} /> Collection
                        </button>
                        <button
                            onClick={() => setActiveTab('trading')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                activeTab === 'trading' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <MessageSquare size={14} /> Trading Billboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
                {activeTab === 'collection' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {items.map((item) => (
                            <CardView key={item.id} item={item} />
                        ))}
                        {items.length === 0 && <EmptyState message="Collection is empty" />}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="glass-dark border border-amber-500/20 rounded-3xl p-8 bg-gradient-to-br from-amber-500/5 to-transparent">
                            <h2 className="text-2xl font-black text-white mb-2">Haves & Wants</h2>
                            <p className="text-white/50 text-sm max-w-lg">
                                These are the cards currently available for trade from {user?.name || username}&apos;s collection. 
                                Inquire for potentially trading or purchase.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {tradeItems.map((item) => (
                                <CardView key={item.id} item={item} isTrade />
                            ))}
                            {tradeItems.length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center glass-dark border border-dashed border-white/10 rounded-3xl">
                                    <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-1">No items listed for trade</h3>
                                </div>
                            )}
                        </div>

                        {/* Wants Section */}
                        <div className="pt-10 border-t border-white/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Sparkles className="text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">Bounty List (Wants)</h2>
                                    <p className="text-white/40 text-sm">Cards {user?.name || username} is actively looking for.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {wishlist.map((item) => (
                                    <CardView key={item.id} item={item} isWant />
                                ))}
                                {wishlist.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center glass-dark border border-dashed border-white/10 rounded-3xl opacity-50">
                                        <Search className="w-12 h-12 text-white/20 mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-1">No bounties active</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function CardView({ item, isTrade, isWant }: { item: any; isTrade?: boolean; isWant?: boolean }) {
    return (
        <div className={cn(
            "group relative glass-dark border rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
            isTrade ? "border-amber-500/20 hover:border-amber-500/50" : 
            isWant ? "border-blue-500/20 hover:border-blue-500/50" :
            "border-white/5 hover:border-blue-500/30"
        )}>
            <div className="relative aspect-[2.5/3.5] bg-white/5">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 16vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold uppercase">
                        No Image
                    </div>
                )}
                
                <div className="absolute top-3 right-3 glass shadow-xl text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/20 z-10">
                    x{item.quantity}
                </div>

                {isTrade && (
                    <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
                )}

                {item.condition !== 'Raw' && (
                    <div className={cn(
                        "absolute bottom-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border shadow-lg backdrop-blur-md z-10",
                        item.gradingCompany ? "bg-amber-400 text-amber-950 border-amber-300" : "bg-blue-500 text-white border-blue-400"
                    )}>
                        {item.condition}
                    </div>
                )}
            </div>
            
            <div className="p-4">
                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1 truncate">
                    {item.code}
                </div>
                <h3 className="font-bold text-sm text-white truncate group-hover:text-blue-400 transition-colors" title={item.name}>
                    {item.name}
                </h3>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-50">
            <Search className="w-16 h-16 text-white mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{message}</h3>
            <p className="text-white/60 max-w-sm">
                Check back later to see updates to this collector&apos;s journey.
            </p>
        </div>
    );
}
