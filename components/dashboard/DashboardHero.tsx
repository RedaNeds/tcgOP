import { AlertTriangle, Crown, Download, Plus, Target, TrendingDown, TrendingUp, Wallet, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type DashboardInsight = {
    label: string;
    card: string;
    value: string;
    color: string;
    icon: LucideIcon;
};

interface DashboardHeroProps {
    userName: string;
    trackedCount: number;
    pnlValue: number;
    pnlPercent: number;
    totalValueNode: ReactNode;
    pnlValueNode: ReactNode;
    insights: DashboardInsight[] | null;
    onExport: () => void;
    onAddAsset: () => void;
    onImportModalOpen: () => void;
    itemVariants: Variants;
}

export function DashboardHero({
    userName,
    trackedCount,
    pnlValue,
    pnlPercent,
    totalValueNode,
    pnlValueNode,
    insights,
    onExport,
    onAddAsset,
    onImportModalOpen,
    itemVariants,
}: DashboardHeroProps) {
    return (
        <>
            <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div className="space-y-2">
                    <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-xs">Command Center</p>
                    <h1 className="text-5xl font-black tracking-tighter">
                        Ahoy, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 animate-shimmer bg-[length:200%_auto]">{userName}</span>
                    </h1>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onImportModalOpen}
                        className="bg-secondary/60 text-foreground hover:bg-secondary h-14 px-6 py-2 rounded-2xl font-black flex items-center gap-3 text-sm border border-white/5 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Upload className="h-5 w-5" /> IMPORT CSV
                    </button>
                    <button
                        onClick={onExport}
                        className="bg-secondary/60 text-foreground hover:bg-secondary h-14 px-6 py-2 rounded-2xl font-black flex items-center gap-3 text-sm border border-white/5 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Download className="h-5 w-5" /> EXPORT CSV
                    </button>
                    <button
                        onClick={onAddAsset}
                        className="bg-primary text-primary-foreground hover:brightness-110 h-14 px-8 py-2 rounded-2xl font-black flex items-center gap-3 text-sm shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" /> ADD NEW ASSET
                    </button>
                </div>
            </motion.header>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={80} className="text-blue-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">Portfolio Worth</p>
                        <h2 className="text-4xl font-black tracking-tight mb-4">{totalValueNode}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Target size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black text-blue-300 uppercase">{trackedCount} Card{trackedCount !== 1 ? 's' : ''} Tracked</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        {pnlValue >= 0 ? <TrendingUp size={80} className="text-green-400" /> : <TrendingDown size={80} className="text-red-400" />}
                    </div>
                    <div className="relative z-10">
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">Total Profits</p>
                        <h2 className={`text-4xl font-black tracking-tight mb-4 ${pnlValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnlValue >= 0 ? '+' : ''}
                            {pnlValueNode}
                        </h2>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pnlValue >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                            <span className="text-[10px] font-black uppercase">{pnlPercent.toFixed(1)}% Yield</span>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group border-white/5">
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">Tactical Insights</p>
                        {(insights || [
                            { label: 'Top Performer', card: 'N/A', value: '0.0%', color: 'text-muted-foreground', icon: TrendingUp },
                            { label: 'Most Valuable', card: 'N/A', value: '$0.00', color: 'text-muted-foreground', icon: Crown },
                            { label: 'Underperformer', card: 'N/A', value: '0.0%', color: 'text-muted-foreground', icon: AlertTriangle },
                        ]).map((insight) => (
                            <div key={insight.label} className="flex items-center justify-between group/insight">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-secondary/30 ${insight.color}`}>
                                        <insight.icon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase leading-tight">{insight.label}</p>
                                        <p className="text-sm font-bold truncate transition-colors group-hover/insight:text-primary">{insight.card}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-black ${insight.color}`}>{insight.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
