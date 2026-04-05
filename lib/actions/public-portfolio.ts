'use server';

import prisma from '@/lib/db';

export interface PublicPortfolioItem {
    id: string;
    cardId: string;
    code: string;
    name: string;
    set: string;
    rarity: string;
    image: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    color: string;
    type: string;
    condition: string;
    language: string;
    isGraded: boolean;
    certId?: string | null;
    gradingCompany?: string | null;
    isForTrade: boolean;
}

export async function getPublicPortfolio(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                isPublic: true,
                portfolioItems: {
                    include: {
                        card: true,
                    },
                    orderBy: {
                        card: {
                            currentPrice: 'desc',
                        },
                    },
                },
                wishlistItems: {
                    include: {
                        card: true,
                    }
                }
            },
        });

        if (!user) {
            return { error: 'User not found', status: 404 };
        }

        if (!user.isPublic) {
            return { error: 'This portfolio is private', status: 403 };
        }

        // Format items
        const items: PublicPortfolioItem[] = user.portfolioItems.map((item: any) => ({
            id: item.id,
            cardId: item.card.id,
            code: item.card.code,
            name: item.card.name,
            set: item.card.set,
            rarity: item.card.rarity,
            image: item.card.image || '',
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            currentPrice: item.card.currentPrice,
            color: item.card.color || '',
            type: item.card.type || '',
            condition: item.condition,
            language: item.language,
            isGraded: item.isGraded,
            certId: item.certId,
            gradingCompany: item.gradingCompany,
            isForTrade: (item as any).isForTrade || false,
        }));

        const wishlist = user.wishlistItems.map((item: any) => ({
            id: item.id,
            cardId: item.card.id,
            code: item.card.code,
            name: item.card.name,
            set: item.card.set,
            rarity: item.card.rarity,
            image: item.card.image || '',
            targetPrice: item.targetPrice,
            currentPrice: item.card.currentPrice,
        }));

        const totalCards = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

        return {
            success: true,
            user: {
                name: user.name,
                username: user.username,
            },
            stats: {
                totalCards,
                totalValue,
                uniqueCards: items.length,
            },
            items,
            wishlist,
        };
    } catch (error) {
        console.error('Error fetching public portfolio:', error);
        return { error: 'Failed to fetch portfolio', status: 500 };
    }
}
