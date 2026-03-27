import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding started...');

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
      name: 'Tasty Bites',
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
    },
  });

  const r2 = await prisma.restaurant.upsert({
    where: { email: 'admin@spicecave.com' },
    update: {},
    create: {
      name: 'Spice Cave',
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

  console.log('✅ 3 restaurants created.');

  // ── 3. Ingredients ────────────────────────────────────────
  console.log('Creating ingredients...');
  const ingredientNames = [
    'Paneer', 'Chicken', 'Tomato', 'Onion', 'Garlic', 'Ginger',
    'Butter', 'Cream', 'Spinach', 'Mushroom', 'Potato', 'Cheese',
    'Rice', 'Lentils', 'Cumin', 'Coriander',
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
  console.log('Creating table slots...');
  const timeSlots = ['12:00 PM', '01:00 PM', '02:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
  for (const r of [r1, r2, r3]) {
    const count = await prisma.tableSlot.count({ where: { restaurant_id: r.id } });
    if (count === 0) {
      for (const time of timeSlots) {
        await prisma.tableSlot.create({
          data: {
            restaurant_id: r.id,
            time,
            total_seats: 20,
            booked_seats: Math.floor(Math.random() * 12),
          },
        });
      }
    }
  }
  console.log('✅ Table slots created.');

  // ── 5. Dishes ─────────────────────────────────────────────
  console.log('Creating dishes...');

  // --- Tasty Bites dishes ---
  const d1 = await prisma.dish.create({
    data: {
      restaurant_id: r1.id,
      name: 'Paneer Butter Masala',
      description: 'Rich, creamy tomato curry with soft paneer cubes.',
      price: 320.00,
      category: 'Main Course',
      calories: 450,
      cooking_method: 'Slow cooked in tandoor-roasted tomato gravy',
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7',
      ingredients: {
        create: [
          { ingredient_id: ingredients['Paneer'].id },
          { ingredient_id: ingredients['Tomato'].id },
          { ingredient_id: ingredients['Butter'].id },
          { ingredient_id: ingredients['Cream'].id },
        ],
      },
    },
  });

  const d2 = await prisma.dish.create({
    data: {
      restaurant_id: r1.id,
      name: 'Butter Chicken',
      description: 'Tender chicken pieces in a velvety, buttery tomato sauce.',
      price: 420.00,
      category: 'Main Course',
      calories: 550,
      cooking_method: 'Charcoal grilled, then simmered in makhani gravy',
      image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
      ingredients: {
        create: [
          { ingredient_id: ingredients['Chicken'].id },
          { ingredient_id: ingredients['Butter'].id },
          { ingredient_id: ingredients['Cream'].id },
          { ingredient_id: ingredients['Tomato'].id },
        ],
      },
    },
  });

  const d3 = await prisma.dish.create({
    data: {
      restaurant_id: r1.id,
      name: 'Dal Makhani',
      description: 'Black lentils slow-cooked overnight with butter and cream.',
      price: 280.00,
      category: 'Main Course',
      calories: 380,
      image_url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6',
      ingredients: {
        create: [
          { ingredient_id: ingredients['Lentils'].id },
          { ingredient_id: ingredients['Butter'].id },
          { ingredient_id: ingredients['Cream'].id },
        ],
      },
    },
  });

  const d4 = await prisma.dish.create({
    data: {
      restaurant_id: r1.id,
      name: 'Mushroom Risotto',
      description: 'Creamy Italian rice dish loaded with wild mushrooms.',
      price: 400.00,
      category: 'Continental',
      calories: 400,
      image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371',
      ingredients: {
        create: [
          { ingredient_id: ingredients['Mushroom'].id },
          { ingredient_id: ingredients['Cheese'].id },
          { ingredient_id: ingredients['Garlic'].id },
        ],
      },
    },
  });

  const d5 = await prisma.dish.create({
    data: {
      restaurant_id: r1.id,
      name: 'Garlic Naan',
      description: 'Soft tandoori naan topped with garlic and butter.',
      price: 80.00,
      category: 'Breads',
      calories: 200,
      image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
    },
  });

  // --- Spice Cave dishes ---
  const d6 = await prisma.dish.create({
    data: {
      restaurant_id: r2.id,
      name: 'Lal Maas',
      description: 'Fiery Rajasthani mutton curry with red chilies.',
      price: 550.00,
      category: 'Main Course',
      calories: 650,
      image_url: 'https://images.unsplash.com/photo-1542367592-8849eb950fd8',
    },
  });

  const d7 = await prisma.dish.create({
    data: {
      restaurant_id: r2.id,
      name: 'Rajasthani Thali',
      description: 'Dal Baati Churma, Gatte ki Sabzi, Ker Sangri and more.',
      price: 599.00,
      category: 'Special Thali',
      calories: 900,
      image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0',
    },
  });

  const d8 = await prisma.dish.create({
    data: {
      restaurant_id: r2.id,
      name: 'Chicken Biryani',
      description: 'Hyderabadi-style dum biryani layered with aromatic spices.',
      price: 380.00,
      category: 'Biryani',
      calories: 700,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
      ingredients: {
        create: [
          { ingredient_id: ingredients['Chicken'].id },
          { ingredient_id: ingredients['Rice'].id },
          { ingredient_id: ingredients['Onion'].id },
        ],
      },
    },
  });

  // --- Green Leaf dishes ---
  const d9 = await prisma.dish.create({
    data: {
      restaurant_id: r3.id,
      name: 'Avocado Quinoa Bowl',
      description: 'Protein-packed quinoa with fresh avocado and veggies.',
      price: 450.00,
      category: 'Bowls',
      calories: 350,
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    },
  });

  const d10 = await prisma.dish.create({
    data: {
      restaurant_id: r3.id,
      name: 'Spinach Smoothie',
      description: 'Refreshing green smoothie with spinach, banana and almond milk.',
      price: 180.00,
      category: 'Beverages',
      calories: 150,
      image_url: 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82',
    },
  });

  const dishes = [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10];
  console.log(`✅ ${dishes.length} dishes created.`);

  // ── 6. Offers ─────────────────────────────────────────────
  console.log('Creating offers...');
  await prisma.offer.create({
    data: {
      restaurant_id: r1.id,
      title: 'Grand Opening - 30% OFF',
      discount_percent: 30,
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 30 * 24 * 3600000),
    },
  });
  await prisma.offer.create({
    data: {
      restaurant_id: r2.id,
      title: 'Weekend Special - 15% OFF',
      discount_percent: 15,
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 7 * 24 * 3600000),
    },
  });
  await prisma.offer.create({
    data: {
      restaurant_id: r3.id,
      title: 'Healthy Monday - 20% OFF Bowls',
      discount_percent: 20,
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 14 * 24 * 3600000),
    },
  });
  console.log('✅ 3 offers created.');

  // ── 7. Orders + OrderItems ────────────────────────────────
  console.log('Creating orders...');
  const orderConfigs = [
    // COMPLETED orders (past)
    { userId: user1.id, restId: r1.id, status: 'COMPLETED',  dish: d1, qty: 2, hoursAgo: 48, dining: 'DINE_IN' },
    { userId: user1.id, restId: r1.id, status: 'COMPLETED',  dish: d2, qty: 1, hoursAgo: 24, dining: 'DINE_IN' },
    { userId: user3.id, restId: r2.id, status: 'COMPLETED',  dish: d7, qty: 2, hoursAgo: 72, dining: 'DINE_IN' },
    { userId: user4.id, restId: r2.id, status: 'COMPLETED',  dish: d8, qty: 2, hoursAgo: 10, dining: 'PICKUP' },
    // READY orders (food done, awaiting pickup/serve)
    { userId: user2.id, restId: r1.id, status: 'READY',      dish: d3, qty: 1, hoursAgo: 0, dining: 'PICKUP' },
    { userId: user4.id, restId: r3.id, status: 'READY',      dish: d9, qty: 2, hoursAgo: 0, dining: 'DINE_IN' },
    // PREPARING orders (kitchen is cooking)
    { userId: user1.id, restId: r2.id, status: 'PREPARING',  dish: d6, qty: 1, hoursAgo: 0, dining: 'DINE_IN' },
    { userId: user3.id, restId: r1.id, status: 'PREPARING',  dish: d4, qty: 1, hoursAgo: 0, dining: 'DINE_IN' },
    // CONFIRMED orders (accepted by restaurant)
    { userId: user2.id, restId: r2.id, status: 'CONFIRMED',  dish: d8, qty: 1, hoursAgo: 1, dining: 'PICKUP' },
    // PENDING orders (just placed)
    { userId: user3.id, restId: r3.id, status: 'PENDING',    dish: d10, qty: 1, hoursAgo: 0, dining: 'DINE_IN' },
    { userId: user4.id, restId: r1.id, status: 'PENDING',    dish: d5, qty: 3, hoursAgo: 0, dining: 'DINE_IN' },
    // CANCELLED order
    { userId: user4.id, restId: r1.id, status: 'CANCELLED',  dish: d4, qty: 1, hoursAgo: 5, dining: 'DINE_IN' },
  ];

  for (const cfg of orderConfigs) {
    const order = await prisma.order.create({
      data: {
        user_id: cfg.userId,
        restaurant_id: cfg.restId,
        status: cfg.status as any,
        dining_option: cfg.dining as any,
        created_at: new Date(Date.now() - cfg.hoursAgo * 3600000),
      },
    });
    await prisma.orderItem.create({
      data: {
        order_id: order.id,
        dish_id: cfg.dish.id,
        quantity: cfg.qty,
      },
    });
  }
  console.log(`✅ ${orderConfigs.length} orders created.`);

  // ── 8. Reviews ────────────────────────────────────────────
  console.log('Creating reviews...');
  const reviewConfigs = [
    { userId: user1.id, restId: r1.id, dishId: d1.id, rating: 5, comment: 'Best paneer masala in town!', avatar: 'https://i.pravatar.cc/150?u=dilip' },
    { userId: user2.id, restId: r1.id, dishId: d2.id, rating: 4, comment: 'Butter chicken was superb.', avatar: 'https://i.pravatar.cc/150?u=rahul' },
    { userId: user3.id, restId: r2.id, dishId: null,  rating: 5, comment: 'Authentic Rajasthani flavors!', avatar: 'https://i.pravatar.cc/150?u=priya' },
    { userId: user4.id, restId: r2.id, dishId: d8.id, rating: 4, comment: 'Biryani was fragrant and tasty.', avatar: 'https://i.pravatar.cc/150?u=amit' },
    { userId: user1.id, restId: r3.id, dishId: d9.id, rating: 5, comment: 'Love the quinoa bowl, so fresh!', avatar: 'https://i.pravatar.cc/150?u=dilip2' },
    { userId: user2.id, restId: r3.id, dishId: null,  rating: 3, comment: 'Good healthy options but portions could be bigger.', avatar: 'https://i.pravatar.cc/150?u=rahul2' },
  ];

  for (const rv of reviewConfigs) {
    await prisma.review.create({
      data: {
        user_id: rv.userId,
        restaurant_id: rv.restId,
        dish_id: rv.dishId,
        rating: rv.rating,
        comment: rv.comment,
        avatar: rv.avatar,
      },
    });
  }
  console.log(`✅ ${reviewConfigs.length} reviews created.`);

  // ── 9. User Food Preferences ──────────────────────────────
  console.log('Creating user food preferences...');
  await prisma.userFoodPreference.create({
    data: { user_id: user1.id, ingredient_name: 'Peanuts', is_allergy: true },
  });
  await prisma.userFoodPreference.create({
    data: { user_id: user2.id, ingredient_name: 'Mushroom', is_dislike: true },
  });
  await prisma.userFoodPreference.create({
    data: { user_id: user3.id, ingredient_name: 'Gluten', is_allergy: true },
  });
  console.log('✅ Food preferences created.');

  // ── 10. QR Codes ──────────────────────────────────────────
  console.log('Creating QR codes...');
  for (const r of [r1, r2, r3]) {
    await prisma.restaurantQRCode.upsert({
      where: { restaurant_id: r.id },
      update: {},
      create: {
        restaurant_id: r.id,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${r.id}&size=300x300`,
      },
    });
  }
  console.log('✅ QR codes created.');

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
