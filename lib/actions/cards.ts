'use server';

import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

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

export interface PaginatedCardsResult {
    cards: CardListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function getPaginatedCards(params: {
    page?: number;
    pageSize?: number;
    query?: string;
    set?: string;
    color?: string;
    rarity?: string;
    type?: string;
}): Promise<PaginatedCardsResult> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(96, Math.max(1, params.pageSize || 48));

    // Build where clause
    const where: Prisma.CardWhereInput = {};

    if (params.query) {
        where.OR = [
            { name: { contains: params.query, mode: 'insensitive' } },
            { code: { contains: params.query, mode: 'insensitive' } },
        ];
    }
    if (params.set) where.set = params.set;
    if (params.color) where.color = params.color;
    if (params.rarity) where.rarity = params.rarity;
    if (params.type) where.type = params.type;

    const [cards, totalCount] = await Promise.all([
        prisma.card.findMany({
            where,
            orderBy: [{ set: 'asc' }, { code: 'asc' }],
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.card.count({ where }),
    ]);

    return {
        cards: cards.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            set: c.set,
            rarity: c.rarity,
            image: c.image,
            color: c.color,
            type: c.type,
            currentPrice: c.currentPrice,
        })),
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
    };
}

export async function getCardFilters() {
    const [sets, colors, types, rarities] = await Promise.all([
        prisma.card.findMany({ distinct: ['set'], select: { set: true }, orderBy: { set: 'asc' } }),
        prisma.card.findMany({ distinct: ['color'], select: { color: true }, where: { color: { not: null } }, orderBy: { color: 'asc' } }),
        prisma.card.findMany({ distinct: ['type'], select: { type: true }, where: { type: { not: null } }, orderBy: { type: 'asc' } }),
        prisma.card.findMany({ distinct: ['rarity'], select: { rarity: true }, orderBy: { rarity: 'asc' } }),
    ]);

    return {
        sets: sets.map(s => s.set),
        colors: colors.map(c => c.color).filter(Boolean) as string[],
        types: types.map(t => t.type).filter(Boolean) as string[],
        rarities: rarities.map(r => r.rarity),
    };
}
