'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card } from '@/types';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addToPortfolio } from '@/lib/actions/portfolio';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { addToPortfolioSchema } from '@/lib/validations';
import { GRADE_OPTIONS, LANGUAGE_OPTIONS, CARD_STATUS_OPTIONS, GRADING_COMPANY_OPTIONS } from '@/lib/constants';

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

export function AddCardModal({ isOpen, onClose, card }: AddCardModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState<string>(card?.currentPrice.toString() || '0');

    // New Advanced Fields
    const [cardStatus, setCardStatus] = useState('Raw'); // Raw, Graded, Sealed
    const [language, setLanguage] = useState('EN');
    const [gradingCompany, setGradingCompany] = useState('PSA');
    const [grade, setGrade] = useState('10');
    const [certId, setCertId] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Escape key handler
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Reset state when card changes
    if (!isOpen) return null;

    const handleSave = async () => {
        if (!card) return;
        setErrors({});
        setIsSubmitting(true);

        const payload = [{
            cardId: card.id,
            quantity: Number(quantity),
            purchasePrice: Number(price),
            condition: cardStatus === 'Graded' ? `${gradingCompany} ${grade}`.trim() : cardStatus,
            language,
            isGraded: cardStatus === 'Graded',
            certId: cardStatus === 'Graded' && certId ? certId : undefined,
            gradingCompany: cardStatus === 'Graded' && gradingCompany ? gradingCompany : undefined
        }];

        const validation = addToPortfolioSchema.safeParse(payload);
        if (!validation.success) {
            setErrors(validation.error.flatten().fieldErrors as any);
            setIsSubmitting(false);
            toast('Please check the form for errors', 'error');
            return;
        }

        try {
            const result = await addToPortfolio(payload);

            if (result.success) {
                toast('Card added to portfolio', 'success');
                onClose();
                router.refresh();
            } else {
                toast(result.error || 'Failed to add card', 'error');
                if (result.details) setErrors(result.details as any);
            }
        } catch (error) {
            console.error('Failed to add card:', error);
            toast('Failed to add card', 'error');
        } finally {
            setIsSubmitting(false);
        }
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
                    aria-labelledby="add-card-title"
                    className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 id="add-card-title" className="text-xl font-bold">Add to Portfolio</h2>
                            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors" aria-label="Close modal">
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
                                <label htmlFor="ac-quantity" className="text-sm font-medium text-muted-foreground mb-1 block">Quantity</label>
                                <div className="flex gap-2">
                                    <button
                                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >-</button>
                                    <div id="ac-quantity" className="flex-1 flex items-center justify-center font-bold bg-secondary/20 rounded-lg">
                                        {quantity}
                                    </div>
                                    <button
                                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-50"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={isSubmitting}
                                    >+</button>
                                </div>
                                {errors['0.quantity'] && <p className="text-xs text-red-500 mt-1 font-bold">{errors['0.quantity'][0]}</p>}
                            </div>

                            <div>
                                <label htmlFor="ac-price" className="text-sm font-medium text-muted-foreground mb-1 block">Purchase Price (Per Card)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <input
                                        id="ac-price"
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        disabled={isSubmitting}
                                        className={`w-full bg-secondary/20 border ${errors['0.purchasePrice'] ? 'border-red-500' : 'border-border'} rounded-lg pl-8 p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50`}
                                    />
                                </div>
                                {errors['0.purchasePrice'] && <p className="text-xs text-red-500 mt-1 font-bold">{errors['0.purchasePrice'][0]}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ac-status" className="text-sm font-medium text-muted-foreground mb-1 block">Card Status</label>
                                    <select
                                        id="ac-status"
                                        value={cardStatus}
                                        onChange={(e) => setCardStatus(e.target.value)}
                                        className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    >
                                        {CARD_STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="ac-language" className="text-sm font-medium text-muted-foreground mb-1 block">Language</label>
                                    <select
                                        id="ac-language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                    >
                                        {LANGUAGE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {cardStatus === 'Graded' && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ac-grading-company" className="text-sm font-medium text-muted-foreground mb-1 block">Grading Company</label>
                                            <select
                                                id="ac-grading-company"
                                                value={gradingCompany}
                                                onChange={(e) => setGradingCompany(e.target.value)}
                                                className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                            >
                                                {GRADING_COMPANY_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="ac-grade" className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
                                            <select
                                                id="ac-grade"
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                                className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                            >
                                                {GRADE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="ac-cert-id" className="text-sm font-medium text-muted-foreground mb-1 block">Certificate ID (Optional)</label>
                                        <input
                                            id="ac-cert-id"
                                            type="text"
                                            value={certId}
                                            onChange={(e) => setCertId(e.target.value)}
                                            placeholder="e.g. 12345678"
                                            className="w-full bg-secondary/20 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                        />
                                    </div>
                                </div>
                            )}
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
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 rounded-lg font-black bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Add Asset'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
