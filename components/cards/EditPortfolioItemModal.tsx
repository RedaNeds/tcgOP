'use client';

import { useState, useEffect } from 'react';
import { updatePortfolioItem } from '@/lib/actions/portfolio';
import { useToast } from '@/components/ui/toast';
import { X } from 'lucide-react';
import { updatePortfolioItemSchema } from '@/lib/validations';

interface EditPortfolioItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        name: string;
        quantity: number;
        purchasePrice: number;
        condition?: string;
        language?: string;
        isGraded?: boolean;
        isForTrade?: boolean;
        certId?: string | null;
        gradingCompany?: string | null;
    };
    onSuccess?: () => void;
}

export function EditPortfolioItemModal({ isOpen, onClose, item, onSuccess }: EditPortfolioItemModalProps) {
    const [quantity, setQuantity] = useState(item.quantity.toString());
    const [purchasePrice, setPurchasePrice] = useState(item.purchasePrice.toString());
    const initialStatus = item.isGraded || (item.condition !== 'Raw' && item.condition !== 'Sealed') ? 'Graded' : (item.condition || 'Raw');
    const parsedCompany = item.gradingCompany || (initialStatus === 'Graded' && item.condition ? item.condition.split(' ')[0] : 'PSA');
    const parsedGrade = initialStatus === 'Graded' && item.condition && item.condition.includes(' ') ? item.condition.substring(item.condition.indexOf(' ') + 1) : '10';

    const [cardStatus, setCardStatus] = useState(initialStatus);
    const [language] = useState(item.language || 'EN');
    const [certId, setCertId] = useState(item.certId || '');
    const [gradingCompany, setGradingCompany] = useState(parsedCompany);
    const [grade, setGrade] = useState(parsedGrade);
    const [isForTrade, setIsForTrade] = useState(Boolean(item.isForTrade));
 
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Escape key handler
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const data = {
            quantity: parseInt(quantity, 10),
            purchasePrice: parseFloat(purchasePrice),
            condition: cardStatus === 'Graded' ? `${gradingCompany} ${grade}`.trim() : cardStatus,
            language,
            isGraded: cardStatus === 'Graded',
            isForTrade,
            certId: cardStatus === 'Graded' && certId ? certId : undefined,
            gradingCompany: cardStatus === 'Graded' && gradingCompany ? gradingCompany : undefined
        };

        const validation = updatePortfolioItemSchema.safeParse(data);
        if (!validation.success) {
            setErrors(validation.error.flatten().fieldErrors as any);
            toast('Please check the form for errors', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updatePortfolioItem(item.id, data);
 
            if (result.success) {
                toast('Portfolio updated successfully', 'success');
                onSuccess?.();
                onClose();
            } else {
                toast(result.error || 'Failed to update portfolio', 'error');
                if (result.details) setErrors(result.details as any);
            }
        } catch {
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
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground" aria-label="Close modal">
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
                            disabled={isSubmitting}
                            className={`w-full bg-background border ${errors.quantity ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium`}
                            required
                        />
                        {errors.quantity && <p className="text-xs text-red-500 mt-1 font-bold">{errors.quantity[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Average Cost per Card ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            disabled={isSubmitting}
                            className={`w-full bg-background border ${errors.purchasePrice ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium`}
                            required
                        />
                        {errors.purchasePrice && <p className="text-xs text-red-500 mt-1 font-bold">{errors.purchasePrice[0]}</p>}
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={isForTrade}
                                onChange={(e) => setIsForTrade(e.target.checked)}
                                className="h-4 w-4 rounded border-border"
                            />
                            Mark this asset as for trade
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Card Status</label>
                        <select
                            value={cardStatus}
                            onChange={(e) => setCardStatus(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                        >
                            <option value="Raw">Raw (Ungraded)</option>
                            <option value="Graded">Graded</option>
                            <option value="Sealed">Sealed Product</option>
                        </select>
                    </div>

                    {cardStatus === 'Graded' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Grading Company</label>
                                    <select
                                        value={gradingCompany}
                                        onChange={(e) => setGradingCompany(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                                    >
                                        <option value="PSA">PSA</option>
                                        <option value="BGS">Beckett (BGS)</option>
                                        <option value="CGC">CGC</option>
                                        <option value="PCG">PCG</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                                    >
                                        <option value="10">10 (Pristine/Gem Mint)</option>
                                        <option value="9.5">9.5 (Mint+)</option>
                                        <option value="9">9 (Mint)</option>
                                        <option value="8.5">8.5 (NM-MT+)</option>
                                        <option value="8">8 (NM-MT)</option>
                                        <option value="7">7 (NM)</option>
                                        <option value="6">6 (EX-MT)</option>
                                        <option value="5">5 (EX)</option>
                                        <option value="4">4 (VG-EX)</option>
                                        <option value="3">3 (VG)</option>
                                        <option value="2">2 (Good)</option>
                                        <option value="1">1 (Poor)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Certificate ID</label>
                                <input
                                    type="text"
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                    placeholder="e.g. 12345678"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>
                    )}
                    
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
