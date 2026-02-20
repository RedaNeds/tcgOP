'use server';

import prisma from '@/lib/db';
import { auth } from "@/auth";

export interface AllocationData {
    bySet: { name: string; value: number; color: string }[];
    byColor: { name: string; value: number; color: string }[];
    byType: { name: string; value: number }[];
    byRarity: { name: string; value: number }[];
    totalValue: number;
}

const SET_COLORS: Record<string, string> = {
    'Romance Dawn': '#eab308',
    'Awakening of the New Era': '#f97316',
    'Straw Hat Crew': '#22c55e',
    'Paramount War': '#ef4444',
    'Pillars of Strength': '#a855f7',
    'Kingdoms of Intrigue': '#3b82f6',
    'Twin Champions': '#06b6d4',
    'The Three Captains': '#ec4899',
};

const COLOR_MAP: Record<string, string> = {
    'Red': '#ef4444',
    'Green': '#22c55e',
    'Blue': '#3b82f6',
    'Purple': '#a855f7',
    'Black': '#1f2937',
    'Yellow': '#eab308',
    'Red/Green': '#d97706',
    'Red/Black': '#7f1d1d',
    'Blue/Purple': '#6366f1',
    'Red/Yellow': '#f59e0b',
};

export async function getAllocationData(): Promise<AllocationData> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            bySet: [],
            byColor: [],
            byType: [],
            byRarity: [],
            totalValue: 0
        };
    }

    const items = await prisma.portfolioItem.findMany({
        where: { userId: session.user.id },
        include: {
            card: true,
        },
    });

    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.card.currentPrice), 0);

    // 1. By Set
    const setMap = new Map<string, number>();
    // 2. By Color
    const colorMap = new Map<string, number>();
    // 3. By Type
    const typeMap = new Map<string, number>();
    // 4. By Rarity
    const rarityMap = new Map<string, number>();

    items.forEach(item => {
        const val = item.quantity * item.card.currentPrice;

        // Set
        const setName = item.card.set;
        setMap.set(setName, (setMap.get(setName) || 0) + val);

        // Color
        const card: any = item.card;
        const color = card.color || 'Unknown';
        colorMap.set(color, (colorMap.get(color) || 0) + val);

        // Type
        const type = card.type || 'Other';
        typeMap.set(type, (typeMap.get(type) || 0) + val);

        // Rarity
        const rarity = item.card.rarity;
        rarityMap.set(rarity, (rarityMap.get(rarity) || 0) + val);
    });

    const formatData = (map: Map<string, number>, colorLookup?: Record<string, string>) => {
        return Array.from(map.entries())
            .map(([name, value]) => ({
                name,
                value: parseFloat(value.toFixed(2)),
                color: colorLookup ? (colorLookup[name] || '#94a3b8') : '#94a3b8',
            }))
            .sort((a, b) => b.value - a.value);
    };

    return {
        bySet: formatData(setMap, SET_COLORS),
        byColor: formatData(colorMap, COLOR_MAP),
        byType: formatData(typeMap), // No specific colors needed for bars usually
        byRarity: formatData(rarityMap),
        totalValue: parseFloat(totalValue.toFixed(2)),
    };
}
