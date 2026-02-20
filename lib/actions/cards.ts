'use server';

import prisma from '@/lib/db';

export interface CardWithHistory {
    id: string;
    code: string;
    name: string;
    set: string;
    rarity: string;
    image: string | null;
    color: string | null;
    type: string | null;
    power: number | null;
    attribute: string | null;
    currentPrice: number;
    priceHistory: { date: string; price: number }[];
}

export async function getCardById(id: string): Promise<CardWithHistory | null> {
    const card = await prisma.card.findUnique({
        where: { id },
        include: {
            priceHistory: {
                orderBy: { date: 'asc' },
                take: 90,
            },
        },
    });

    if (!card) return null;

    return {
        id: card.id,
        code: card.code,
        name: card.name,
        set: card.set,
        rarity: card.rarity,
        image: card.image,
        color: card.color,
        type: card.type,
        power: card.power,
        attribute: card.attribute,
        currentPrice: card.currentPrice,
        priceHistory: card.priceHistory.map((p) => ({
            date: p.date.toISOString().split('T')[0],
            price: p.price,
        })),
    };
}

export interface CardListItem {
    id: string;
    code: string;
    name: string;
    set: string;
    rarity: string;
    image: string | null;
    color: string | null;
    type: string | null;
    currentPrice: number;
}

export async function getAllCards(): Promise<CardListItem[]> {
    const cards = await prisma.card.findMany({
        orderBy: [{ set: 'asc' }, { code: 'asc' }],
    });

    return cards.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        set: c.set,
        rarity: c.rarity,
        image: c.image,
        color: c.color,
        type: c.type,
        currentPrice: c.currentPrice,
    }));
}

export async function getCardFilters() {
    const cards = await prisma.card.findMany({
        select: { set: true, color: true, type: true, rarity: true },
    });

    const sets = [...new Set(cards.map((c) => c.set))].sort();
    const colors = [...new Set(cards.map((c) => c.color).filter(Boolean))].sort() as string[];
    const types = [...new Set(cards.map((c) => c.type).filter(Boolean))].sort() as string[];
    const rarities = [...new Set(cards.map((c) => c.rarity))].sort();

    return { sets, colors, types, rarities };
}
