'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '@/types';
import { useState } from 'react';
import Image from 'next/image';
import { addToPortfolio } from '@/lib/actions/portfolio';
import { useToast } from '@/components/ui/toast';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

export function AddCardModal({ isOpen, onClose, card }: AddCardModalProps) {
    const { toast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<string>(card?.price.toString() || '0');
    // Reset state when card changes
    if (!isOpen) return null;

    const handleSave = async () => {
        if (!card) return;

        try {
            await addToPortfolio([{
                cardId: card.id,
                quantity: Number(quantity),
                purchasePrice: Number(price),
            }]);

            toast('Card added to portfolio', 'success');
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Failed to add card:', error);
            toast('Failed to add card', 'error');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add to Portfolio</h2>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {card && (
                            <div className="flex gap-4 mb-6">

                                <div className="w-20 h-28 bg-muted rounded-lg overflow-hidden relative">
                                    <Image
                                        src={card.image}
                                        alt={card.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{card.name}</p>
                                    <p className="text-sm text-muted-foreground">{card.set} • {card.rarity}</p>
                                    <p className="text-sm font-bg bg-secondary/50 inline-block px-2 py-1 rounded mt-2">{card.code}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Quantity</label>
                                <div className="flex gap-2">
                                    <button
                                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >-</button>
                                    <div className="flex-1 flex items-center justify-center font-bold bg-secondary/20 rounded-lg">
                                        {quantity}
                                    </div>
                                    <button
                                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >+</button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Price (Per Card)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-secondary/20 border border-border rounded-lg pl-8 p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-border flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            >
                                Add Asset
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
