import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const content = fs.readFileSync('./scripts/dish.js', 'utf8');
  let dishesObj;
  
  eval(content + '\ndishesObj = dishes;');

  if (!dishesObj || !dishesObj.create) {
    throw new Error('dishes object not found or invalid');
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { name: 'The Royal Feast & Bar' }
  });

  if (!restaurant) {
    console.error('Restaurant not found.');
    return;
  }

  console.log(`Updating dishes for ${restaurant.name} (${restaurant.id})...`);

  console.log('Inserting detailed dishes sequentially...');
  let totalInserted = 0;
  
  for (const dish of dishesObj.create) {
    const rawIngredients = dish.ingredients ? dish.ingredients.create : [];
    
    await prisma.dish.create({
      data: {
        restaurant_id: restaurant.id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        image_url: dish.image_url,
        calories: dish.calories,
        cooking_method: dish.cooking_method,
        recommended_for: dish.recommended_for,
        is_available: dish.is_available,
        ingredients: {
           create: rawIngredients.map(ing => ({
               quantity: ing.quantity,
               unit: ing.unit,
               is_allergen: false,
               ingredient: {
                  connectOrCreate: {
                     where: { name: ing.name },
                     create: { name: ing.name }
                  }
               }
           }))
        }
      }
    });

    totalInserted++;
    console.log(`Inserted dish: ${dish.name} with ${rawIngredients.length} ingredients.`);
  }

  console.log(`Successfully inserted ${totalInserted} dishes!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
