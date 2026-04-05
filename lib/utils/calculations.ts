/**
 * Centralized utility for all financial calculations in the OPTCG Tracker.
 * Shared between Dashboard, Portfolio, and Performance views.
 */

export interface PnLResult {
    cost: number;
    value: number;
    pnl: number;
    pnlPercent: number;
}

/**
 * Calculates Profit & Loss (P&L) for a set of items or a single item.
 */
export function calculatePnL(quantity: number, purchasePrice: number, currentPrice: number): PnLResult {
    const cost = quantity * purchasePrice;
    const value = quantity * (currentPrice || purchasePrice || 0);
    const pnl = value - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

    return { cost, value, pnl, pnlPercent };
}

/**
 * Aggregates P&L for an array of items.
 */
export function aggregatePnL(items: { quantity: number; purchasePrice: number; currentPrice: number }[]): PnLResult {
    let totalCost = 0;
    let totalValue = 0;

    items.forEach(item => {
        totalCost += item.quantity * item.purchasePrice;
        totalValue += item.quantity * (item.currentPrice || item.purchasePrice || 0);
    });

    const pnl = totalValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    return { cost: totalCost, value: totalValue, pnl, pnlPercent };
}

/**
 * Formats a P&L value for display (adding + or - prefixes)
 */
export function formatPnLPrefix(pnl: number): string {
    if (pnl > 0) return '+';
    return '';
}

/**
 * Determines the color class for a P&L value
 */
export function getPnLColor(pnl: number): string {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-muted-foreground';
}
