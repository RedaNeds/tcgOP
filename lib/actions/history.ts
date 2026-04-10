'use server';

import prisma from '@/lib/db';
import { auth } from "@/auth";
import { format, subDays, endOfDay } from 'date-fns';

export interface PortfolioHistoryData {
    date: string;
    value: number;
}

export type HistoryRange = '7D' | '1M' | '3M' | '6M' | 'MAX';

const RANGE_DAYS: Record<HistoryRange, number | null> = {
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    'MAX': null,
};

export async function getPortfolioHistory(range: HistoryRange = '1M'): Promise<PortfolioHistoryData[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        const portfolioItems = await prisma.portfolioItem.findMany({
            where: { userId },
            include: { card: true }
        });

        const days = RANGE_DAYS[range];

        if (portfolioItems.length === 0) {
            const numDays = days ?? 30;
            return Array.from({ length: numDays + 1 }).map((_, i) => ({
                date: format(subDays(new Date(), numDays - i), 'yyyy-MM-dd'),
                value: 0
            }));
        }

        const cardIds = [...new Set(portfolioItems.map(item => item.cardId))];

        // For MAX range, find the earliest purchase date or price history date
        let startDate: Date;
        if (days === null) {
            const earliestPurchase = portfolioItems.reduce((min, item) => 
                item.purchasedAt < min ? item.purchasedAt : min, 
                portfolioItems[0].purchasedAt
            );
            // Go back up to 365 days max to keep performance reasonable
            const maxLookback = subDays(new Date(), 365);
            startDate = earliestPurchase < maxLookback ? maxLookback : earliestPurchase;
        } else {
            startDate = subDays(new Date(), days);
        }

        // Calculate actual number of days to iterate
        const actualDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Fetch price history only for the relevant date range
        const priceHistoryRecords = await prisma.priceHistory.findMany({
            where: {
                cardId: { in: cardIds },
                date: { gte: startDate }
            },
            orderBy: { date: 'asc' }
        });

        const historyData: PortfolioHistoryData[] = [];

        // Pre-index price history by cardId for O(1) lookups
        const priceByCard = new Map<string, { date: Date; price: number }[]>();
        for (const ph of priceHistoryRecords) {
            if (!priceByCard.has(ph.cardId)) priceByCard.set(ph.cardId, []);
            priceByCard.get(ph.cardId)!.push({ date: ph.date, price: ph.price });
        }

        for (let i = actualDays; i >= 0; i--) {
            const currentDate = subDays(new Date(), i);
            const currentDayEnd = endOfDay(currentDate);
            const dateStr = format(currentDate, 'yyyy-MM-dd');

            let dailyValue = 0;

            for (const item of portfolioItems) {
                if (item.purchasedAt > currentDayEnd) {
                    continue;
                }

                const cardPrices = priceByCard.get(item.cardId) || [];
                // Binary search for the latest price on or before currentDayEnd
                let priceForDay = item.purchasePrice;
                let bestPrice: { date: Date; price: number } | null = null;
                for (const p of cardPrices) {
                    if (p.date <= currentDayEnd) {
                        if (!bestPrice || p.date > bestPrice.date) {
                            bestPrice = p;
                        }
                    }
                }

                if (bestPrice) {
                    priceForDay = bestPrice.price;
                } else if (item.card.currentPrice > 0) {
                    priceForDay = item.card.currentPrice;
                }

                dailyValue += (item.quantity * priceForDay);
            }

            historyData.push({
                date: dateStr,
                value: parseFloat(dailyValue.toFixed(2))
            });
        }

        return historyData;
    } catch (error) {
        console.error('Error fetching portfolio history:', error);
        return [];
    }
}
