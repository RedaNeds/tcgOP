
'use server';

import { Card } from '@/types';
import prisma from '@/lib/db';

export const searchCards = async (query: string): Promise<Card[]> => {
    if (!query) return [];

    const cards = await prisma.card.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
                { set: { contains: query, mode: 'insensitive' } },
            ]
        },
        include: {
            priceHistory: {
                orderBy: { date: 'asc' },
                take: 30,
            },
        },
        take: 20,
    });

    return cards.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        set: c.set,
        rarity: c.rarity,
        image: c.image || '',
        price: c.currentPrice,
        history: c.priceHistory.map(p => ({
            date: p.date.toISOString().split('T')[0],
            value: p.price,
        })),
    }));
};

export const getCardDetails = async (id: string): Promise<Card | undefined> => {
    const card = await prisma.card.findUnique({
        where: { id },
        include: {
            priceHistory: {
                orderBy: { date: 'asc' },
                take: 90,
            },
        },
    });

    if (card) {
        return {
            id: card.id,
            name: card.name,
            code: card.code,
            set: card.set,
            rarity: card.rarity,
            image: card.image || '',
            price: card.currentPrice,
            history: card.priceHistory.map(p => ({
                date: p.date.toISOString().split('T')[0],
                value: p.price,
            })),
        };
    }
    return undefined;
};
