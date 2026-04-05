'use server';

import prisma from '@/lib/db';
import { auth } from "@/auth";

export interface SetProgressCard {
    id: string;
    code: string;
    name: string;
    image: string;
    rarity: string;
    owned: boolean;
    quantity: number;
    purchasePrices: number[];
}

export interface SetProgressData {
    setName: string;
    totalCards: number; // For backward compatibility, mapped to coreTotal
    ownedCards: number; // For backward compatibility, mapped to coreOwned
    completionPercentage: number;
    
    // Dual Metrics
    coreTotal: number;
    coreOwned: number;
    masteryTotal: number;
    masteryOwned: number;
    
    cards: SetProgressCard[];
}

export async function getSetProgress(setName: string): Promise<SetProgressData | { error: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const userId = session.user.id;

        // 1. Get all cards that belong to this set from the database
        const allSetCards = await prisma.card.findMany({
            where: { set: setName },
            orderBy: { code: 'asc' }
        });

        if (allSetCards.length === 0) {
            return { error: 'Set not found or has no cards' };
        }

        // 2. Get the user's portfolio items specifically for this set
        const userItems = await prisma.portfolioItem.findMany({
            where: {
                userId,
                card: { set: setName }
            },
            include: { card: true }
        });

        // 3. Map user's owned items
        const ownedMap = new Map<string, { quantity: number, prices: number[] }>();
        
        userItems.forEach(item => {
            const existing = ownedMap.get(item.cardId) || { quantity: 0, prices: [] };
            existing.quantity += item.quantity;
            existing.prices.push(item.purchasePrice);
            ownedMap.set(item.cardId, existing);
        });

        // 4. Calculate Dual Metrics
        const coreCodes = new Set(allSetCards.map(c => c.code));
        const masteryIds = new Set(allSetCards.map(c => c.id));
        
        const ownedCoreCodes = new Set<string>();
        const ownedMasteryIds = new Set<string>();
        
        userItems.forEach(item => {
            ownedCoreCodes.add(item.card.code);
            ownedMasteryIds.add(item.cardId);
        });

        const coreTotal = coreCodes.size;
        const coreOwned = ownedCoreCodes.size;
        const masteryTotal = masteryIds.size;
        const masteryOwned = ownedMasteryIds.size;

        // 5. Construct the unified result array
        const cards: SetProgressCard[] = allSetCards.map(card => {
            const ownedData = ownedMap.get(card.id);
            const isOwned = !!ownedData;
            
            return {
                id: card.id,
                code: card.code,
                name: card.name,
                image: card.image || '',
                rarity: card.rarity,
                owned: isOwned,
                quantity: ownedData?.quantity || 0,
                purchasePrices: ownedData?.prices || []
            };
        });

        return {
            setName,
            totalCards: coreTotal, // Legacy support
            ownedCards: coreOwned, // Legacy support
            completionPercentage: Math.round((coreOwned / coreTotal) * 100),
            coreTotal,
            coreOwned,
            masteryTotal,
            masteryOwned,
            cards
        };

    } catch (error) {
        console.error('Error fetching set progress:', error);
        return { error: 'Failed to fetch set progress data' };
    }
}

export interface SetProgressSummary {
    setName: string;
    coreTotal: number;
    coreOwned: number;
    completionPercentage: number;
}

export async function getAllSetsProgress(): Promise<SetProgressSummary[] | { error: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Unauthorized' };
        }

        const userId = session.user.id;

        // 1. Get all cards grouped by set and code to find "core" card counts
        // Note: Prisma doesn't have a direct "count unique" in groupBy for some providers/versions,
        // so we'll get all card set/code pairs.
        const allCards = await prisma.card.findMany({
            select: {
                set: true,
                code: true
            }
        });

        const setCoreTotals = new Map<string, Set<string>>();
        allCards.forEach(c => {
            if (!setCoreTotals.has(c.set)) {
                setCoreTotals.set(c.set, new Set());
            }
            setCoreTotals.get(c.set)!.add(c.code);
        });

        // 2. Get user's owned cards with their set and code
        const userOwned = await prisma.portfolioItem.findMany({
            where: { userId },
            select: {
                card: {
                    select: {
                        set: true,
                        code: true
                    }
                }
            }
        });

        const setOwnedTotals = new Map<string, Set<string>>();
        userOwned.forEach(item => {
            if (!item.card) return;
            if (!setOwnedTotals.has(item.card.set)) {
                setOwnedTotals.set(item.card.set, new Set());
            }
            setOwnedTotals.get(item.card.set)!.add(item.card.code);
        });

        // 3. Assemble results
        const results: SetProgressSummary[] = [];
        setCoreTotals.forEach((codes, setName) => {
            const coreTotal = codes.size;
            const coreOwned = setOwnedTotals.get(setName)?.size || 0;
            results.push({
                setName,
                coreTotal,
                coreOwned,
                completionPercentage: Math.round((coreOwned / coreTotal) * 100)
            });
        });

        // Sort by completion percentage descending, then by name
        return results.sort((a, b) => {
            if (b.completionPercentage !== a.completionPercentage) {
                return b.completionPercentage - a.completionPercentage;
            }
            return a.setName.localeCompare(b.setName);
        });

    } catch (error) {
        console.error('Error fetching all sets progress:', error);
        return { error: 'Failed to fetch all sets progress data' };
    }
}
