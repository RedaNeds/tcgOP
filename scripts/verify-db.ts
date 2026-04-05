
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.card.count();
    console.log(`Total cards in DB: ${count}`);

    const cards = await prisma.card.findMany({ take: 3 });
    console.log('Sample cards:', JSON.stringify(cards, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
