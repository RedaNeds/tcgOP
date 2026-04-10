'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { PortfolioItem } from '@/types';
import { 
    Search, 
    Trash2, 
    Filter, 
    Download, 
    Upload, 
    ChevronLeft, 
    ChevronRight, 
    LayoutGrid, 
    List,
    CheckSquare,
    Square
} from 'lucide-react';
import { 
    removeFromPortfolio, 
    bulkRemoveFromPortfolio, 
    addToPortfolio,
    updatePortfolioItem
} from '@/lib/actions/portfolio';
import { 
    createBinder, 
    updateBinder 
} from '@/lib/actions/binders';
import { CardImage } from '@/components/ui/CardImage';
import { useCurrency } from '@/lib/hooks/use-currency';
import { useToast } from '@/components/ui/toast';
import { searchCards } from '@/lib/optcg';
import { format as formatDate } from 'date-fns';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Shared Utilities & Hooks
import { usePortfolioFilters, BinderWithItems } from '@/lib/hooks/use-portfolio-filters';
import { getPnLColor, formatPnLPrefix, calculatePnL } from '@/lib/utils/calculations';

// Extracted Sub-Components
import { PortfolioStats } from '@/components/dashboard/PortfolioStats';
import { PortfolioGridItem } from '@/components/dashboard/PortfolioGridItem';

// Dynamic Imports for Modals
const AddCardModal = dynamic(() => import('@/components/cards/AddCardModal').then((mod) => mod.AddCardModal), { ssr: false });
const EditPortfolioItemModal = dynamic(() => import('@/components/cards/EditPortfolioItemModal').then((mod) => mod.EditPortfolioItemModal), { ssr: false });
const BinderModal = dynamic(() => import('@/components/dashboard/BinderModal').then((mod) => mod.BinderModal), { ssr: false });
const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal').then((mod) => mod.ConfirmModal), { ssr: false });

interface PortfolioClientProps {
    initialItems: PortfolioItem[];
    initialBinders?: BinderWithItems[];
}

