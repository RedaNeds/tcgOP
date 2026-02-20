'use server';

import prisma from '@/lib/db';
import { Card, PortfolioItem, PriceHistory } from '@prisma/client';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { auth } from "@/auth";

export interface PerformanceData {
    chartData: {
        date: string;
        value: number;
        cost: number;
        pnl: number;
    }[];
    topMovers: {
        id: string;
        name: string;
        code: string;
        image: string;
        price: number;
        change: number;
        changePercent: number;
    }[];
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    pnlPercent: number;
    insights: Insight[];
}

export type InsightType = 'warning' | 'success' | 'info' | 'danger';

export interface Insight {
    id: string;
    type: InsightType;
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
}

export async function getPerformanceData(): Promise<PerformanceData> {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    // Fetch all portfolio items
    // Fetch all portfolio items for the user
    const session = await auth();
    if (!session?.user?.id) {
        // Return empty/zero data if not logged in
        return {
            chartData: [],
            topMovers: [],
            totalValue: 0,
            totalCost: 0,
            totalPnL: 0,
            pnlPercent: 0,
            insights: []
        };
    }

    const items = await prisma.portfolioItem.findMany({
        where: { userId: session.user.id },
        include: {
            card: {
                include: {
                    priceHistory: {
                        orderBy: {
                            date: 'asc',
                        },
                    },
                },
            },
        },
    });

    type PortfolioItemWithHistory = PortfolioItem & {
        card: Card & {
            priceHistory: PriceHistory[];
        };
    };

    const typedItems = items as unknown as PortfolioItemWithHistory[];

    // 1. Calculate Chart Data (Value vs Cost daily)
    const chartData = [];

    // Iterate last 30 days
    for (let i = 30; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');

        let dailyValue = 0;
        let dailyCost = 0;

        typedItems.forEach(item => {
            // Only include if item was purchased before or on this day
            if (item.purchasedAt <= startOfDay(date)) { // Simplified check
                // Find price for this day, or closest previous?
                // For now, simple find. In robust app, we fill gaps.

                // Find specific price history for this day
                const history = item.card.priceHistory.find(ph => isSameDay(ph.date, date));
                const price = history ? history.price : item.card.currentPrice; // Fallback to current if missing

                dailyValue += price * item.quantity;
                dailyCost += item.purchasePrice * item.quantity;
            }
        });

        chartData.push({
            date: dateStr,
            value: Number(dailyValue.toFixed(2)),
            cost: Number(dailyCost.toFixed(2)),
            pnl: Number((dailyValue - dailyCost).toFixed(2)),
        });
    }

    // 2. Calculate Top Movers (24h)
    // Compare currentPrice vs price 1 day ago (or 2 if yesterday unavailable)
    const movers = typedItems.map(item => {
        const history = item.card.priceHistory;
        // Find yesterday's price
        // Assuming sorted ASC
        const currentPrice = item.card.currentPrice;
        let previousPrice = currentPrice;

        if (history.length > 0) {
            // Find most recent history before today? 
            // Or just compare to the last history entry if it's not today?
            // Simplification: Compare to first entry in the 30d window if only one exists, 
            // or the one from yesterday.
            // Let's try to find exactly 1 day ago.
            const yesterday = subDays(today, 1);
            const pastPrice = history.find(ph => isSameDay(ph.date, yesterday));
            if (pastPrice) {
                previousPrice = pastPrice.price;
            } else if (history.length > 1) {
                // Fallback to second to last
                previousPrice = history[history.length - 2].price;
            }
        }

        const change = currentPrice - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

        return {
            id: item.card.id,
            name: item.card.name,
            code: item.card.code,
            image: item.card.image || '',
            price: currentPrice,
            change,
            changePercent
        };
    });

    // Sort by absolute change percent desc, take top 5
    // Actually typically separate lists for Gainers and Losers
    const sortedMovers = [...movers].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 5);

    // Deduplicate by card ID (since user might have multiple lots of same card)
    const uniqueMoversMap = new Map();
    movers.forEach(m => {
        if (!uniqueMoversMap.has(m.id)) {
            uniqueMoversMap.set(m.id, m);
        }
    });
    const uniqueMovers = Array.from(uniqueMoversMap.values())
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 5);

    // Totals
    const currentTotalValue = typedItems.reduce((acc, item) => acc + (item.quantity * item.card.currentPrice), 0);
    const currentTotalCost = typedItems.reduce((acc, item) => acc + (item.quantity * item.purchasePrice), 0);
    const currentTotalPnL = currentTotalValue - currentTotalCost;
    const currentPnLPercent = currentTotalCost > 0 ? (currentTotalPnL / currentTotalCost) * 100 : 0;

    return {
        chartData,
        topMovers: uniqueMovers,
        totalValue: Number(currentTotalValue.toFixed(2)),
        totalCost: Number(currentTotalCost.toFixed(2)),
        totalPnL: Number(currentTotalPnL.toFixed(2)),
        pnlPercent: Number(currentPnLPercent.toFixed(2)),
        insights: await generateInsights(typedItems, currentTotalValue, uniqueMovers),
    };
}

