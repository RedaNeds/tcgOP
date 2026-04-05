'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { updatePortfolioItem } from '@/lib/actions/portfolio';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { updatePortfolioItemSchema } from '@/lib/validations';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useCurrency } from '@/lib/hooks/use-currency';
import { PortfolioItem } from '@/types';
import { GRADE_OPTIONS, LANGUAGE_OPTIONS, CARD_STATUS_OPTIONS, GRADING_COMPANY_OPTIONS } from '@/lib/constants';
import { getTCGPlayerUrl, getCardmarketUrl, getEbayUrl } from '@/lib/marketplace';

interface CardDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: PortfolioItem | null;
}

export function CardDetailsModal({ isOpen, onClose, item }: CardDetailsModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { format: fmt } = useCurrency();

    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('0');
    const [cardStatus, setCardStatus] = useState('Raw');
    const [language, setLanguage] = useState('EN');
    const [gradingCompany, setGradingCompany] = useState('PSA');
    const [grade, setGrade] = useState('10');
    const [certId, setCertId] = useState('');
    
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize state from item
    useEffect(() => {
        if (item) {
            setQuantity(item.quantity?.toString() || '1');
            setPrice(item.purchasePrice?.toString() || '0');
            
            const initialStatus = item.isGraded || (item.condition !== 'Raw' && item.condition !== 'Sealed') ? 'Graded' : (item.condition || 'Raw');
            setCardStatus(initialStatus);
            setLanguage(item.language || 'EN');
            
            const parsedCompany = item.gradingCompany || (initialStatus === 'Graded' && item.condition ? item.condition.split(' ')[0] : 'PSA');
            const parsedGrade = initialStatus === 'Graded' && item.condition && item.condition.includes(' ') ? item.condition.substring(item.condition.indexOf(' ') + 1) : '10';
            
            setGradingCompany(parsedCompany);
            setGrade(parsedGrade);
            setCertId(item.certId || '');
            
            setIsEditing(false); // Default to viewing info
            setErrors({});
        }
    }, [item, isOpen]);

    // Escape key handler
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !item) return null;

    const currentPrice = item.currentPrice || 0;
    const purchasePriceNum = item.purchasePrice || 0;
    const value = item.quantity * currentPrice;
    const cost = item.quantity * purchasePriceNum;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const isPositive = pnl >= 0;

    const handleSave = async () => {
        setErrors({});
        setIsSubmitting(true);

        const data = {
            quantity: parseInt(quantity, 10),
            purchasePrice: parseFloat(price),
            condition: cardStatus === 'Graded' ? `${gradingCompany} ${grade}`.trim() : cardStatus,
            language,
            isGraded: cardStatus === 'Graded',
            certId: cardStatus === 'Graded' && certId ? certId : undefined,
            gradingCompany: cardStatus === 'Graded' && gradingCompany ? gradingCompany : undefined
        };

        const validation = updatePortfolioItemSchema.safeParse(data);
        if (!validation.success) {
            setErrors(validation.error.flatten().fieldErrors as any);
            setIsSubmitting(false);
            toast('Please check the form for errors', 'error');
            return;
        }

        try {
            const result = await updatePortfolioItem(item.id, data);

            if (result.success) {
                toast('Asset details updated successfully', 'success');
                setIsEditing(false);
                router.refresh();
            } else {
                toast(result.error || 'Failed to update asset', 'error');
                if (result.details) setErrors(result.details as any);
            }
        } catch (error) {
            console.error('Failed to update asset:', error);
            toast('Failed to update asset', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="card-details-title"
                    className="bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header Image Background Overlay */}
                    <div className="relative h-32 w-full bg-secondary/20 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                        <div className="absolute inset-0 opacity-20 blur-xl">
                            <Image src={item.image} alt="blur bg" fill className="object-cover" />
                        </div>
                        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors backdrop-blur-md" aria-label="Close modal">
                            <X size={20} className="text-white" />
                        </button>
                    </div>

                    <div className="px-8 pb-8 -mt-16 relative z-20 flex-1 overflow-y-auto">
                        <div className="flex gap-6 items-end mb-8 block md:flex">
                            <div className="w-28 h-40 bg-muted rounded-xl overflow-hidden relative shadow-2xl shadow-black/50 border border-white/10 shrink-0 mx-auto md:mx-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="pb-2 text-center md:text-left mt-4 md:mt-0 flex-1">
                                <h2 id="card-details-title" className="text-2xl font-black leading-tight mb-1">{item.name}</h2>
                                <p className="text-sm font-bold text-muted-foreground">{item.set} • {item.rarity}</p>
                                <p className="text-[10px] font-black tracking-widest bg-secondary/50 inline-block px-2 py-1 rounded mt-2 uppercase">{item.code}</p>
                            </div>
                        </div>

                        {/* Toggle Bar */}
                        <div className="flex p-1 bg-secondary/30 rounded-xl mb-6 shrink-0">
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isEditing ? 'bg-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isEditing ? 'bg-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Edit Portfolio
                            </button>
                        </div>

                        {!isEditing ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-secondary/20 border border-white/5 rounded-2xl p-4">
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                                        <p className="text-2xl font-black">{fmt(value)}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                {isPositive ? '▲' : '▼'}{Math.abs(pnlPct).toFixed(1)}%
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium">All time</span>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/20 border border-white/5 rounded-2xl p-4">
                                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Holdings</p>
                                        <p className="text-2xl font-black">{item.quantity} <span className="text-sm text-muted-foreground font-bold">units</span></p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Avg Cost: {fmt(purchasePriceNum)}</p>
                                    </div>
                                </div>

                                {/* Price History Chart */}
                                {item.history && item.history.length > 0 && (
                                    <div className="bg-secondary/20 border border-white/5 rounded-2xl p-4 h-48">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Market Trend</p>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                                <TrendingUp size={12} /> Live
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height="80%">
                                            <LineChart data={item.history}>
                                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                                    itemStyle={{ color: 'white', fontWeight: 'bold' }}
                                                    formatter={(value: number | undefined) => [fmt(Number(value ?? 0)), 'Price']}
                                                    labelStyle={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="#60A5FA" 
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6, fill: '#60A5FA', stroke: '#1E3A8A', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Condition Details */}
                                <div className="bg-secondary/20 border border-white/5 rounded-2xl p-4 flex gap-4 text-sm font-medium">
                                    <Info className="text-blue-400 shrink-0" size={18} />
                                    <div>
                                        <p className="text-white">Registered as <span className="font-bold">{item.condition}</span> ({item.language})</p>
                                        {item.isGraded && item.certId && (
                                            <p className="text-muted-foreground text-xs mt-1">Cert ID: {item.certId}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Marketplace Links */}
                                <div className="bg-secondary/20 border border-white/5 rounded-2xl p-4">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Buy / Compare</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <a
                                            href={getTCGPlayerUrl(item.name, item.code)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-xs font-bold"
                                        >
                                            <ExternalLink size={12} /> TCGPlayer
                                        </a>
                                        <a
                                            href={getCardmarketUrl(item.name, item.code)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors text-xs font-bold"
                                        >
                                            <ExternalLink size={12} /> Cardmarket
                                        </a>
                                        <a
                                            href={getEbayUrl(item.name, item.code)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-xs font-bold"
                                        >
                                            <ExternalLink size={12} /> eBay
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                {/* Edit Form */}
                                <div>
                                    <label htmlFor="cd-quantity" className="text-sm font-medium text-muted-foreground mb-1 block">Quantity</label>
                                    <div className="flex gap-2">
                                        <button
                                            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary bg-secondary/30"
                                            onClick={() => setQuantity(Math.max(1, parseInt(quantity || '1') - 1).toString())}
                                        >-</button>
                                        <input 
                                            id="cd-quantity"
                                            type="number" 
                                            className="flex-1 text-center font-bold bg-secondary/20 rounded-xl border border-white/5 focus:ring-2 focus:ring-primary/50 outline-none" 
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                        <button
                                            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary bg-secondary/30"
                                            onClick={() => setQuantity((parseInt(quantity || '1') + 1).toString())}
                                        >+</button>
                                    </div>
                                    {errors.quantity && <p className="text-xs text-red-500 mt-1 font-bold">{errors.quantity[0]}</p>}
                                </div>

                                <div>
                                    <label htmlFor="cd-price" className="text-sm font-medium text-muted-foreground mb-1 block">Average Cost per Card ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                        <input
                                            id="cd-price"
                                            type="number"
                                            step="0.01"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className={`w-full bg-secondary/20 border ${errors.purchasePrice ? 'border-red-500' : 'border-white/5'} rounded-xl pl-8 p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium`}
                                        />
                                    </div>
                                    {errors.purchasePrice && <p className="text-xs text-red-500 mt-1 font-bold">{errors.purchasePrice[0]}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="cd-status" className="text-sm font-medium text-muted-foreground mb-1 block">Card Status</label>
                                        <select
                                            id="cd-status"
                                            value={cardStatus}
                                            onChange={(e) => setCardStatus(e.target.value)}
                                            className="w-full bg-secondary/20 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                                        >
                                            {CARD_STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="cd-language" className="text-sm font-medium text-muted-foreground mb-1 block">Language</label>
                                        <select
                                            id="cd-language"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full bg-secondary/20 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                                        >
                                            {LANGUAGE_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {cardStatus === 'Graded' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="col-span-2 grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="cd-grading-company" className="text-sm font-medium text-muted-foreground mb-1 block">Grading Company</label>
                                                <select
                                                    id="cd-grading-company"
                                                    value={gradingCompany}
                                                    onChange={(e) => setGradingCompany(e.target.value)}
                                                    className="w-full bg-secondary/20 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                                                >
                                                    {GRADING_COMPANY_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="cd-grade" className="text-sm font-medium text-muted-foreground mb-1 block">Grade</label>
                                                <select
                                                    id="cd-grade"
                                                    value={grade}
                                                    onChange={(e) => setGrade(e.target.value)}
                                                    className="w-full bg-secondary/20 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                                                >
                                                    {GRADE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label htmlFor="cd-cert-id" className="text-sm font-medium text-muted-foreground mb-1 block">Certificate ID (Optional)</label>
                                            <input
                                                id="cd-cert-id"
                                                type="text"
                                                value={certId}
                                                onChange={(e) => setCertId(e.target.value)}
                                                placeholder="e.g. 12345678"
                                                className="w-full bg-secondary/20 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-4 border-t border-white/5 flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 rounded-xl font-medium hover:bg-secondary/50 transition-colors border border-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 rounded-xl font-black bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Save Updates'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
