'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";

export interface WishlistItemWithCard {
    id: string;
    cardId: string;
    targetPrice: number;
    notes: string | null;
    createdAt: string;
    card: {
        id: string;
        code: string;
        name: string;
        set: string;
        rarity: string;
        image: string | null;
        currentPrice: number;
    };
}

export async function getWishlistItems(): Promise<WishlistItemWithCard[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const items = await prisma.wishlistItem.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            card: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
        id: item.id,
        cardId: item.cardId,
        targetPrice: item.targetPrice,
        notes: item.notes,
        createdAt: item.createdAt.toISOString(),
        card: {
            id: item.card.id,
            code: item.card.code,
            name: item.card.name,
            set: item.card.set,
            rarity: item.card.rarity,
            image: item.card.image,
            currentPrice: item.card.currentPrice,
        },
    }));
}

export async function addToWishlist(cardId: string, targetPrice: number, notes?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        await prisma.wishlistItem.upsert({
            where: {
                cardId_userId: {
                    cardId,
                    userId
                }
            },
            update: { targetPrice, notes: notes || null },
            create: { cardId, targetPrice, notes: notes || null, userId },
        });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to add to wishlist:', error);
        return { success: false, error: 'Failed to add to wishlist' };
    }
}

export async function removeFromWishlist(id: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const item = await prisma.wishlistItem.findUnique({ where: { id } });
        if (!item || item.userId !== session.user.id) return { success: false, error: "Unauthorized" };

        await prisma.wishlistItem.delete({ where: { id } });
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        return { success: false, error: 'Failed to remove' };
    }
}

export async function convertWishlistToPortfolio(wishlistItemId: string, quantity: number, purchasePrice: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        const wishlistItem = await prisma.wishlistItem.findUnique({
            where: { id: wishlistItemId },
            include: { card: true }
        });

        if (!wishlistItem || wishlistItem.userId !== userId) {
            return { success: false, error: "Item not found or unauthorized" };
        }

        // Execute in a transaction to ensure both operations succeed or fail together
        await prisma.$transaction(async (tx) => {
            // 1. Add to portfolio (similar logic to addToPortfolio)
            const existingPortfolioItem = await tx.portfolioItem.findFirst({
                where: { cardId: wishlistItem.cardId, userId }
            });

            if (existingPortfolioItem) {
                const totalCost = (existingPortfolioItem.quantity * existingPortfolioItem.purchasePrice) + (quantity * purchasePrice);
                const newQuantity = existingPortfolioItem.quantity + quantity;
                const newAveragePrice = totalCost / newQuantity;

                await tx.portfolioItem.update({
                    where: { id: existingPortfolioItem.id },
                    data: {
                        quantity: newQuantity,
                        purchasePrice: newAveragePrice,
                        updatedAt: new Date(),
                    }
                });
            } else {
                await tx.portfolioItem.create({
                    data: {
                        cardId: wishlistItem.cardId,
                        quantity,
                        purchasePrice,
                        userId
                    }
                });
            }

            // 2. Remove from wishlist
            await tx.wishlistItem.delete({
                where: { id: wishlistItemId }
            });
        });

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Failed to convert wishlist item to portfolio:', error);
        return { success: false, error: 'Failed to convert item' };
    }
}

export async function getWishlistAlerts(): Promise<WishlistItemWithCard[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Find wishlist items where current price is at or below target
    const items = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { card: true },
    });

    return items
        .filter((item) => item.card.currentPrice <= item.targetPrice)
        .map((item) => ({
            id: item.id,
            cardId: item.cardId,
            targetPrice: item.targetPrice,
            notes: item.notes,
            createdAt: item.createdAt.toISOString(),
            card: {
                id: item.card.id,
                code: item.card.code,
                name: item.card.name,
                set: item.card.set,
                rarity: item.card.rarity,
                image: item.card.image,
                currentPrice: item.card.currentPrice,
            },
        }));
}
