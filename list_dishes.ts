import { prisma } from './lib/prisma';

async function main() {
    const dishes = await prisma.dish.findMany({
        take: 5,
        orderBy: { id: 'desc' }
    });
    console.log('Recent Dishes:', JSON.stringify(dishes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
