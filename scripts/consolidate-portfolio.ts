
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting portfolio consolidation...');

    // 1. Fetch all portfolio items
    const items = await prisma.portfolioItem.findMany();

    // 2. Group by cardId
    const grouped = new Map<string, typeof items>();

    for (const item of items) {
        if (!grouped.has(item.cardId)) {
            grouped.set(item.cardId, []);
        }
        grouped.get(item.cardId)?.push(item);
    }

    let consolidatedCount = 0;

    // 3. Process groups
    for (const [cardId, group] of grouped.entries()) {
        if (group.length > 1) {
            console.log(`Consolidating ${group.length} entries for card ${cardId}...`);

            let totalQty = 0;
            let totalCost = 0; // total value at purchase

            // Calculate totals
            for (const item of group) {
                totalQty += item.quantity;
                totalCost += (item.quantity * item.purchasePrice);
            }

            const weightedAvgPrice = totalCost / totalQty;

            // Keep the first item (or oldest), update it, delete the rest
            // Sort by createdAt usually, but here arbitrary first is fine
            const [keep, ...remove] = group;

            // Update keeper
            await prisma.portfolioItem.update({
                where: { id: keep.id },
                data: {
                    quantity: totalQty,
                    purchasePrice: weightedAvgPrice,
                    updatedAt: new Date(),
                }
            });

            // Delete others
            const removeIds = remove.map(i => i.id);
            await prisma.portfolioItem.deleteMany({
                where: {
                    id: { in: removeIds }
                }
            });

            consolidatedCount++;
        }
    }

    console.log(`Consolidation complete. Merged ${consolidatedCount} sets of duplicates.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