export function PortfolioClient({ initialItems, initialBinders = [] }: PortfolioClientProps) {
    const [items, setItems] = useState(initialItems);
    const [binders, setBinders] = useState(initialBinders);
    const router = useRouter();
    const { format: fmt } = useCurrency();
    const { toast } = useToast();

    // Logic extraction to custom hook
    const {
        search, setSearch,
        filterSet, setFilterSet,
        filterRarity, setFilterRarity,
        filterPnL, setFilterPnL,
        activeBinderId, setActiveBinderId,
        uniqueSets, uniqueRarities,
        filteredItems, sortedItems,
        handleSort, clearFilters
    } = usePortfolioFilters(items, binders);

    useEffect(() => {
        setItems(initialItems);
        setBinders(initialBinders);
    }, [initialItems, initialBinders]);

    // View State
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 25;

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBinderModalOpen, setIsBinderModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [editingBinder] = useState<BinderWithItems | null>(null);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [inlineEdits, setInlineEdits] = useState<Record<string, { quantity: number; purchasePrice: number }>>({});
    const [inlineErrors, setInlineErrors] = useState<Record<string, { quantity?: string; purchasePrice?: string }>>({});
    const [savingInlineId, setSavingInlineId] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'single' | 'bulk'; id?: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pagination Logic
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedItems.slice(startIndex, startIndex + pageSize);
    }, [sortedItems, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedItems.length / pageSize);

    // Handlers
    const handleSelectAll = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    };

    // Toggle a single item in/out of selection (used by checkbox buttons)
    const handleToggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectRow = (id: string, index?: number, event?: React.MouseEvent) => {
        if (event?.shiftKey && lastSelectedIndex !== null && index !== undefined) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const next = new Set(selectedIds);
            for (let i = start; i <= end; i++) {
                next.add(filteredItems[i].id);
            }
            setSelectedIds(next);
        } else if (event?.ctrlKey || event?.metaKey) {
            const next = new Set(selectedIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setSelectedIds(next);
        } else {
            const next = new Set([id]);
            setSelectedIds(next);
        }
        if (index !== undefined) setLastSelectedIndex(index);
    };

    const getInlineEditValues = (item: PortfolioItem) => {
        return inlineEdits[item.id] ?? { quantity: item.quantity, purchasePrice: item.purchasePrice };
    };

    const handleInlineFieldChange = (item: PortfolioItem, field: 'quantity' | 'purchasePrice', value: string) => {
        const current = getInlineEditValues(item);
        const parsed = field === 'quantity' ? parseInt(value || '0', 10) : parseFloat(value || '0');
        setInlineEdits((prev) => ({
            ...prev,
            [item.id]: {
                ...current,
                [field]: Number.isNaN(parsed) ? 0 : parsed,
            },
        }));
        setInlineErrors((prev) => ({
            ...prev,
            [item.id]: {
                ...(prev[item.id] || {}),
                [field]: undefined,
            },
        }));
    };

    const saveInlineEdit = async (item: PortfolioItem) => {
        const edit = inlineEdits[item.id];
        if (!edit) return;

        const errors: { quantity?: string; purchasePrice?: string } = {};
        if (edit.quantity < 1) errors.quantity = 'Min 1';
        if (edit.purchasePrice < 0) errors.purchasePrice = 'Min 0';
        if (Object.keys(errors).length > 0) {
            setInlineErrors((prev) => ({ ...prev, [item.id]: errors }));
            return;
        }

        if (edit.quantity === item.quantity && edit.purchasePrice === item.purchasePrice) return;

        setSavingInlineId(item.id);
        try {
            const result = await updatePortfolioItem(item.id, {
                quantity: edit.quantity,
                purchasePrice: edit.purchasePrice,
            });

            if (!result.success) {
                toast(result.error || 'Failed to update item', 'error');
                return;
            }

            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, quantity: edit.quantity, purchasePrice: edit.purchasePrice } : it)));
            setInlineEdits((prev) => {
                const next = { ...prev };
                delete next[item.id];
                return next;
            });
            setInlineErrors((prev) => {
                const next = { ...prev };
                delete next[item.id];
                return next;
            });
            toast('Item updated', 'success');
            router.refresh();
        } catch {
            toast('Failed to update item', 'error');
        } finally {
            setSavingInlineId(null);
        }
    };

    const executeDelete = async () => {
        if (!confirmAction) return;
        try {
            if (confirmAction.type === 'single' && confirmAction.id) {
                await removeFromPortfolio(confirmAction.id);
                setItems(prev => prev.filter(i => i.id !== confirmAction.id));
                toast('Card removed from portfolio', 'success');
            } else if (confirmAction.type === 'bulk') {
                const ids = Array.from(selectedIds) as string[];
                await bulkRemoveFromPortfolio(ids);
                setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
                setSelectedIds(new Set());
                toast(`${ids.length} cards removed from portfolio`, 'success');
            }
            router.refresh();
        } catch {
            toast('Failed to remove assets', 'error');
        }
        setConfirmAction(null);
    };

    const downloadCSV = () => {
        const targetItems = selectedIds.size > 0 ? items.filter(i => selectedIds.has(i.id)) : filteredItems;
        if (targetItems.length === 0) return;

        const headers = ['code', 'name', 'set', 'quantity', 'purchase_price', 'date_added'];
        const csvContent = [headers.join(','), ...targetItems.map(item => [
            item.code, `"${item.name.replace(/"/g, '""')}"`, `"${item.set.replace(/"/g, '""')}"`, item.quantity, item.purchasePrice, item.dateAdded
        ].join(','))].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `optcg_portfolio_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsImporting(true);
        setImportProgress(0);
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(l => l.trim());
            const dataLines = lines[0].toLowerCase().includes('code') ? lines.slice(1) : lines;
            
            const newItems: { cardId: string; quantity: number; purchasePrice: number }[] = [];
            for (let i = 0; i < dataLines.length; i++) {
                const parts = dataLines[i].trim().split(',');
                if (parts.length < 2) continue;
                const code = parts[0].trim();
                const results = await searchCards(code);
                const match = results.find(c => c.code === code) || results[0];
                if (match) newItems.push({ cardId: match.id, quantity: parseInt(parts[1]) || 1, purchasePrice: parseFloat(parts[2]) || 0 });
                setImportProgress(Math.round(((i + 1) / dataLines.length) * 100));
            }

            if (newItems.length > 0) {
                await addToPortfolio(newItems);
                toast(`Successfully imported ${newItems.length} items!`, 'success');
                router.refresh();
            }
        } catch { toast('Import failed', 'error'); } 
        finally { setIsImporting(false); setImportProgress(0); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleBinderSubmit = async (data: { name: string; description?: string; color?: string }) => {
        try {
            if (editingBinder) {
                await updateBinder(editingBinder.id, data);
                toast('Binder updated successfully', 'success');
            } else {
                await createBinder(data);
                toast('Binder created successfully', 'success');
            }
            router.refresh();
        } catch {
            toast('Failed to save binder', 'error');
        }
    };

    return (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 md:ml-64 p-8 overflow-y-auto pb-20 md:pb-8 space-y-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">My Collection</h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">{items.length} cards across {uniqueSets.length} sets</p>
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="glass hover:bg-secondary/40 text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"><Upload size={16} /> {isImporting ? `Importing ${importProgress}%` : 'Import'}</button>
                    <button onClick={downloadCSV} className="glass hover:bg-secondary/40 text-foreground px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm transition-all"><Download size={16} /> Export </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 ml-2">+ Add Card</button>
                </div>
            </header>

            <PortfolioStats items={sortedItems} />

            {/* Binder Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setActiveBinderId(null)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeBinderId === null ? 'bg-primary text-primary-foreground shadow-lg' : 'glass hover:bg-secondary/50'}`}>All Cards</button>
                <button onClick={() => setActiveBinderId('trade')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeBinderId === 'trade' ? 'bg-amber-500 text-white shadow-lg' : 'glass hover:bg-secondary/50'}`}>For Trade </button>
                {binders.map(b => (
                    <button key={b.id} onClick={() => setActiveBinderId(b.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeBinderId === b.id ? 'bg-primary/20 text-primary marine-glow border border-primary/50' : 'glass hover:bg-secondary/50'}`}>
                        {b.color && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />} {b.name}
                    </button>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-20 py-4 border-b border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search by name, code, or set..." className="w-full glass rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <div className="flex glass rounded-xl p-1 shrink-0">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}><LayoutGrid size={18} /></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
                    </div>
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${isFilterOpen ? 'bg-primary/20 text-primary marine-glow' : 'glass'}`}>
                        <Filter size={18} /> Filters {(filterSet !== 'All' || filterRarity !== 'All' || filterPnL !== 'All') && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-card border border-border p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div><label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Set</label><select className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={filterSet} onChange={(e) => setFilterSet(e.target.value)}><option value="All">All Sets</option>{uniqueSets.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            <div><label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Rarity</label><select className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)}><option value="All">All Rarities</option>{uniqueRarities.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                            <div><label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Performance</label><select className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={filterPnL} onChange={(e) => setFilterPnL(e.target.value)}><option value="All">All P&L</option><option value="Gain">In Gain (+)</option><option value="Loss">In Loss (-)</option></select></div>
                            <div className="flex items-end h-full"><button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 py-2">Clear all filters</button></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {paginatedItems.map(item => (
                            <PortfolioGridItem 
                                key={item.id} 
                                item={item} 
                                isSelected={selectedIds.has(item.id)}
                                onSelect={handleToggleSelect}
                                onRemove={(id) => setConfirmAction({ type: 'single', id })}
                                onEdit={setEditingItem}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm mb-20 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                <th className="p-4 w-10 text-center cursor-pointer" onClick={(e) => handleSelectAll(e)}>
                                    {selectedIds.size > 0 && selectedIds.size === filteredItems.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                </th>
                                <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>Card</th>
                                <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('set')}>Set</th>
                                <th className="p-4 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('quantity')}>Qty</th>
                                <th className="p-4 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('purchasePrice')}>Cost</th>
                                <th className="p-4 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('pnl')}>P&L</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {paginatedItems.map(item => {
                                const { pnl } = calculatePnL(item.quantity, item.purchasePrice, item.currentPrice || 0);
                                const isSelected = selectedIds.has(item.id);
                                return (
                                    <tr key={item.id} className={cn("hover:bg-muted/20 transition-all group cursor-pointer", isSelected && "bg-primary/5")} onClick={() => setEditingItem(item)}>
                                        <td className="p-4 text-center">
                                            <button onClick={(e) => { e.stopPropagation(); handleToggleSelect(item.id); }} aria-label={`Select ${item.name}`}>
                                                {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-14 relative rounded overflow-hidden border border-border/50"><CardImage src={item.image} alt={item.name} fill className="object-cover" /></div>
                                                <div><p className="font-bold text-sm tracking-tight">{item.name}</p><p className="text-[10px] text-muted-foreground uppercase">{item.code}</p></div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{item.set}</td>
                                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                min={1}
                                                value={getInlineEditValues(item).quantity}
                                                onChange={(e) => handleInlineFieldChange(item, 'quantity', e.target.value)}
                                                onBlur={() => saveInlineEdit(item)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveInlineEdit(item); } }}
                                                className={cn(
                                                    "w-16 text-center bg-secondary/30 border rounded px-2 py-1 text-xs font-black",
                                                    inlineErrors[item.id]?.quantity ? "border-red-500" : "border-border"
                                                )}
                                            />
                                            {inlineErrors[item.id]?.quantity && (
                                                <p className="text-[9px] text-red-400 mt-0.5">{inlineErrors[item.id].quantity}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={getInlineEditValues(item).purchasePrice}
                                                onChange={(e) => handleInlineFieldChange(item, 'purchasePrice', e.target.value)}
                                                onBlur={() => saveInlineEdit(item)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveInlineEdit(item); } }}
                                                className={cn(
                                                    "w-24 text-right bg-secondary/30 border rounded px-2 py-1 text-xs font-black",
                                                    inlineErrors[item.id]?.purchasePrice ? "border-red-500" : "border-border"
                                                )}
                                            />
                                            {inlineErrors[item.id]?.purchasePrice && (
                                                <p className="text-[9px] text-red-400 mt-0.5">{inlineErrors[item.id].purchasePrice}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-sm font-black"><span className={getPnLColor(pnl)}>{formatPnLPrefix(pnl)}{fmt(pnl)}</span></td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {savingInlineId === item.id && <span className="text-[10px] text-muted-foreground">Saving...</span>}
                                                <button onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'single', id: item.id }); }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-10 border-t border-border/50 pb-20">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 glass rounded-xl disabled:opacity-20 transition-all"><ChevronLeft size={18} /></button>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Page <span className="text-foreground">{currentPage}</span> of {totalPages}</div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 glass rounded-xl disabled:opacity-20 transition-all"><ChevronRight size={18} /></button>
                </div>
            )}

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] glass border-primary/50 px-6 py-4 rounded-2xl flex items-center gap-6 shadow-2xl marine-glow">
                        <p className="text-sm font-bold">{selectedIds.size} Assets Selected</p>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex gap-2">
                             <button onClick={() => setConfirmAction({ type: 'bulk' })} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-600 transition-all">Bulk Delete</button>
                             <button onClick={() => setSelectedIds(new Set())} className="text-muted-foreground hover:text-foreground text-xs font-black px-2">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals handled dynamically */}
            {isAddModalOpen && <AddCardModal isOpen card={selectedCard} onClose={() => { setSelectedCard(null); setIsAddModalOpen(false); }} />}
            {editingItem && <EditPortfolioItemModal isOpen item={editingItem} onClose={() => setEditingItem(null)} />}
            {isBinderModalOpen && (
                <BinderModal 
                    isOpen 
                    initialData={editingBinder ? { name: editingBinder.name, description: '', color: editingBinder.color || undefined } : undefined} 
                    onClose={() => setIsBinderModalOpen(false)} 
                    onSubmit={handleBinderSubmit} 
                    mode={editingBinder ? 'edit' : 'create'}
                />
            )}
            <ConfirmModal isOpen={!!confirmAction} title="Confirm Operation" message="Are you sure you want to proceed with this operation?" onConfirm={executeDelete} onCancel={() => setConfirmAction(null)} variant="danger" />
        </motion.main>
    );
}
