'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Updates prices for all cards in the database by scraping detailed card pages.
 * This is a heavy operation and should be run via CRON or manually with caution.
 */
export async function updateAllCardPrices() {
    try {
        const cards = await prisma.card.findMany();
        console.log(`Starting price update for ${cards.length} cards...`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errors = 0;

        for (const card of cards) {
            try {
                const price = await fetchPriceForCard(card.code);

                if (price !== null && price > 0) {
                    // Only update if price actually changed (with 1% tolerance for noise)
                    const priceChanged = Math.abs(price - card.currentPrice) / Math.max(card.currentPrice, 0.01) > 0.01;

                    await prisma.$transaction([
                        prisma.card.update({
                            where: { id: card.id },
                            data: { currentPrice: price },
                        }),
                        // Always record history, even if price same (for trend data)
                        prisma.priceHistory.create({
                            data: {
                                cardId: card.id,
                                price: price,
                                date: new Date(),
                            },
                        }),
                    ]);

                    if (priceChanged) {
                        updatedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    // Price not found — keep last known price, don't wipe
                    console.warn(`  ⚠ No price found for ${card.code}, keeping $${card.currentPrice}`);
                    skippedCount++;
                }
            } catch (err) {
                console.error(`  ✗ Failed to update ${card.code}:`, err instanceof Error ? err.message : err);
                errors++;
            }

            // Polite delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        console.log(`\n✅ Price update complete:`);
        console.log(`   Updated: ${updatedCount} | Unchanged: ${skippedCount} | Errors: ${errors}`);

        revalidatePath('/', 'layout');
        return { success: true, updated: updatedCount, skipped: skippedCount, errors };
    } catch (error) {
        console.error('Fatal error in updateAllCardPrices:', error);
        return { success: false, error: 'Internal Server Error' };
    }
}

/**
 * Scrapes LimitlessTCG for a specific card's price.
 * Tries multiple price extraction patterns for robustness.
 */
async function fetchPriceForCard(code: string, retries = 2): Promise<number | null> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const url = `https://onepiece.limitlesstcg.com/cards/${code}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                next: { revalidate: 0 },
            });

            if (response.status === 404) {
                console.warn(`  ⚠ Card page not found: ${code}`);
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();

            // Try multiple price patterns for robustness
            // Pattern 1: TCGPlayer price link — [$X.XX](https://partner.tcgplayer.com...)
            const tcgPlayerPattern = /\$(\d{1,5}\.\d{2})\s*<\/a>/;
            let match = html.match(tcgPlayerPattern);

            if (!match) {
                // Pattern 2: Generic dollar price in a price-like container
                const genericPricePattern = /class="[^"]*price[^"]*"[^>]*>\s*\$(\d{1,5}\.\d{2})/i;
                match = html.match(genericPricePattern);
            }

            if (!match) {
                // Pattern 3: Fallback — first $X.XX occurrence after the main content area
                const fallbackPattern = /\$(\d{1,4}\.\d{2})/;
                match = html.match(fallbackPattern);
            }

            if (match && match[1]) {
                const price = parseFloat(match[1]);
                if (price > 0 && price < 100000) {
                    return price;
                }
            }

            return null;
        } catch (error) {
            if (attempt < retries) {
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            console.error(`Error fetching price for ${code} after ${retries + 1} attempts:`, error instanceof Error ? error.message : error);
            return null;
        }
    }
    return null;
}
