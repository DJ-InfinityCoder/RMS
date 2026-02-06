import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create a Restaurant
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Gourmet Haven',
            description: 'Fine dining experience with modern fusion cuisine.',
            address: '123 Culinary Blvd',
            city: 'Food City',
            latitude: 40.7128,
            longitude: -74.0060,
            phone: '555-0199',
            is_active: true,
            qr_code: {
                create: {
                    qr_code_url: 'https://example.com/qr/gourmet-haven',
                },
            },
        },
    });

    console.log(`Created restaurant: ${restaurant.name} (${restaurant.id})`);

    // 2. Create Ingredients
    const cheese = await prisma.ingredient.create({ data: { name: 'Cheese' } });
    const tomato = await prisma.ingredient.create({ data: { name: 'Tomato' } });
    const basil = await prisma.ingredient.create({ data: { name: 'Basil' } });
    const flour = await prisma.ingredient.create({ data: { name: 'Flour' } });

    // 3. Create Dishes
    const pizza = await prisma.dish.create({
        data: {
            restaurant_id: restaurant.id,
            name: 'Margherita Pizza',
            description: 'Classic pizza with fresh mozzarella and basil.',
            price: 12.99,
            calories: 800,
            image_url: 'https://placehold.co/600x400',
            ingredients: {
                create: [
                    { ingredient_id: cheese.id },
                    { ingredient_id: tomato.id },
                    { ingredient_id: basil.id },
                    { ingredient_id: flour.id },
                ],
            },
            is_available: true,
        },
    });

    const pasta = await prisma.dish.create({
        data: {
            restaurant_id: restaurant.id,
            name: 'Spaghetti Pomodoro',
            description: 'Fresh pasta with tomato sauce.',
            price: 10.50,
            calories: 600,
            image_url: 'https://placehold.co/600x400',
            ingredients: {
                create: [
                    { ingredient_id: tomato.id },
                    { ingredient_id: basil.id },
                    { ingredient_id: flour.id },
                ],
            },
        },
    });

    console.log(`Created dishes: ${pizza.name}, ${pasta.name}`);

    // 4. Create an Offer
    await prisma.offer.create({
        data: {
            restaurant_id: restaurant.id,
            title: 'Lunch Special',
            discount_percent: 15,
            valid_from: new Date(),
            valid_to: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
