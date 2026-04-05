'use client';

import { SetProgressData } from '@/lib/actions/set-progress';
import { ArrowLeft, Search, Eye, EyeOff, LayoutGrid, Award, Target, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SetProgressClientProps {
    data: SetProgressData;
}

export function SetProgressClient({ data }: SetProgressClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'missing' | 'owned'>('all');

    const filteredCards = useMemo(() => {
        return data.cards.filter(card => {
            const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  card.code.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesFilter = filter === 'all' ? true :
                                  filter === 'missing' ? !card.owned : card.owned;
                                  
            return matchesSearch && matchesFilter;
        });
    }, [data.cards, searchQuery, filter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8 bg-[#020617]">
            <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-6">
                        <Link href="/app" className="p-3 glass hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5 group shadow-xl">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Award className="text-primary h-5 w-5" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Master Set Explorer</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter italic uppercase underline decoration-primary/30 decoration-4 underline-offset-8">
                                {data.setName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex flex-col items-end px-6 border-r border-white/5">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Rank</span>
                            <span className="text-xl font-black italic tracking-tighter">ELITE COLLECTOR</span>
                        </div>
                        <div className="flex items-center gap-3 glass p-4 rounded-2xl border-white/5 shadow-2xl">
                             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20 text-primary border border-primary/20">
                                <Target size={24} />
                             </div>
                             <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Completion</p>
                                <p className="text-2xl font-black tracking-tight">{Math.round((data.coreOwned / data.coreTotal) * 100)}%</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Stats Section 1 */}
                    <div className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-all group-hover:bg-blue-500/20" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Core Collection Progress</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">{data.coreOwned}</span>
                                    <span className="text-xl font-bold text-muted-foreground">/ {data.coreTotal}</span>
                                </div>
                            </div>
                            <div className="w-20 h-20 relative">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                    <motion.circle 
                                        cx="40" cy="40" r="36" fill="transparent" stroke="#3b82f6" strokeWidth="6" 
                                        strokeDasharray={2 * Math.PI * 36}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - data.coreOwned / data.coreTotal) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase">Core</div>
                            </div>
                        </div>
                        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(data.coreOwned / data.coreTotal) * 100}%` }}
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                             />
                        </div>
                    </div>

                    {/* Stats Section 2 */}
                    <div className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl transition-all group-hover:bg-amber-500/20" />
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Mastery Completion (Alts)</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">{data.masteryOwned}</span>
                                    <span className="text-xl font-bold text-muted-foreground">/ {data.masteryTotal}</span>
                                </div>
                            </div>
                            <div className="w-20 h-20 relative">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                    <motion.circle 
                                        cx="40" cy="40" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="6" 
                                        strokeDasharray={2 * Math.PI * 36}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 36 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - data.masteryOwned / data.masteryTotal) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase">Alt</div>
                            </div>
                        </div>
                        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(data.masteryOwned / data.masteryTotal) * 100}%` }}
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                             />
                        </div>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center glass p-4 rounded-[2rem] border-white/5 shadow-2xl">
                    <div className="relative w-full lg:w-[450px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME, CODE OR RARITY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground shadow-inner"
                        />
                    </div>
                    
                    <div className="flex bg-black/40 border border-white/5 rounded-[1.5rem] p-1.5 w-full lg:w-auto">
                        {[
                            { id: 'all', icon: LayoutGrid, label: 'Full Checklist' },
                            { id: 'missing', icon: EyeOff, label: 'Missing' },
                            { id: 'owned', icon: Eye, label: 'Owned' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id as any)}
                                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${filter === btn.id ? 'bg-primary text-primary-foreground shadow-[0_8px_16px_rgba(59,130,246,0.4)] scale-[1.02]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                            >
                                <btn.icon size={14} /> {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredCards.map((card) => (
                        <motion.div 
                            key={card.id} 
                            variants={itemVariants}
                            layout
                            className={`group relative glass rounded-2xl overflow-hidden transition-all duration-500 border-white/5 hover:border-white/20 shadow-2xl ${
                                !card.owned ? 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100 ring-1 ring-white/5' : 'ring-2 ring-primary/20'
                            }`}
                        >
                            <div className="relative aspect-[2.5/3.5] w-full bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                                {card.image ? (
                                    <Image
                                        src={card.image}
                                        alt={card.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
                                        className="object-cover transition-all"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                                        <Layers className="opacity-20 mb-2" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Image Unavailable</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {card.owned ? (
                                    <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/20 z-10">
                                        OWNED x{card.quantity}
                                    </div>
                                ) : (
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white/50 text-[10px] font-black px-3 py-1.5 rounded-full border border-white/5 z-10">
                                        MISSING
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 relative bg-black/20 backdrop-blur-md border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{card.code}</span>
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground uppercase">
                                        {card.rarity}
                                    </span>
                                </div>
                                <h3 className="font-black text-sm leading-none italic uppercase tracking-tighter truncate" title={card.name}>
                                    {card.name}
                                </h3>
                            </div>

                            {/* Hover Status Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-2 border-primary/0 group-hover:border-primary/20 transition-all rounded-2xl" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredCards.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center glass rounded-[3rem] border-white/5">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                            <Search className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Target Not Found</h3>
                        <p className="text-muted-foreground font-bold text-xs max-w-sm uppercase tracking-widest opacity-60">
                            Try broadening your search parameters or checking another frequency.
                        </p>
                    </div>
                )}
            </motion.div>
        </main>
    );
}
