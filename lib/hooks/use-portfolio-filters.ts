'use client';

import { useState, useMemo } from 'react';
import { PortfolioItem } from '@/types';
import { calculatePnL } from '@/lib/utils/calculations';

export type SortField = 'name' | 'set' | 'quantity' | 'purchasePrice' | 'currentPrice' | 'pnl';
export type SortOrder = 'asc' | 'desc';

export type BinderWithItems = {
    id: string;
    name: string;
    color: string | null;
    items: { id: string }[];
};

export function usePortfolioFilters(items: PortfolioItem[], binders: BinderWithItems[] = []) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<SortField>('pnl');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterSet, setFilterSet] = useState('All');
    const [filterRarity, setFilterRarity] = useState('All');
    const [filterPnL, setFilterPnL] = useState('All');
    const [activeBinderId, setActiveBinderId] = useState<string | null>(null);

    // Derived Filter Options
    const uniqueSets = useMemo(() => Array.from(new Set(items.map(i => i.set))).filter(Boolean).sort(), [items]);
    const uniqueRarities = useMemo(() => Array.from(new Set(items.map(i => i.rarity))).filter(Boolean).sort(), [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase()) ||
                item.code?.toLowerCase().includes(search.toLowerCase()) ||
                item.set?.toLowerCase().includes(search.toLowerCase());

            const matchesSet = filterSet === 'All' || item.set === filterSet;
            const matchesRarity = filterRarity === 'All' || item.rarity === filterRarity;

            const { pnl } = calculatePnL(item.quantity, item.purchasePrice, item.currentPrice || 0);
            let matchesPnL = true;
            if (filterPnL === 'Gain') matchesPnL = pnl > 0;
            if (filterPnL === 'Loss') matchesPnL = pnl < 0;

            let matchesBinder = true;
            if (activeBinderId === 'trade') {
                matchesBinder = !!item.isForTrade;
            } else if (activeBinderId) {
                const binder = binders.find(b => b.id === activeBinderId);
                matchesBinder = !!binder?.items.some((i: any) => i.id === item.id);
            }

            return matchesSearch && matchesSet && matchesRarity && matchesPnL && matchesBinder;
        });
    }, [items, binders, search, activeBinderId, filterSet, filterRarity, filterPnL]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            let valA: any = a[sortField as keyof PortfolioItem];
            let valB: any = b[sortField as keyof PortfolioItem];

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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const clearFilters = () => {
        setFilterSet('All');
        setFilterRarity('All');
        setFilterPnL('All');
        setSearch('');
    };

    return {
        search, setSearch,
        sortField, setSortField,
        sortOrder, setSortOrder,
        filterSet, setFilterSet,
        filterRarity, setFilterRarity,
        filterPnL, setFilterPnL,
        activeBinderId, setActiveBinderId,
        uniqueSets, uniqueRarities,
        filteredItems, sortedItems,
        handleSort, clearFilters
    };
}
