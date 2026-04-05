'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CreditCard, Folder, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchCards } from '@/lib/optcg';
import { CardImage } from '@/components/ui/CardImage';
import { useCurrency } from '@/lib/hooks/use-currency';

interface CommandMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const { format } = useCurrency();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const searchResults = await searchCards(query);
                setResults(searchResults.slice(0, 8)); // Limit to 8 results
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    const handleSelect = useCallback((cardId: string) => {
        router.push(`/cards/${cardId}`);
        onClose();
    }, [router, onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (results.length === 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex].id);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, handleSelect, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />
                    <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-[201] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="bg-card/80 backdrop-blur-xl border border-border/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden pointer-events-auto mx-4"
                        >
                            <div className="p-4 border-b border-border/50 flex items-center gap-4">
                                <Search className="text-muted-foreground" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search cards, sets, or actions... (Esc to close)"
                                    className="bg-transparent border-none outline-none flex-1 text-lg font-medium placeholder:text-muted-foreground/50"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {isLoading ? (
                                    <Loader2 className="animate-spin text-primary" size={20} />
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded text-[10px] font-bold text-muted-foreground border border-border/50">
                                        ESC
                                    </div>
                                )}
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="p-2">
                                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                            Cards Found
                                        </div>
                                        {results.map((card, index) => (
                                            <button
                                                key={card.id}
                                                onClick={() => handleSelect(card.id)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${
                                                    index === selectedIndex 
                                                    ? 'bg-primary/20 border border-primary/30 shadow-inner' 
                                                    : 'hover:bg-secondary/40 border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-14 relative rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                        <CardImage src={card.image} alt={card.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-black text-sm flex items-center gap-2">
                                                            {card.name}
                                                            <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                                                                {card.code}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            {card.rarity} · {card.set}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-blue-500">
                                                        {format(card.currentPrice || 0)}
                                                    </div>
                                                    {index === selectedIndex && (
                                                        <div className="text-[10px] font-black uppercase text-primary mt-1 flex items-center gap-1 justify-end">
                                                            Select <ChevronRight size={10} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : query.length >= 2 ? (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <Search size={40} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-bold">No results found for &quot;{query}&quot;</p>
                                        <p className="text-sm mt-1">Try searching for a card code like &quot;OP01-001&quot;</p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                                Quick Navigation
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <QuickNavButton 
                                                    icon={<TrendingUp size={16} />} 
                                                    label="Portfolio" 
                                                    shortcut="G P"
                                                    onClick={() => { router.push('/portfolio'); onClose(); }}
                                                />
                                                <QuickNavButton 
                                                    icon={<Zap size={16} />} 
                                                    label="Catalog" 
                                                    shortcut="G C"
                                                    onClick={() => { router.push('/cards'); onClose(); }}
                                                />
                                                <QuickNavButton 
                                                    icon={<CreditCard size={16} />} 
                                                    label="Wishlist" 
                                                    shortcut="G W"
                                                    onClick={() => { router.push('/wishlist'); onClose(); }}
                                                />
                                                <QuickNavButton 
                                                    icon={<Folder size={16} />} 
                                                    label="Allocation" 
                                                    shortcut="G B"
                                                    onClick={() => { router.push('/allocation'); onClose(); }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-secondary/30 p-3 flex justify-between items-center px-6">
                                <div className="flex gap-4">
                                    <Tip kbd="↑↓" label="Navigate" />
                                    <Tip kbd="ENTER" label="Select" />
                                    <Tip kbd="ESC" label="Close" />
                                </div>
                                <div className="text-[10px] font-black text-muted-foreground/50 tracking-tighter italic">
                                    TOP NOTCH SEARCH v1.0
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

function QuickNavButton({ icon, label, shortcut, onClick }: { icon: any, label: string, shortcut: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 hover:bg-secondary/80 border border-border/50 transition-all text-left"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-xl border border-border/50 text-muted-foreground">
                    {icon}
                </div>
                <span className="font-bold text-sm">{label}</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">
                {shortcut}
            </span>
        </button>
    );
}

function Tip({ kbd, label }: { kbd: string, label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="bg-background border border-border/50 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-muted-foreground">
                {kbd}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">{label}</span>
        </div>
    );
}