async function generateInsights(
    items: any[],
    totalValue: number,
    movers: any[]
): Promise<Insight[]> {
    const insights: Insight[] = [];

    if (totalValue === 0) return insights;

    // 1. Concentration Risk (Set)
    const setMap = new Map<string, number>();
    items.forEach((item: any) => {
        const val = item.quantity * item.card.currentPrice;
        setMap.set(item.card.set, (setMap.get(item.card.set) || 0) + val);
    });

    for (const [set, val] of setMap.entries()) {
        const percentage = val / totalValue;
        if (percentage > 0.40) { // > 40% in one set
            insights.push({
                id: `concentration-${set}`,
                type: 'warning',
                title: 'High Concentration Risk',
                description: `${(percentage * 100).toFixed(0)}% of your portfolio is in "${set}". Consider diversifying into other sets to reduce risk.`,
            });
        }
    }

    // 2. Top Performer
    const topGainer = movers.length > 0 ? movers[0] : null; // Movers are already sorted by abs change, need to check if positive
    // Re-find actual top gainer from all items if needed, but movers list is good enough for now if it has gainers
    // actually movers in getPerformanceData are sorted by absolute change. Let's find real top gainer.

    // We can just look at the movers list we passed. 
    // It's sorted by ABSOLUTE change percent. 
    // Let's find the best positive one.
    const bestMover = movers.filter((m: any) => m.changePercent > 0).sort((a: any, b: any) => b.changePercent - a.changePercent)[0];

    if (bestMover && bestMover.changePercent > 10) { // Only if > 10%
        insights.push({
            id: `top-gainer-${bestMover.id}`,
            type: 'success',
            title: 'Star Performer',
            description: `"${bestMover.name}" is up ${bestMover.changePercent.toFixed(1)}% in the last 24h!`,
        });
    }

    // 3. Worst Performer (dampener)
    const worstMover = movers.filter((m: any) => m.changePercent < 0).sort((a: any, b: any) => a.changePercent - b.changePercent)[0];
    if (worstMover && worstMover.changePercent < -10) {
        insights.push({
            id: `dip-${worstMover.id}`,
            type: 'danger',
            title: 'Significant Drop',
            description: `"${worstMover.name}" has dropped ${Math.abs(worstMover.changePercent).toFixed(1)}%. Might be a chance to average down?`,
        });
    }

    // 4. Buying Opportunities (Wishlist)
    // We need to fetch wishlist items strictly for this insight
    const session = await auth();
    if (!session?.user?.id) return insights;

    const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: session.user.id },
        include: { card: true },
    });

    const deals = wishlistItems.filter(item => item.card.currentPrice <= item.targetPrice);
    if (deals.length > 0) {
        insights.push({
            id: 'wishlist-deals',
            type: 'info',
            title: 'Buying Opportunities',
            description: `${deals.length} cards in your wishlist have hit their target price.`,
            actionLabel: 'View Wishlist',
            actionUrl: '/wishlist'
        });
    }

    return insights;
}

