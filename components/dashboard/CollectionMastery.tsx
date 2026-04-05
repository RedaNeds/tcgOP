'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, Award, CheckCircle2 } from 'lucide-react';
import { SetProgressSummary } from '@/lib/actions/set-progress';
import { getSetColor } from '@/lib/constants';
import { useMemo } from 'react';

interface CollectionMasteryProps {
    setsProgress: SetProgressSummary[];
}

export function CollectionMastery({ setsProgress }: CollectionMasteryProps) {
    const { totalCoreOwned, totalCoreCards, masteryPercentage } = useMemo(() => {
        const owned = setsProgress.reduce((sum, s) => sum + s.coreOwned, 0);
        const total = setsProgress.reduce((sum, s) => sum + s.coreTotal, 0);
        return {
            totalCoreOwned: owned,
            totalCoreCards: total,
            masteryPercentage: total > 0 ? Math.round((owned / total) * 100) : 0
        };
    }, [setsProgress]);

    // Only show top 6 sets by progress
    const topSets = useMemo(() => {
        return [...setsProgress]
            .sort((a, b) => b.completionPercentage - a.completionPercentage)
            .slice(0, 6);
    }, [setsProgress]);

    return (
        <section className="glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* GLOBAL SCORE */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-6 lg:border-r border-white/5 pr-0 lg:pr-12">
                    <div className="relative w-48 h-48">
                        {/* Circle Track */}
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-secondary/20"
                            />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="transparent"
                                stroke="url(#masteryGradient)"
                                strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 88}
                                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - masteryPercentage / 100) }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#60a5fa" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* Overlay Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-5xl font-black tracking-tighter"
                            >
                                {masteryPercentage}%
                            </motion.span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Mastery Score</span>
                        </div>

                        {/* Outer Glow */}
                        <div className="absolute inset-2 border-2 border-blue-500/10 rounded-full animate-pulse-slow" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-bold">{totalCoreOwned} / {totalCoreCards} Cards</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Collection Core</p>
                    </div>
                </div>

                {/* SET BREAKDOWN */}
                <div className="lg:col-span-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h3 className="text-2xl font-black tracking-tighter italic uppercase flex items-center gap-3">
                                <Award className="text-primary h-6 w-6" /> Collection Mastery
                            </h3>
                            <p className="text-xs font-bold text-muted-foreground mt-1 tracking-wide">Top 6 sets progression</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-full border border-white/5">
                            <Target size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">Tactical Achievement</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {topSets.length > 0 ? topSets.map((set, idx) => (
                            <motion.div 
                                key={set.setName}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                <Link 
                                    href={`/app/sets/${encodeURIComponent(set.setName)}`}
                                    className="block group space-y-2 p-2 -m-2 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    <div className="flex justify-between items-end px-1">
                                        <span className="text-xs font-bold group-hover:text-primary transition-colors truncate pr-4">{set.setName}</span>
                                        <span className="text-[10px] font-black text-muted-foreground group-hover:text-white/80 transition-colors">
                                            {set.coreOwned} / {set.coreTotal}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${set.completionPercentage}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + (0.1 * idx) }}
                                            className="h-full rounded-full relative shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                                            style={{ backgroundColor: getSetColor(set.setName) }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                        </motion.div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
 : (
                            <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                                <CheckCircle2 className="h-12 w-12 mb-4 text-muted-foreground" />
                                <p className="text-sm font-bold">No set data available yet.</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-1">Start adding cards to track mastery</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
