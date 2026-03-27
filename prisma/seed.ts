const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing database...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.dishIngredient.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.dish.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.restaurantQRCode.deleteMany();
    await prisma.user.deleteMany();
    await prisma.restaurant.deleteMany();

    console.log('Seeding relatable data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Restaurants
    const bistro = await prisma.restaurant.create({
        data: {
            name: 'The Spicy Bistro',
            email: 'admin@spicy.com',
            password_hash: passwordHash,
            description: 'Experience the finest Indian fusion and traditional spices.',
            address: '45, Connaught Place',
            city: 'New Delhi',
            phone: '011-23456789',
        }
    });

    const tandoor = await prisma.restaurant.create({
        data: {
            name: 'Tandoori Nights',
            email: 'admin@tandoor.com',
            password_hash: passwordHash,
            description: 'Authentic clay oven specialties and rich curries.',
            address: 'H-12, Sector 18',
            city: 'Noida',
            phone: '0120-1234567',
        }
    });

    // 2. Create Ingredients
    const ingredients = await Promise.all([
        prisma.ingredient.create({ data: { name: 'Chicken' } }),
        prisma.ingredient.create({ data: { name: 'Paneer' } }),
        prisma.ingredient.create({ data: { name: 'Tomato' } }),
        prisma.ingredient.create({ data: { name: 'Basmati Rice' } }),
        prisma.ingredient.create({ data: { name: 'Butter' } }),
    ]);

    // 4. Create Dishes
    const butterChicken = await prisma.dish.create({
        data: {
            restaurant_id: bistro.id,
            name: 'Classic Butter Chicken',
            description: 'Tender chicken in a creamy tomato gravy with pure butter.',
            price: 450,
            calories: 650,
            cooking_method: 'Slow Cooked',
            recommended_for: 'Dinner',
            image_url: 'https://images.unsplash.com/photo-1603894584202-9ca3fd90caef',
            is_available: true,
        }
    });

    const paneerTikka = await prisma.dish.create({
        data: {
            restaurant_id: bistro.id,
            name: 'Paneer Tikka',
            description: 'Grilled cottage cheese cubes marinated in yogurt and spices.',
            price: 320,
            calories: 350,
            cooking_method: 'Tandoor Grilled',
            recommended_for: 'Starter',
            is_available: true,
        }
    });

    const biryani = await prisma.dish.create({
        data: {
            restaurant_id: tandoor.id,
            name: 'Hyderabadi Dum Biryani',
            description: 'Fragrant basmati rice layered with spiced meat and herbs.',
            price: 380,
            calories: 750,
            cooking_method: 'Dum Pukht',
            recommended_for: 'Main Course',
            is_available: true,
        }
    });

    // 5. Create Sample Orders
    const order1 = await prisma.order.create({
        data: {
            restaurant_id: bistro.id,
            status: 'COMPLETED',
            dining_option: 'DINE_IN',
            order_items: {
                create: [
                    { dish_id: butterChicken.id, quantity: 2 },
                    { dish_id: paneerTikka.id, quantity: 1 },
                ]
            }
        }
    });

    const order2 = await prisma.order.create({
        data: {
            restaurant_id: bistro.id,
            status: 'PENDING',
            dining_option: 'PICKUP',
            order_items: {
                create: [
                    { dish_id: butterChicken.id, quantity: 1 },
                ]
            }
        }
    });

    // 6. Create Reviews
    await prisma.review.create({
        data: {
            dish_id: butterChicken.id,
            rating: 5,
            comment: 'Best butter chicken I had in years!',
        }
    });

    console.log('Seeding complete! Logins:');
    console.log('- admin@spicy.com / password123');
    console.log('- admin@tandoor.com / password123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
