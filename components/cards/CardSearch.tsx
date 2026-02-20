'use client';

import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { searchCards } from '@/lib/optcg';
import { Card } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Simple debounce hook inline to avoid extra file for now
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface CardSearchProps {
    onSelect: (card: Card) => void;
}

export function CardSearch({ onSelect }: CardSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounceValue(query, 500);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        async function fetch() {
            setLoading(true);
            try {
                const data = await searchCards(debouncedQuery);
                setResults(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [debouncedQuery]);

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search card (e.g. 'Luffy')..."
                    className="w-full bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute w-full mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[300px] overflow-y-auto"
                    >
                        {results.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => {
                                    onSelect(card);
                                    setQuery('');
                                    setResults([]);
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                            >

                                <div className="w-8 h-10 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                    {/* Placeholder if image fails */}
                                    <div className="absolute inset-0 bg-gray-800" />
                                    {card.image && (
                                        <Image
                                            src={card.image}
                                            alt={card.name}
                                            fill
                                            className="object-cover relative z-10"
                                            unoptimized
                                        />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{card.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="bg-secondary px-1 rounded">{card.code}</span>
                                        <span>{card.set}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-500">${card.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
