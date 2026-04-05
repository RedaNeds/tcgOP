import { PriceHistory } from '@prisma/client';

export type TimingBadge = 'Diamond Hand' | 'Fair Value' | 'FOMO' | 'N/A';

export function getMarketTimingBadge(
    purchasePrice: number,
    history: PriceHistory[]
): { badge: TimingBadge; color: string } {
    if (!history || history.length === 0) {
        return { badge: 'N/A', color: 'text-muted-foreground' };
    }

    // Sort history by price to find min/avg
    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Diamond Hand: Bought within 10% of historic low
    if (purchasePrice <= minPrice * 1.1) {
        return { badge: 'Diamond Hand', color: 'text-amber-400' };
    }

    // FOMO: Bought at 30%+ premium over average
    if (purchasePrice > avgPrice * 1.3) {
        return { badge: 'FOMO', color: 'text-red-400' };
    }

    // Fair Value: Otherwise
    return { badge: 'Fair Value', color: 'text-blue-400' };
}
