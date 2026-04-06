'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendPushNotification } from '@/lib/push';

const PRICE_CHANGE_THRESHOLD = 0.15; // 15% threshold for spikes/drops
const NOTIFICATION_COOLDOWN_HOURS = 12;
const FETCH_TIMEOUT_MS = 12000;
const PRICE_UPDATE_BATCH_SIZE = 5;
const PRICE_UPDATE_BATCH_DELAY_MS = 500;

type PriceUpdateResult = 'updated' | 'skipped' | 'error';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Updates prices for all cards in the database by scraping detailed card pages.
 * This is a heavy operation and should be run via CRON or manually with caution.
 */
export async function updateAllCardPrices() {
    const startedAt = Date.now();
    try {
        const cards = await prisma.card.findMany();
        console.log(`Starting price update for ${cards.length} cards...`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errors = 0;

        for (let i = 0; i < cards.length; i += PRICE_UPDATE_BATCH_SIZE) {
            const batch = cards.slice(i, i + PRICE_UPDATE_BATCH_SIZE);
            const batchResults = await Promise.all(batch.map(card => updateCardPrice(card)));

            for (const result of batchResults) {
                if (result === 'updated') updatedCount++;
                else if (result === 'skipped') skippedCount++;
                else errors++;
            }

            if (i + PRICE_UPDATE_BATCH_SIZE < cards.length) {
                await sleep(PRICE_UPDATE_BATCH_DELAY_MS);
            }
        }

        const durationMs = Date.now() - startedAt;
        console.log(`\n✅ Price update complete:`);
        console.log(`   Updated: ${updatedCount} | Unchanged: ${skippedCount} | Errors: ${errors} | Duration: ${durationMs}ms`);

        revalidatePath('/', 'layout');
        return {
            success: true,
            updated: updatedCount,
            skipped: skippedCount,
            errors,
            processed: cards.length,
            batchSize: PRICE_UPDATE_BATCH_SIZE,
            durationMs,
        };
    } catch (error) {
        console.error('Fatal error in updateAllCardPrices:', error);
        return {
            success: false,
            error: 'Internal Server Error',
            durationMs: Date.now() - startedAt,
        };
    }
}

async function updateCardPrice(card: { id: string; code: string; name: string; currentPrice: number }): Promise<PriceUpdateResult> {
    try {
        const price = await fetchPriceForCard(card.code);

        if (price === null || price <= 0) {
            console.warn(`  ⚠ No price found for ${card.code}, keeping $${card.currentPrice}`);
            return 'skipped';
        }

        const oldPrice = Math.max(card.currentPrice, 0.01);
        const diff = price - oldPrice;
        const percentChange = diff / oldPrice;
        const isSpike = percentChange >= PRICE_CHANGE_THRESHOLD;
        const isDrop = percentChange <= -PRICE_CHANGE_THRESHOLD;
        const priceChanged = Math.abs(percentChange) > 0.01;

        await prisma.$transaction(async (tx) => {
            const cooldownStart = new Date(Date.now() - NOTIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000);

            const hasRecentNotification = async (userId: string, type: string) => {
                const existing = await tx.notification.findFirst({
                    where: {
                        userId,
                        cardId: card.id,
                        type,
                        createdAt: { gte: cooldownStart },
                    },
                    select: { id: true },
                });
                return Boolean(existing);
            };

            await tx.card.update({
                where: { id: card.id },
                data: { currentPrice: price },
            });

            await tx.priceHistory.create({
                data: {
                    cardId: card.id,
                    price,
                    date: new Date(),
                },
            });

            if (priceChanged) {
                const wishlistItems = await tx.wishlistItem.findMany({
                    where: {
                        cardId: card.id,
                        targetPrice: { gte: price }
                    },
                    include: { user: true }
                });

                for (const item of wishlistItems) {
                    if (oldPrice > item.targetPrice && price <= item.targetPrice && item.user?.alertMilestones) {
                        const alreadyNotified = await hasRecentNotification(item.userId!, 'WISHLIST_TARGET');
                        if (alreadyNotified) continue;

                        await tx.notification.create({
                            data: {
                                userId: item.userId!,
                                type: 'WISHLIST_TARGET',
                                title: 'Target Price Reached!',
                                message: `${card.name} (${card.code}) has dropped to $${price.toFixed(2)}, reaching your target of $${item.targetPrice.toFixed(2)}!`,
                                cardId: card.id,
                                link: '/app/wishlist',
                            }
                        });

                        // Trigger Push Notification
                        await sendPushNotification(item.userId!, {
                            title: 'Target Price Reached!',
                            message: `${card.name} (${card.code}) has dropped to $${price.toFixed(2)}, reaching your target of $${item.targetPrice.toFixed(2)}!`,
                            link: '/app/wishlist',
                            cardId: card.id,
                        });
                    }
                }
            }

            if (isSpike || isDrop) {
                const portfolioHolders = await tx.portfolioItem.findMany({
                    where: { cardId: card.id },
                    select: { userId: true },
                    distinct: ['userId']
                });

                for (const holder of portfolioHolders) {
                    if (!holder.userId) continue;

                    const user = await tx.user.findUnique({
                        where: { id: holder.userId },
                        select: { alertPriceSpike: true, alertPriceDrop: true }
                    });

                    if (isSpike && user?.alertPriceSpike) {
                        const alreadyNotified = await hasRecentNotification(holder.userId, 'PRICE_SPIKE');
                        if (alreadyNotified) continue;

                        await tx.notification.create({
                            data: {
                                userId: holder.userId,
                                type: 'PRICE_SPIKE',
                                title: 'Price Spike Detected 🚀',
                                message: `${card.name} (${card.code}) is up ${(percentChange * 100).toFixed(1)}% to $${price.toFixed(2)}`,
                                cardId: card.id,
                                link: `/app/cards/${card.id}`,
                            }
                        });

                        // Trigger Push Notification
                        await sendPushNotification(holder.userId, {
                            title: 'Price Spike Detected 🚀',
                            message: `${card.name} (${card.code}) is up ${(percentChange * 100).toFixed(1)}% to $${price.toFixed(2)}`,
                            link: `/app/cards/${card.id}`,
                            cardId: card.id,
                        });
                    } else if (isDrop && user?.alertPriceDrop) {
                        const alreadyNotified = await hasRecentNotification(holder.userId, 'PRICE_DROP');
                        if (alreadyNotified) continue;

                        await tx.notification.create({
                            data: {
                                userId: holder.userId,
                                type: 'PRICE_DROP',
                                title: 'Price Drop Detected 📉',
                                message: `${card.name} (${card.code}) is down ${Math.abs(percentChange * 100).toFixed(1)}% to $${price.toFixed(2)}`,
                                cardId: card.id,
                                link: `/app/cards/${card.id}`,
                            }
                        });

                        // Trigger Push Notification
                        await sendPushNotification(holder.userId, {
                            title: 'Price Drop Detected 📉',
                            message: `${card.name} (${card.code}) is down ${Math.abs(percentChange * 100).toFixed(1)}% to $${price.toFixed(2)}`,
                            link: `/app/cards/${card.id}`,
                            cardId: card.id,
                        });
                    }
                }
            }
        });

        return priceChanged ? 'updated' : 'skipped';
    } catch (err) {
        console.error(`  ✗ Failed to update ${card.code}:`, err instanceof Error ? err.message : err);
        return 'error';
    }
}

/**
 * Scrapes LimitlessTCG for a specific card's price.
 * Tries multiple price extraction patterns for robustness.
 */
async function fetchPriceForCard(code: string, retries = 2): Promise<number | null> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        try {
            const url = `https://onepiece.limitlesstcg.com/cards/${code}`;
            const controller = new AbortController();
            timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                next: { revalidate: 0 },
                signal: controller.signal,
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
        } finally {
            if (timeout) clearTimeout(timeout);
        }
    }
    return null;
}
