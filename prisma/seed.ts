const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clear existing data
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.dishIngredient.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.dish.deleteMany();
    await prisma.restaurantQRCode.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.userFoodPreference.deleteMany();
    await prisma.user.deleteMany();

    // Create a restaurant
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Pizza Palace',
            description: 'The best pizza in town',
            address: '123 Main St',
            city: 'Food City',
            dishes: {
                create: [
                    {
                        name: 'Margherita Pizza',
                        description: 'Classic tomato and mozzarella',
                        price: 12.99,
                        is_available: true,
                    },
                    {
                        name: 'Pepperoni Pizza',
                        description: 'Spicy pepperoni with extra cheese',
                        price: 15.99,
                        is_available: true,
                    },
                ],
            },
        },
    });

    console.log(`Seeded restaurant: ${restaurant.name}`);
    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
