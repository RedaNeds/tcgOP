'use client';

import { useState } from 'react';
import { convertWishlistToPortfolio } from '@/lib/actions/wishlist';
import { useToast } from '@/components/ui/toast';
import { X, CheckCircle } from 'lucide-react';
import { WishlistItemWithCard } from '@/lib/actions/wishlist';

interface ConvertToPortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: WishlistItemWithCard;
    onSuccess?: () => void;
}

export function ConvertToPortfolioModal({ isOpen, onClose, item, onSuccess }: ConvertToPortfolioModalProps) {
    const [quantity, setQuantity] = useState('1');
    const [purchasePrice, setPurchasePrice] = useState(item.card.currentPrice.toString());
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
            const result = await convertWishlistToPortfolio(item.id, qty, price);

            if (result.success) {
                toast('Card added to portfolio!', 'success');
                onSuccess?.();
                onClose();
            } else {
                toast(result.error || 'Failed to convert item', 'error');
            }
        } catch (error) {
            toast('An unexpected error occurred', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-foreground" onClick={onClose}>
            <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-2xl border border-secondary" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={24} />
                        Acquired!
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="font-medium text-sm">Add <span className="text-primary font-bold">{item.card.name}</span> to your portfolio.</p>
                    <p className="text-xs text-muted-foreground mt-1">This will also remove it from your wishlist.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Quantity Purchased</label>
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
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Price Paid per Card ($)</label>
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
                        className="w-full bg-green-500 text-white hover:bg-green-600 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {isSubmitting ? 'Adding...' : 'Confirm Purchase'}
                    </button>
                </form>
            </div>
        </div>
    );
}
