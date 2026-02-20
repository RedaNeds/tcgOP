'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

/**
 * Adds a card to the portfolio.
 * If the card is already in the portfolio (same card, same purchase price?), 
 * we could update quantity. For now, we'll just create a new entry.
 * Actually, typical portfolio trackers list separate lots.
 */
export async function addToPortfolio(items: { cardId: string; quantity: number; purchasePrice: number }[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }
        const userId = session.user.id;

        // Process sequentially to handle duplicates within the input array or DB
        for (const item of items) {
            const { cardId, quantity, purchasePrice } = item;

            // Check if card exists in portfolio for this user
            const existingItem = await prisma.portfolioItem.findFirst({
                where: {
                    cardId,
                    userId
                },
            });

            if (existingItem) {
                // Calculate new weighted average price
                const totalCost = (existingItem.quantity * existingItem.purchasePrice) + (quantity * purchasePrice);
                const newQuantity = existingItem.quantity + quantity;
                const newAveragePrice = totalCost / newQuantity;

                await prisma.portfolioItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: newQuantity,
                        purchasePrice: newAveragePrice,
                        updatedAt: new Date(),
                    },
                });
            } else {
                await prisma.portfolioItem.create({
                    data: {
                        cardId,
                        quantity,
                        purchasePrice,
                        userId
                    },
                });
            }
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to add to portfolio:', error);
        return { success: false, error: 'Failed to add item' };
    }
}

/**
 * Removes an item from the portfolio by ID.
 */
export async function removeFromPortfolio(itemId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // Verify ownership
        const item = await prisma.portfolioItem.findUnique({
            where: { id: itemId },
        });

        if (!item || item.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or item not found" };
        }

        await prisma.portfolioItem.delete({
            where: { id: itemId },
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to remove from portfolio:', error);
        return { success: false, error: 'Failed to remove item' };
    }
}

/**
 * Removes multiple items from the portfolio.
 */
export async function bulkRemoveFromPortfolio(itemIds: string[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // We should verify ownership of all items before deleting, or just delete where id IN ids AND userId = userId
        await prisma.portfolioItem.deleteMany({
            where: {
                id: {
                    in: itemIds,
                },
                userId: session.user.id
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk remove from portfolio:', error);
        return { success: false, error: 'Failed to remove items' };
    }
}

/**
 * Updates an item (e.g. quantity or price correction).
 */
export async function updatePortfolioItem(itemId: string, data: { quantity?: number; purchasePrice?: number }) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        // Verify ownership
        const existing = await prisma.portfolioItem.findUnique({ where: { id: itemId } });
        if (!existing || existing.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.portfolioItem.update({
            where: { id: itemId },
            data,
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update portfolio item:', error);
        return { success: false, error: 'Failed to update item' };
    }
}

/**
 * Fetches all portfolio items with their card details.
 */
export async function getPortfolioItems() {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const items = await prisma.portfolioItem.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                card: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to match our frontend interface if needed, or update frontend to match DB
        // The frontend expects: 
        // interface PortfolioItem {
        //     id: string;
        //     cardId: string;
        //     name: string;
        //     image: string;
        //     set: string;
        //     code: string;
        //     rarity: string;
        //     quantity: number;
        //     purchasePrice: number;
        //     currentPrice: number;
        //     dateAdded: string;
        // }

        return items.map(item => ({
            id: item.id,
            cardId: item.cardId,
            name: item.card.name,
            image: item.card.image || '',
            set: item.card.set,
            code: item.card.code,
            rarity: item.card.rarity,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            currentPrice: item.card.currentPrice,
            dateAdded: item.purchasedAt.toISOString(),
        }));
    } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return [];
    }
}
