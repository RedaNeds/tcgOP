'use server';

import prisma from '@/lib/db';
import { auth } from "@/auth";
import { SET_COLORS, COLOR_MAP } from '@/lib/constants';

export interface AllocationData {
    bySet: { name: string; value: number; color: string }[];
    byColor: { name: string; value: number; color: string }[];
    byType: { name: string; value: number }[];
    byRarity: { name: string; value: number }[];
    totalValue: number;
    setCompletion: { name: string; uniqueOwned: number; totalInSet: number; percentage: number }[];
}

export async function getAllocationData(): Promise<AllocationData> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            bySet: [],
            byColor: [],
            byType: [],
            byRarity: [],
            totalValue: 0,
            setCompletion: []
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
        const color = item.card.color || 'Unknown';
        colorMap.set(color, (colorMap.get(color) || 0) + val);

        // Type
        const type = item.card.type || 'Other';
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

    // 5. Set Completion (Master Sets)
    const uniqueCardsOwnedBySet = new Map<string, Set<string>>();
    items.forEach(item => {
        const setName = item.card.set;
        if (!uniqueCardsOwnedBySet.has(setName)) {
            uniqueCardsOwnedBySet.set(setName, new Set());
        }
        uniqueCardsOwnedBySet.get(setName)!.add(item.cardId);
    });

    // Batch query: get total card count per set in a single query (fixes N+1)
    const setNames = Array.from(uniqueCardsOwnedBySet.keys());
    const setCountsRaw = await prisma.card.groupBy({
        by: ['set'],
        where: { set: { in: setNames } },
        _count: { id: true },
    });
    const setCountMap = new Map(setCountsRaw.map(s => [s.set, s._count.id]));

    const setCompletion = setNames.map(setName => {
        const uniqueOwned = uniqueCardsOwnedBySet.get(setName)!.size;
        const totalInSet = setCountMap.get(setName) || 0;
        return {
            name: setName,
            uniqueOwned,
            totalInSet,
            percentage: totalInSet > 0 ? Math.round((uniqueOwned / totalInSet) * 100) : 0
        };
    });

    setCompletion.sort((a, b) => b.percentage - a.percentage);

    return {
        bySet: formatData(setMap, SET_COLORS),
        byColor: formatData(colorMap, COLOR_MAP),
        byType: formatData(typeMap), // No specific colors needed for bars usually
        byRarity: formatData(rarityMap),
        totalValue: parseFloat(totalValue.toFixed(2)),
        setCompletion,
    };
}
