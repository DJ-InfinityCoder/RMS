import { prisma } from './lib/prisma';

async function testCreateDish() {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
        console.error('No restaurant found to test with.');
        return;
    }

    console.log('Testing with restaurant:', restaurant.id);

    // Mock request body
    const body = {
        name: 'Test Dish ' + Date.now(),
        price: 299.99,
        description: 'Test Description',
        cooking_method: 'Test Method',
        calories: 500,
        recommended_for: 'Test Recommendation',
        is_available: true
    };

    try {
        const dish = await prisma.dish.create({
            data: {
                restaurant_id: restaurant.id,
                name: body.name,
                description: body.description,
                cooking_method: body.cooking_method,
                calories: body.calories,
                price: body.price,
                recommended_for: body.recommended_for,
                is_available: body.is_available
            }
        });
        console.log('Successfully created dish:', dish.id, dish.name);
        
        // Cleanup (optional)
        // await prisma.dish.delete({ where: { id: dish.id } });
    } catch (error) {
        console.error('Error creating dish:', error);
    }
}

testCreateDish().catch(console.error).finally(() => prisma.$disconnect());
