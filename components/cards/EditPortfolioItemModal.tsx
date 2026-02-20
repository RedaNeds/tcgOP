'use client';

import { useState } from 'react';
import { updatePortfolioItem } from '@/lib/actions/portfolio';
import { useToast } from '@/components/ui/toast';
import { X } from 'lucide-react';

interface EditPortfolioItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        name: string;
        quantity: number;
        purchasePrice: number;
    };
    onSuccess?: () => void;
}

export function EditPortfolioItemModal({ isOpen, onClose, item, onSuccess }: EditPortfolioItemModalProps) {
    const [quantity, setQuantity] = useState(item.quantity.toString());
    const [purchasePrice, setPurchasePrice] = useState(item.purchasePrice.toString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const qty = parseInt(quantity, 10);
        const price = parseFloat(purchasePrice);

        if (isNaN(qty) || qty <= 0) {
            toast('Quantity must be a positive number', 'error');
            return;
        }

        if (isNaN(price) || price < 0) {
            toast('Price must be a valid number', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updatePortfolioItem(item.id, {
                quantity: qty,
                purchasePrice: price
            });

            if (result.success) {
                toast('Portfolio updated successfully', 'success');
                onSuccess?.();
                onClose();
            } else {
                toast(result.error || 'Failed to update portfolio', 'error');
            }
        } catch (error) {
            toast('An unexpected error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-foreground" onClick={onClose}>
            <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-2xl border border-border/50" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit Asset</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Update your holdings</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Average Cost per Card ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl font-medium transition-all shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
