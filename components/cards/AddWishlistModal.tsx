'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { Card } from '@/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addToWishlist } from '@/lib/actions/wishlist';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/lib/hooks/use-currency';

interface AddWishlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

export function AddWishlistModal({ isOpen, onClose, card }: AddWishlistModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { format: formatCurrency } = useCurrency();
    
    // Default to 10% below market price if card exists
    const defaultPrice = card ? (card.currentPrice * 0.9).toFixed(2) : '0';
    
    const [price, setPrice] = useState<string>(defaultPrice);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when card changes
    useEffect(() => {
        if (card && isOpen) {
            setPrice((card.currentPrice * 0.9).toFixed(2));
            setNotes('');
        }
    }, [card, isOpen]);

    // Escape key handler
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !card) return null;

    const handleSave = async () => {
        if (!price || isNaN(Number(price))) {
            toast('Please enter a valid target price', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await addToWishlist(card.id, Number(price), notes);

            if (result.success) {
                toast(`${card.name} added to wishlist!`, 'success');
                onClose();
                router.refresh(); // Refresh to update wishlist counts
            } else {
                toast(result.error || 'Failed to add to wishlist', 'error');
            }
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            toast('Failed to add to wishlist', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const setQuickPrice = (multiplier: number) => {
        setPrice((card.currentPrice * multiplier).toFixed(2));
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="wishlist-modal-title"
                    className="bg-background border border-border/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/10">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-500/20 text-rose-500 p-2 rounded-xl">
                                <Target size={20} />
                            </div>
                            <div>
                                <h2 id="wishlist-modal-title" className="text-xl font-bold">Target Alert</h2>
                                <p className="text-sm text-muted-foreground">Add to Wishlist</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                        {/* Card Summary */}
                        <div className="flex gap-4 mb-8 bg-card rounded-xl p-4 border border-border/50 shadow-sm">
                            <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                                <Image
                                    src={card.image || '/card-placeholder.svg'}
                                    alt={card.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                                        {card.rarity}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        {card.code}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg leading-tight">{card.name}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{card.set}</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            {/* Market Price Ref */}
                            <div className="flex items-center justify-between glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
                                <span className="text-sm text-blue-400 font-medium">Current Market Price</span>
                                <span className="font-bold text-xl text-blue-400">{formatCurrency(card.currentPrice)}</span>
                            </div>

                            {/* Target Price Input */}
                            <div>
                                <label htmlFor="wl-price" className="text-sm font-medium text-foreground mb-2 block">
                                    Target Alert Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                    <input
                                        id="wl-price"
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        disabled={isSubmitting}
                                        className="w-full bg-secondary/20 border border-border rounded-xl pl-8 p-3.5 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 font-mono text-lg transition-all"
                                    />
                                </div>
                                
                                {/* Quick actions */}
                                <div className="flex gap-2 mt-3">
                                    <button 
                                        onClick={() => setQuickPrice(1)}
                                        className="flex-1 text-xs py-1.5 rounded bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium border border-transparent hover:border-border"
                                    >
                                        Market Price
                                    </button>
                                    <button 
                                        onClick={() => setQuickPrice(0.9)}
                                        className="flex-1 text-xs py-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors font-medium border border-rose-500/20"
                                    >
                                        -10% Drop
                                    </button>
                                    <button 
                                        onClick={() => setQuickPrice(0.8)}
                                        className="flex-1 text-xs py-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors font-medium border border-rose-500/20"
                                    >
                                        -20% Drop
                                    </button>
                                </div>
                            </div>

                            {/* Notes Textarea */}
                            <div>
                                <label htmlFor="wl-notes" className="text-sm font-medium text-foreground mb-2 block">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="wl-notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="e.g. Wait for reprint, mint condition only..."
                                    rows={3}
                                    className="w-full bg-secondary/20 border border-border rounded-xl p-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-sm transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl font-black bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Set Target Alert'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
