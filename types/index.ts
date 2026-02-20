export interface Card {
    id: string; // e.g. "OP01-001"
    name: string;
    set: string;
    code: string; // The card code visible on card
    rarity: string;
    image: string;
    price: number; // Current market price
    // Historical data for charts
    history?: { date: string; value: number }[];
}

export interface PortfolioItem {
    id: string; // UUID for the entry
    cardId: string;
    name: string;
    image: string;
    set: string;
    code: string;
    rarity: string;
    quantity: number;
    purchasePrice: number; // Per-card cost basis
    currentPrice: number;  // Latest market price
    dateAdded: string;
}

export interface PortfolioSummary {
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
}
