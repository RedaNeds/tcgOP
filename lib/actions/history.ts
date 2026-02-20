'use server';

import prisma from '@/lib/db';
import { auth } from "@/auth";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface PortfolioHistoryData {
    date: string;
    value: number;
}

export async function getPortfolioHistory(): Promise<PortfolioHistoryData[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        // Fetch all portfolio items for the user
        const portfolioItems = await prisma.portfolioItem.findMany({
            where: { userId },
            include: { card: true }
        });

        if (portfolioItems.length === 0) {
            // Return flat 0 for the last 30 days
            return Array.from({ length: 31 }).map((_, i) => ({
                date: format(subDays(new Date(), 30 - i), 'yyyy-MM-dd'),
                value: 0
            }));
        }

        const cardIds = [...new Set(portfolioItems.map(item => item.cardId))];

        // Fetch price history for these cards
        const priceHistoryRecords = await prisma.priceHistory.findMany({
            where: {
                cardId: { in: cardIds }
            },
            orderBy: { date: 'asc' }
        });

        const historyData: PortfolioHistoryData[] = [];

        // Build data for the last 30 days (including today)
        for (let i = 30; i >= 0; i--) {
            const currentDate = subDays(new Date(), i);
            const currentDayEnd = endOfDay(currentDate);
            const dateStr = format(currentDate, 'yyyy-MM-dd');

            let dailyValue = 0;

            for (const item of portfolioItems) {
                // If the user bought it after this day, they didn't hold it then.
                // Depending on the use case, you might want to show historical value regardless,
                // but for true portfolio value, we only count items owned on that date.
                if (item.purchasedAt > currentDayEnd) {
                    continue;
                }

                // Find the latest price recorded on or before this day
                const relevantPrices = priceHistoryRecords.filter(ph =>
                    ph.cardId === item.cardId && ph.date <= currentDayEnd
                );

                let priceForDay = item.purchasePrice; // Fallback to what they paid

                if (relevantPrices.length > 0) {
                    // Take the most recent one
                    priceForDay = relevantPrices[relevantPrices.length - 1].price;
                } else if (item.card.currentPrice > 0) {
                    // Fallback to current if no history AND no purchase price (shouldn't happen but safe)
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
