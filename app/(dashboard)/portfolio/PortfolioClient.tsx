'use client';


import { useState, useMemo, useRef, useEffect } from 'react';
import { PortfolioItem } from '@/types';
import Image from 'next/image';
import { ArrowUpDown, Search, Trash2, Filter, TrendingUp, TrendingDown, Download, Upload, X, CheckSquare, Square, Edit2, Layers, Plus } from 'lucide-react';
import { removeFromPortfolio, bulkRemoveFromPortfolio, addToPortfolio } from '@/lib/actions/portfolio';
import { AddCardModal } from '@/components/cards/AddCardModal';
import { EditPortfolioItemModal } from '@/components/cards/EditPortfolioItemModal';
import { CardSearch } from '@/components/cards/CardSearch';
import { CardImage } from '@/components/ui/CardImage';
import { searchCards } from '@/lib/optcg';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface PortfolioClientProps {
    initialItems: PortfolioItem[];
}

type SortField = 'name' | 'set' | 'quantity' | 'purchasePrice' | 'currentPrice' | 'pnl';
type SortOrder = 'asc' | 'desc';

export function PortfolioClient({ initialItems }: PortfolioClientProps) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('pnl');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter & Search
    const filteredItems = useMemo(() => {
        return items.filter(item =>
        (item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.code?.toLowerCase().includes(search.toLowerCase()) ||
            item.set?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [items, search]);

    // Sorting
    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            let valA: any = a[sortField as keyof PortfolioItem];
            let valB: any = b[sortField as keyof PortfolioItem];

            // Handle computed PnL
            if (sortField === 'pnl') {
                valA = (a.quantity * (a.currentPrice || 0)) - (a.quantity * (a.purchasePrice || 0));
                valB = (b.quantity * (b.currentPrice || 0)) - (b.quantity * (b.purchasePrice || 0));
            }

            if (typeof valA === 'string') {
                return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
        });
    }, [filteredItems, sortField, sortOrder]);

    // Bulk selection logic
    const handleSelectAll = () => {
        if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    };

    const handleSelectRow = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleRemove = async (id: string) => {
        if (confirm('Remove this card from portfolio?')) {
            await removeFromPortfolio(id);
            setItems(prev => prev.filter(i => i.id !== id));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;

        if (confirm(`Are you sure you want to delete ${ids.length} items?`)) {
            await bulkRemoveFromPortfolio(ids);
            setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
            setSelectedIds(new Set());
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const downloadCSV = () => {
        // Export selected or all (if none selected) -- usually export all matches filter if none selected?
        // Let's export selected if any, else all filtered items.
        const targetItems = selectedIds.size > 0
            ? items.filter(i => selectedIds.has(i.id))
            : filteredItems;

        if (targetItems.length === 0) return;

        const headers = ['code', 'name', 'set', 'quantity', 'purchase_price', 'date_added'];
        const csvContent = [
            headers.join(','),
            ...targetItems.map(item => [
                item.code,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${item.set.replace(/"/g, '""')}"`,
                item.quantity,
                item.purchasePrice,
                item.dateAdded
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `optcg_portfolio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split('\n');
        // Simple CSV parse: code,quantity,purchase_price,date_added
        // Skip header if present
        const startIndex = lines[0].toLowerCase().includes('code') ? 1 : 0;

        const newItems: { cardId: string; quantity: number; purchasePrice: number }[] = [];

        // We need to resolve code -> cardId. This is tricky client-side without a map.
        // We'll simplisticly try to match known items or search? 
        // Ideally the server handles "import by code".
        // Use a client-side search approach or dedicated server action?
        // Since we have `searchCards` available as server action, we can use it!

        let successCount = 0;
        let failCount = 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle basic CSV logic (ignoring complex quotes for now as our format is simple)
            const parts = line.split(',');
            if (parts.length < 2) continue;

            const code = parts[0].trim();
            const qty = parseInt(parts[1]) || 1;
            const price = parseFloat(parts[2]) || 0;
            // date_added ignored for now as addToPortfolio uses 'now'

            if (!code) continue;

            // Find card by code
            try {
                const results = await searchCards(code);
                // Exact match logic
                const match = results.find(c => c.code === code) || results[0];

                if (match) {
                    newItems.push({
                        cardId: match.id,
                        quantity: qty,
                        purchasePrice: price
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error(err);
                failCount++;
            }
        }

        if (newItems.length > 0) {
            await addToPortfolio(newItems);
            // We need to refresh items from server. 
            // In a real app, addToPortfolio would return the new items.
            // For now, reload page or show success message.
            alert(`Imported ${newItems.length} items successfully. ${failCount > 0 ? `${failCount} failed.` : ''} Please refresh to see changes.`);
        } else {
            alert('No valid items found to import.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const totalValue = sortedItems.reduce((acc, item) => acc + (item.quantity * (item.currentPrice || 0)), 0);
    const totalCost = sortedItems.reduce((acc, item) => acc + (item.quantity * (item.purchasePrice || 0)), 0);
    const totalPnL = totalValue - totalCost;

    return (
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto w-full pb-20 md:pb-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Collection</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {items.length} cards across {new Set(items.map(i => i.set)).size} sets
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        className="bg-card hover:bg-secondary text-foreground border border-border px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                        <Upload size={16} /> Import CSV
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="bg-card hover:bg-secondary text-foreground border border-border px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium shadow-lg transition-all ml-2"
                    >
                        + Add Card
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium">Total Value</p>
                    <p className="text-2xl font-bold mt-1">${totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                    <p className="text-sm text-muted-foreground font-medium">Cost Basis</p>
                    <p className="text-2xl font-bold mt-1">${totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total P&L</p>
                        <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                        </p>
                    </div>
                    <div className={`p-2 rounded-full ${totalPnL >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {totalPnL >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-0 bg-background/95 backdrop-blur z-20 py-4 border-b border-border/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, code, or set..."
                        className="w-full bg-secondary/30 border border-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-secondary/30 border border-border rounded-lg flex items-center gap-2 hover:bg-secondary/50 text-sm font-medium">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="px-4 py-2 bg-secondary/30 border border-border rounded-lg flex items-center gap-2 hover:bg-secondary/50 text-sm font-medium">
                        <ArrowUpDown size={16} /> Sort
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm mb-20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                <th className="p-4 w-10 text-center">
                                    <div
                                        className="cursor-pointer"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedIds.size > 0 && selectedIds.size === filteredItems.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                    </div>
                                </th>
                                <th className="p-4 w-12 text-center">#</th>
                                <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>Card</th>
                                <th className="p-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('set')}>Set</th>
                                <th className="p-4 text-center cursor-pointer hover:text-foreground" onClick={() => handleSort('quantity')}>Qty</th>
                                <th className="p-4 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('purchasePrice')}>Cost</th>
                                <th className="p-4 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('currentPrice')}>Price</th>
                                <th className="p-4 text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('pnl')}>P&L</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {sortedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-0">
                                        <div className="py-24 flex flex-col items-center justify-center text-center bg-card">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                                <Layers className="w-10 h-10 text-primary" />
                                            </div>
                                            <h4 className="text-2xl font-bold mb-3">Your Collection is Empty</h4>
                                            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                                                Start building your One Piece TCG portfolio. Search for cards and track their value over time to see your collection grow.
                                            </p>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setIsAddModalOpen(true); }}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2"
                                            >
                                                <Plus size={20} /> Add Cards to Portfolio
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedItems.map((item, idx) => {
                                    const currentPrice = item.currentPrice || 0;
                                    const purchasePrice = item.purchasePrice || 0;
                                    const pnl = (currentPrice - purchasePrice) * item.quantity;
                                    const isPositive = pnl >= 0;

                                    const isSelected = selectedIds.has(item.id);

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-muted/20 transition-colors group ${isSelected ? 'bg-secondary/20' : ''}`}
                                            onClick={() => handleSelectRow(item.id)}
                                        >
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleSelectRow(item.id)}>
                                                    {isSelected ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center text-muted-foreground text-xs">{idx + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 bg-muted rounded overflow-hidden relative flex-shrink-0 border border-border/50">
                                                        <CardImage src={item.image} alt={item.name} fill className="object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground">{item.name || 'Unknown'}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-mono">{item.code}</span>
                                                            <span className="text-xs text-muted-foreground">{item.rarity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-muted-foreground">{item.set}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="inline-block px-2 py-1 bg-secondary/50 rounded-md text-sm font-bold min-w-[2rem]">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-sm text-muted-foreground">
                                                ${purchasePrice.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right text-sm font-medium">
                                                ${currentPrice.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? '+' : ''}${pnl.toFixed(2)}
                                                </div>
                                                <div className={`text-xs ${isPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
                                                    {purchasePrice > 0
                                                        ? `${isPositive ? '+' : ''}${((pnl / (purchasePrice * item.quantity)) * 100).toFixed(1)}%`
                                                        : '∞'
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                                                        className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
                                                        aria-label={`Edit ${item.name}`}
                                                        title="Edit portfolio item"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                                        className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                                                        aria-label={`Remove ${item.name} from portfolio`}
                                                        title="Remove from portfolio"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-muted/20 p-4 text-xs text-center text-muted-foreground border-t border-border/50">
                    Showing {sortedItems.length} of {items.length} assets
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <span className="font-bold text-sm">{selectedIds.size} selected</span>
                    <div className="h-4 w-px bg-background/20" />
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 hover:text-red-400 transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <button
                            onClick={downloadCSV}
                            className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="ml-2 hover:text-muted-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && !selectedCard && (
                <div className="fixed inset-0 z-50 flex items-start pt-32 justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
                    <div className="w-full max-w-md bg-card p-6 rounded-xl shadow-2xl border border-secondary" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add New Asset</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><span className="text-2xl">×</span></button>
                        </div>
                        <CardSearch onSelect={(card) => setSelectedCard(card)} />
                    </div>
                </div>
            )}

            {selectedCard && (
                <AddCardModal
                    isOpen={!!selectedCard}
                    card={selectedCard}
                    onClose={() => {
                        setSelectedCard(null);
                        setIsAddModalOpen(false);
                    }}
                />
            )}

            {editingItem && (
                <EditPortfolioItemModal
                    isOpen={!!editingItem}
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSuccess={() => {
                        window.location.reload(); // Simple refresh to get updated server data
                    }}
                />
            )}
        </main>
    );
}
