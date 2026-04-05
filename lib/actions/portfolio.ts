'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from "@/auth";
import { addToPortfolioSchema, updatePortfolioItemSchema } from '@/lib/validations';

/**
 * Adds a card to the portfolio.
 * If the card is already in the portfolio (same card, same purchase price?), 
 * we could update quantity. For now, we'll just create a new entry.
 * Actually, typical portfolio trackers list separate lots.
 */
export async function addToPortfolio(items: unknown) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }
        const userId = session.user.id;

        const validatedFields = addToPortfolioSchema.safeParse(items);
        if (!validatedFields.success) {
            return { 
                success: false, 
                error: "Invalid input data", 
                details: validatedFields.error.flatten().fieldErrors 
            };
        }

        const validatedItems = validatedFields.data;

        // Process sequentially to handle duplicates within the input array or DB
        for (const item of validatedItems) {
            const { cardId, quantity, purchasePrice, condition = 'Raw', language = 'EN', isGraded = false, certId = null, gradingCompany = null } = item;

            // Check if card exists in portfolio for this user with exact same properties
            const existingItem = await prisma.portfolioItem.findFirst({
                where: {
                    cardId,
                    userId,
                    condition,
                    language,
                    isGraded
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
                        condition,
                        language,
                        isGraded,
                        certId,
                        gradingCompany,
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
export async function updatePortfolioItem(
    itemId: string,
    data: unknown
) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const validatedFields = updatePortfolioItemSchema.safeParse(data);
        if (!validatedFields.success) {
            return { 
                success: false, 
                error: "Invalid input data", 
                details: validatedFields.error.flatten().fieldErrors 
            };
        }

        const validatedData = validatedFields.data;

        // Verify ownership
        const existing = await prisma.portfolioItem.findUnique({ where: { id: itemId } });
        if (!existing || existing.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.portfolioItem.update({
            where: { id: itemId },
            data: {
                ...(validatedData.quantity !== undefined && { quantity: validatedData.quantity }),
                ...(validatedData.purchasePrice !== undefined && { purchasePrice: validatedData.purchasePrice }),
                ...(validatedData.condition !== undefined && { condition: validatedData.condition }),
                ...(validatedData.language !== undefined && { language: validatedData.language }),
                ...(validatedData.isGraded !== undefined && { isGraded: validatedData.isGraded }),
                ...(validatedData.isForTrade !== undefined && { isForTrade: validatedData.isForTrade }),
                ...(validatedData.certId !== undefined && { certId: validatedData.certId }),
                ...(validatedData.gradingCompany !== undefined && { gradingCompany: validatedData.gradingCompany }),
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update portfolio item:', error);
        return { success: false, error: 'Failed to update item' };
    }
}

/**
 * Toggles the trade status of a portfolio item.
 */
export async function toggleTradeStatus(itemId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const existing = await prisma.portfolioItem.findUnique({ 
            where: { id: itemId },
            select: { userId: true, isForTrade: true }
        });
        
        if (!existing || existing.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.portfolioItem.update({
            where: { id: itemId },
            data: { isForTrade: !existing.isForTrade },
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle trade status:', error);
        return { success: false, error: 'Failed to update trade status' };
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
                card: {
                    include: {
                        priceHistory: {
                            orderBy: { date: 'desc' },
                            take: 7,
                        },
                    },
                },
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
        //     condition: string;
        //     language: string;
        //     isGraded: boolean;
        //     certId?: string | null;
        //     gradingCompany?: string | null;
        // }

        return items.map((item) => {
            const currentPrice = item.card.currentPrice || 0;
            // Use real price history for sparkline data
            const history = item.card.priceHistory
                .map((ph) => ({
                    date: ph.date.toISOString().split('T')[0],
                    value: ph.price,
                }))
                .reverse(); // Sorted ascending by date

            return {
                id: item.id,
                cardId: item.cardId,
                name: item.card.name,
                image: item.card.image || '',
                set: item.card.set,
                code: item.card.code,
                rarity: item.card.rarity,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                currentPrice,
                dateAdded: item.purchasedAt.toISOString(),
                condition: item.condition,
                language: item.language,
                isGraded: item.isGraded,
                certId: item.certId,
                gradingCompany: item.gradingCompany,
                isForTrade: item.isForTrade,
                history,
            };
        });
    } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return [];
    }
}

/**
 * Fetches portfolio items for a specific card for the current user.
 */
export async function getPortfolioItemsByCardId(cardId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const items = await prisma.portfolioItem.findMany({
            where: {
                cardId,
                userId: session.user.id
            },
            orderBy: {
                purchasedAt: 'desc'
            }
        });

        return items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            dateAdded: item.purchasedAt.toISOString(),
            condition: item.condition,
            language: item.language,
            isGraded: item.isGraded,
            certId: item.certId,
            gradingCompany: item.gradingCompany,
            isForTrade: item.isForTrade
        }));
    } catch (error) {
        console.error('Failed to fetch holdings for card:', error);
        return [];
    }
}

export async function resetPortfolio() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.portfolioItem.deleteMany({
            where: { userId: session.user.id }
        });

        revalidatePath('/portfolio');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to reset portfolio:', error);
        return { success: false, error: 'Failed to reset portfolio' };
    }
}
