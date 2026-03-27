import { prisma } from './lib/prisma';

async function check() {
    const counts = await prisma.restaurant.count({ where: { is_active: true } });
    console.log('Active restaurants:', counts);
    
    const first = await prisma.restaurant.findFirst({ where: { is_active: true } });
    if (first) {
        console.log('First restaurant ID:', first.id);
        const slots = await prisma.tableSlot.count({ where: { restaurant_id: first.id } });
        const reviews = await prisma.review.count({ where: { restaurant_id: first.id } });
        console.log('Slots:', slots, 'Reviews:', reviews);
    } else {
        console.log('No active restaurants found!');
    }
}

check();
