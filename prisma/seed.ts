import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Massive Seeding started...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── 1. Users ──────────────────────────────────────────────
  console.log('Creating users...');
  const user1 = await prisma.user.upsert({
    where: { email: 'dilip@example.com' },
    update: {},
    create: {
      full_name: 'Dilip Meghwal',
      email: 'dilip@example.com',
      phone: '9876500001',
      password_hash: passwordHash,
      latitude: 26.9124,
      longitude: 75.7873,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'rahul.sharma@example.com' },
    update: {},
    create: {
      full_name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876500002',
      password_hash: passwordHash,
      latitude: 19.0760,
      longitude: 72.8777,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'priya.patel@example.com' },
    update: {},
    create: {
      full_name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '9876500003',
      password_hash: passwordHash,
      latitude: 28.6139,
      longitude: 77.2090,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'amit.kumar@example.com' },
    update: {},
    create: {
      full_name: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      phone: '9876500004',
      password_hash: passwordHash,
      latitude: 12.9716,
      longitude: 77.5946,
    },
  });

  const users = [user1, user2, user3, user4];
  console.log(`✅ ${users.length} users created.`);

  // ── 2. Restaurants ────────────────────────────────────────
  console.log('Creating restaurants...');
  const r1 = await prisma.restaurant.upsert({
    where: { email: 'admin@tastybites.com' },
    update: {},
    create: {
      id: 'aa88df4a-8740-4f51-872f-5732155f9889', // Fixed ID for testing
      name: 'Spice Cave',
      email: 'admin@tastybites.com',
      password_hash: passwordHash,
      description: 'Premium multi-cuisine dining in the heart of Mumbai.',
      address: '123 Marine Drive, Mumbai',
      city: 'Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      phone: '0221234567',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      cuisine: ['Indian', 'Chinese', 'Continental'],
      is_active: true,
    },
  });

  const r2 = await prisma.restaurant.upsert({
    where: { email: 'admin@spicecave.com' },
    update: {},
    create: {
      name: 'Rajasthani Rasoi',
      email: 'admin@spicecave.com',
      password_hash: passwordHash,
      description: 'Authentic Rajasthani and North Indian flavors.',
      address: '456 Chandni Chowk, Delhi',
      city: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      phone: '0112345678',
      image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
      cuisine: ['North Indian', 'Rajasthani', 'Mughlai'],
    },
  });

  const r3 = await prisma.restaurant.upsert({
    where: { email: 'admin@greenleaf.com' },
    update: {},
    create: {
      name: 'Green Leaf Cafe',
      email: 'admin@greenleaf.com',
      password_hash: passwordHash,
      description: 'Healthy, organic, and plant-based meals.',
      address: '78 Koramangala, Bangalore',
      city: 'Bangalore',
      latitude: 12.9352,
      longitude: 77.6245,
      phone: '0809876543',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      cuisine: ['Healthy', 'Vegan', 'Salads'],
    },
  });

  const restaurants = [r1, r2, r3];
  console.log('✅ 3 restaurants created.');

  // ── 3. Ingredients ────────────────────────────────────────
  console.log('Creating ingredients...');
  const ingredientNames = [
    'Paneer', 'Chicken', 'Tomato', 'Onion', 'Garlic', 'Ginger',
    'Butter', 'Cream', 'Spinach', 'Mushroom', 'Potato', 'Cheese',
    'Rice', 'Lentils', 'Cumin', 'Coriander', 'Avocado', 'Quinoa',
    'Mutton', 'Red Chili', 'Flour', 'Yogurt',
  ];
  const ingredients: Record<string, any> = {};
  for (const name of ingredientNames) {
    ingredients[name] = await prisma.ingredient.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${ingredientNames.length} ingredients created.`);

  // ── 4. Table Slots ────────────────────────────────────────
  console.log('Creating comprehensive table slots...');
  const timeSlots = [
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', 
    '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
  ];
  for (const r of restaurants) {
    await prisma.tableSlot.deleteMany({ where: { restaurant_id: r.id } });
    for (const time of timeSlots) {
      await prisma.tableSlot.create({
        data: {
          restaurant_id: r.id,
          time,
          total_seats: 30,
          booked_seats: Math.floor(Math.random() * 25),
        },
      });
    }
  }
  console.log('✅ 24 table slots created.');

  // ── 5. Dishes ─────────────────────────────────────────────
  console.log('Creating comprehensive dish catalog...');
  const allDishes = [];

  // Restaurant 1: Spice Cave (Mix of Indian/Continental)
  const r1Dishes = [
    { name: 'Paneer Butter Masala', price: 320, cat: 'Main Course', cals: 450, ings: ['Paneer', 'Tomato', 'Butter', 'Cream'] },
    { name: 'Butter Chicken', price: 420, cat: 'Main Course', cals: 550, ings: ['Chicken', 'Butter', 'Cream', 'Tomato'] },
    { name: 'Dal Makhani', price: 280, cat: 'Main Course', cals: 380, ings: ['Lentils', 'Butter', 'Cream'] },
    { name: 'Mushroom Risotto', price: 400, cat: 'Continental', cals: 400, ings: ['Mushroom', 'Cheese', 'Garlic'] },
    { name: 'Garlic Naan', price: 80, cat: 'Breads', cals: 200, ings: ['Flour', 'Garlic', 'Butter'] },
  ];

  // Restaurant 2: Rajasthani Rasoi
  const r2Dishes = [
    { name: 'Lal Maas', price: 550, cat: 'Main Course', cals: 650, ings: ['Mutton', 'Red Chili', 'Yogurt'] },
    { name: 'Rajasthani Thali', price: 599, cat: 'Special Thali', cals: 900, ings: ['Flour', 'Lentils', 'Butter', 'Paneer'] },
    { name: 'Chicken Biryani', price: 380, cat: 'Biryani', cals: 700, ings: ['Chicken', 'Rice', 'Onion'] },
    { name: 'Gatte ki Sabzi', price: 250, cat: 'Specialty', cals: 300, ings: ['Yogurt', 'Onion', 'Garlic'] },
    { name: 'Dal Baati', price: 350, cat: 'Specialty', cals: 800, ings: ['Lentils', 'Flour', 'Butter'] },
  ];

  // Restaurant 3: Green Leaf Cafe
  const r3Dishes = [
    { name: 'Avocado Quinoa Bowl', price: 450, cat: 'Bowls', cals: 350, ings: ['Avocado', 'Quinoa', 'Tomato'] },
    { name: 'Spinach Smoothie', price: 180, cat: 'Beverages', cals: 150, ings: ['Spinach', 'Yogurt'] },
    { name: 'Mushroom Salad', price: 220, cat: 'Salads', cals: 120, ings: ['Mushroom', 'Spinach', 'Onion'] },
    { name: 'Garlic Potato Wedges', price: 150, cat: 'Starters', cals: 250, ings: ['Potato', 'Garlic'] },
    { name: 'Cheese Quinoa Patty', price: 300, cat: 'Starters', cals: 320, ings: ['Quinoa', 'Cheese', 'Onion'] },
  ];

  const createDishesSet = async (restId: string, dataset: any[]) => {
    const created = [];
    for (const item of dataset) {
      const dish = await prisma.dish.create({
        data: {
          restaurant_id: restId,
          name: item.name,
          price: item.price,
          category: item.cat,
          calories: item.cals,
          description: `Freshly prepared ${item.name} with premium ingredients.`,
          ingredients: {
            create: item.ings?.map((ingName: string) => ({
              ingredient_id: ingredients[ingName].id,
            })) || [],
          },
        },
      });
      created.push(dish);
    }
    return created;
  };

  const dr1 = await createDishesSet(r1.id, r1Dishes);
  const dr2 = await createDishesSet(r2.id, r2Dishes);
  const dr3 = await createDishesSet(r3.id, r3Dishes);
  allDishes.push(...dr1, ...dr2, ...dr3);
  console.log(`✅ ${allDishes.length} dishes created with ingredient mappings.`);

  // ── 6. Offers ─────────────────────────────────────────────
  console.log('Creating multi-state offers...');
  for (const r of restaurants) {
    // Active Offer
    await prisma.offer.create({
      data: {
        restaurant_id: r.id,
        title: 'Special 20% Discount',
        discount_percent: 20,
        valid_from: new Date(),
        valid_to: new Date(Date.now() + 15 * 24 * 3600000),
        is_active: true,
      },
    });
    // Expired Offer
    await prisma.offer.create({
      data: {
        restaurant_id: r.id,
        title: 'New Year Blast 50%',
        discount_percent: 50,
        valid_from: new Date(Date.now() - 60 * 24 * 3600000),
        valid_to: new Date(Date.now() - 30 * 24 * 3600000),
        is_active: false,
      },
    });
    // Upcoming Offer
    await prisma.offer.create({
      data: {
        restaurant_id: r.id,
        title: 'IPL Final Craze 25%',
        discount_percent: 25,
        valid_from: new Date(Date.now() + 30 * 24 * 3600000),
        valid_to: new Date(Date.now() + 45 * 24 * 3600000),
        is_active: true,
      },
    });
  }
  console.log('✅ 9 offers (Active, Expired, Upcoming) created.');

  // ── 7. Orders ─────────────────────────────────────────────
  console.log('Creating rich order history...');
  const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  for (let i = 0; i < 40; i++) {
    const rest = restaurants[i % 3];
    const user = users[i % 4];
    const status = statuses[i % 6];
    const dishSet = rest.id === r1.id ? dr1 : (rest.id === r2.id ? dr2 : dr3);
    
    const order = await prisma.order.create({
      data: {
        user_id: user.id,
        restaurant_id: rest.id,
        status: status as any,
        dining_option: i % 2 === 0 ? 'DINE_IN' : 'PICKUP',
        created_at: new Date(Date.now() - (i % 10) * 24 * 3600000),
      },
    });

    await prisma.orderItem.create({
      data: {
        order_id: order.id,
        dish_id: dishSet[i % 5].id,
        quantity: (i % 3) + 1,
      },
    });
  }
  console.log('✅ 40 orders with item breakdown created.');

  // ── 8. Reviews ────────────────────────────────────────────
  console.log('Creating customer reviews...');
  for (const r of restaurants) {
    for (let i = 1; i <= 5; i++) {
        await prisma.review.create({
            data: {
                user_id: users[i % 4].id,
                restaurant_id: r.id,
                rating: 5 - (i % 2),
                comment: i % 2 === 0 ? 'Excellent food and service!' : 'Really enjoyed the flavors, will come back again.',
                avatar: `https://i.pravatar.cc/150?u=${r.id.slice(0,4)}${i}`,
            }
        });
    }
  }
  console.log('✅ 15 reviews created.');

  // ── 9. QR Codes ──────────────────────────────────────────
  console.log('Updating QR codes...');
  for (const r of restaurants) {
    await prisma.restaurantQRCode.upsert({
      where: { restaurant_id: r.id },
      update: {},
      create: {
        restaurant_id: r.id,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${r.id}&size=300x300`,
      },
    });
  }
  console.log('✅ QR codes verified for all.');

  console.log('\n🚀 THE WORLD OF RMS HAS BEEN FULLY SEEDED! 🚀');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
