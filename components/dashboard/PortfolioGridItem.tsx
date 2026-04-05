'use client';

import { PortfolioItem } from '@/types';
import { useCurrency } from '@/lib/hooks/use-currency';
import { Trash2, Edit2, MessageSquare, CheckSquare, Square } from 'lucide-react';
import { calculatePnL, getPnLColor, formatPnLPrefix } from '@/lib/utils/calculations';
import { CardImage } from '@/components/ui/CardImage';
import { HoloCard } from '@/components/ui/HoloCard';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PortfolioGridItemProps {
    item: PortfolioItem;
    onRemove: (id: string) => void;
    onEdit: (item: PortfolioItem) => void;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function PortfolioGridItem({ item, onRemove, onEdit, isSelected, onSelect }: PortfolioGridItemProps) {
    const { format: fmt } = useCurrency();
    const { value, pnl } = calculatePnL(item.quantity, item.purchasePrice, item.currentPrice || 0);

    return (
        <div 
            onClick={() => onEdit(item)}
            className={cn(
                "cursor-pointer group relative transition-all duration-300",
                isSelected && "scale-[0.98]"
            )}
        >
            <HoloCard rarity={item.rarity as any} className={cn(
                "h-full border-2 transition-all duration-300",
                isSelected ? "border-primary shadow-2xl shadow-primary/20" : "border-white/5"
            )}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex gap-4">
                        <div className="w-20 h-28 relative rounded-lg overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
                                className="absolute top-1 left-1 z-20 bg-black/60 rounded p-0.5"
                                aria-label={`Select ${item.name}`}
                            >
                                {isSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} className="text-white/80" />}
                            </button>
                            <CardImage src={item.image} alt={item.name} fill className="object-cover" />
                            {item.isForTrade && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-[8px] font-black text-white px-1 rounded-bl shadow-sm z-10">
                                    TR
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0">
                                    <h4 className="font-black text-sm truncate leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                                    <div className="flex gap-1 mt-1">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50 px-1.5 py-0.5 rounded">{item.code}</span>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50 px-1.5 py-0.5 rounded">{item.rarity}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>

                            <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-muted-foreground uppercase tracking-tighter">Value</span>
                                    <span className="text-foreground">{fmt(value)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-muted-foreground uppercase tracking-tighter">Profit</span>
                                    <span className={getPnLColor(pnl)}>{formatPnLPrefix(pnl)}{fmt(pnl)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center bg-white/5 -mx-4 -mb-4 p-4 rounded-b-3xl">
                        <div className="flex gap-1.5 overflow-hidden">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-secondary/50 shadow-sm border border-white/5 uppercase">{item.quantity}x</span>
                            {item.language && item.language !== 'EN' && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">{item.language}</span>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                             <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="p-2 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                            >
                                <Edit2 size={12} />
                            </button>
                            <Link 
                                href={`/app/cards/${item.cardId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all marine-glow"
                            >
                                <MessageSquare size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </HoloCard>
        </div>
    );
}
