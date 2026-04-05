'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { WishlistItemWithCard, updateWishlistItem } from '@/lib/actions/wishlist';
import { useToast } from '@/components/ui/toast';

interface EditWishlistItemModalProps {
    isOpen: boolean;
    item: WishlistItemWithCard;
    onClose: () => void;
    onSuccess?: () => void;
    onMarkAcquired?: () => void;
}

export function EditWishlistItemModal({ isOpen, item, onClose, onSuccess, onMarkAcquired }: EditWishlistItemModalProps) {
    const [targetPrice, setTargetPrice] = useState(item.targetPrice.toString());
    const [notes, setNotes] = useState(item.notes || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(targetPrice);
        if (Number.isNaN(price) || price < 0) {
            toast('Target price must be a valid positive number', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateWishlistItem(item.id, price, notes.trim() || undefined);
            if (result.success) {
                toast('Wishlist target updated', 'success');
                onSuccess?.();
                onClose();
            } else {
                toast(result.error || 'Failed to update wishlist item', 'error');
            }
        } catch {
            toast('Unexpected error while updating wishlist item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Edit Wishlist Item</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors" aria-label="Close modal">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm mb-4">
                    <span className="font-bold">{item.card.name}</span>
                    <span className="text-muted-foreground"> ({item.card.code})</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Target Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onMarkAcquired}
                            className="flex-1 bg-green-500 text-white hover:bg-green-600 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={16} /> Mark Acquired
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
