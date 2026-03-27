import { prisma } from './lib/prisma';

async function main() {
    // Check if any restaurant exists
    const existing = await prisma.restaurant.findFirst();
    if (existing) {
        console.log('Restaurant already exists:', existing.id);
        return;
    }

    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'The Great Indian Kitchen',
            description: 'Authentic Indian Cuisine',
            address: '123 Food Street, Delhi',
            city: 'Delhi',
            phone: '1234567890',
            is_active: true,
        },
    });
    console.log('Created restaurant:', restaurant.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
