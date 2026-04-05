/**
 * Marketplace URL builders for One Piece TCG cards.
 * Card codes follow the pattern: OP01-001, ST01-001, etc.
 */

export function getTCGPlayerUrl(cardName: string, cardCode: string): string {
    const query = encodeURIComponent(`${cardName} ${cardCode} One Piece`);
    return `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${query}&view=grid`;
}

export function getCardmarketUrl(cardName: string, cardCode: string): string {
    const query = encodeURIComponent(`${cardName} ${cardCode}`);
    return `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${query}`;
}

export function getEbayUrl(cardName: string, cardCode: string): string {
    const query = encodeURIComponent(`One Piece TCG ${cardName} ${cardCode}`);
    return `https://www.ebay.com/sch/i.html?_nkw=${query}&_sacat=0&LH_Sold=1&LH_Complete=1`;
}
