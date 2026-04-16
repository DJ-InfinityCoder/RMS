import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old Seed Restaurant...');
  await prisma.restaurant.deleteMany({
    where: { email: 'contact@royalfeast.com' }
  });

  console.log('Seeding comprehensive restaurant data...');

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Royal Feast & Bar',
      email: 'contact@royalfeast.com',
      password_hash: 'hashedpassword123',
      description: 'A luxurious global dining experience offering an eclectic array of premium dishes. From spicy Indian delicacies to authentic Italian pasta, experience world-class cuisines in a royal ambiance.',
      address: '77 Heritage Drive, Platinum City',
      city: 'Metropolis',
      latitude: 12.9715,
      longitude: 77.5945,
      phone: '+1 9876543210',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000',
      cuisine: ['Global', 'Indian', 'Italian', 'American'],
      is_active: true,
      
      // 20 Distinct Dishes
      dishes: {
        create: [
          // STARTERS
          {
            name: 'Tandoori Paneer Tikka',
            description: 'Soft cottage cheese chunks marinated in yogurt and Indian spices, charred in a tandoor.',
            price: 320.00, category: 'Starters',
            image_url: 'https://images.unsplash.com/photo-1599487405270-81f1cdcaa0fc?w=600',
            calories: 350, cooking_method: 'Tandoor Grilled', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Crispy Spring Rolls',
            description: 'Golden fried rolls stuffed with crunchy vegetables and glass noodles.',
            price: 280.00, category: 'Starters',
            image_url: 'https://images.unsplash.com/photo-1605856417539-780c8502cecc?w=600',
            calories: 400, cooking_method: 'Deep Fried', recommended_for: 'Snack', is_available: true
          },
          {
            name: 'Classic Bruschetta',
            description: 'Toasted artisan bread topped with fresh tomatoes, garlic, basil, and olive oil.',
            price: 250.00, category: 'Starters',
            image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
            calories: 220, cooking_method: 'Toasted', recommended_for: 'Lunch', is_available: true
          },
          {
            name: 'Chicken Malai Tikka',
            description: 'Boneless chicken chunks marinated in a rich creamy blend of cashew and cream.',
            price: 380.00, category: 'Starters',
            image_url: 'https://images.unsplash.com/photo-1599487405908-410a8b1a4cb9?w=600',
            calories: 450, cooking_method: 'Grilled', recommended_for: 'Dinner', is_available: true
          },
          // MAIN COURSE
          {
            name: 'Butter Chicken Masala',
            description: 'Tender chicken simmered in a velvety tomato-butter gravy with aromatic spices.',
            price: 490.00, category: 'Main Course',
            image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600',
            calories: 650, cooking_method: 'Slow Cooked', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Paneer Butter Masala',
            description: 'Rich and creamy curry made with paneer, spices, onions, tomatoes, and cashews.',
            price: 420.00, category: 'Main Course',
            image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600',
            calories: 550, cooking_method: 'Simmered', recommended_for: 'Lunch & Dinner', is_available: true
          },
          {
            name: 'Wild Mushroom Risotto',
            description: 'Creamy Arborio rice with porcini mushrooms, truffle essence, and parmesan.',
            price: 550.00, category: 'Main Course',
            image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=600',
            calories: 600, cooking_method: 'Slow Cooked', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Grilled Atlantic Salmon',
            description: 'Fresh salmon fillet grilled with lemon-herb butter, served with asparagus.',
            price: 850.00, category: 'Main Course',
            image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=600',
            calories: 480, cooking_method: 'Grilled', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Hyderabadi Chicken Biryani',
            description: 'Fragrant basmati rice layered with marinated chicken, saffron, and whole spices.',
            price: 450.00, category: 'Main Course',
            image_url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600',
            calories: 700, cooking_method: 'Dum Cooked', recommended_for: 'Lunch', is_available: true
          },
          // PIZZA
          {
            name: 'Margherita Neapolitan Pizza',
            description: 'Wood-fired crust topped with San Marzano tomatoes, fresh mozzarella, and basil.',
            price: 420.00, category: 'Pizza',
            image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
            calories: 850, cooking_method: 'Wood Fired', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Spicy Pepperoni Pizza',
            description: 'Loaded with Italian pepperoni, spicy jalapeños, and extra cheese.',
            price: 550.00, category: 'Pizza',
            image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
            calories: 950, cooking_method: 'Baked', recommended_for: 'Lunch', is_available: true
          },
          // PASTA
          {
            name: 'Penne Arrabbiata',
            description: 'Penne pasta tossed in a fiery, garlic-infused tomato sauce.',
            price: 360.00, category: 'Pasta',
            image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600',
            calories: 500, cooking_method: 'Pan Tossed', recommended_for: 'Lunch', is_available: true
          },
          {
            name: 'Fettuccine Alfredo',
            description: 'Rich, creamy parmesan and butter sauce blanketing fresh fettuccine ribbons.',
            price: 420.00, category: 'Pasta',
            image_url: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600',
            calories: 750, cooking_method: 'Sautéed', recommended_for: 'Dinner', is_available: true
          },
          // BURGERS
          {
            name: 'The Royal Cheeseburger',
            description: 'Double beef patty, aged cheddar, caramelized onions, and house sauce.',
            price: 480.00, category: 'Burger',
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
            calories: 850, cooking_method: 'Griddled', recommended_for: 'Lunch', is_available: true
          },
          {
            name: 'Crispy Chicken Burger',
            description: 'Buttermilk fried chicken breast, spicy mayo, and crunchy lettuce.',
            price: 390.00, category: 'Burger',
            image_url: 'https://images.unsplash.com/photo-1615719417316-d34cb0255a02?w=600',
            calories: 700, cooking_method: 'Fried', recommended_for: 'Snack', is_available: true
          },
          // DESSERTS
          {
            name: 'Molten Chocolate Lava Cake',
            description: 'Warm chocolate cake with a flowing, gooey center. Served with ice cream.',
            price: 250.00, category: 'Dessert',
            image_url: 'https://images.unsplash.com/photo-1624353365286-cb18d6168e3a?w=600',
            calories: 450, cooking_method: 'Baked', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'Classic Italian Tiramisu',
            description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa.',
            price: 320.00, category: 'Dessert',
            image_url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600',
            calories: 380, cooking_method: 'Chilled', recommended_for: 'Dinner', is_available: true
          },
          {
            name: 'New York Cheesecake',
            description: 'Rich, dense, and smooth cheesecake with a buttery graham cracker crust.',
            price: 290.00, category: 'Dessert',
            image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600',
            calories: 520, cooking_method: 'Baked', recommended_for: 'Snack', is_available: true
          },
          // BEVERAGES
          {
            name: 'Mango Lassi',
            description: 'Refreshing traditional yogurt drink blended with sweet Alphonso mangoes.',
            price: 180.00, category: 'Beverage',
            image_url: 'https://images.unsplash.com/photo-1620067645145-21d743aeba4e?w=600',
            calories: 210, cooking_method: 'Blended', recommended_for: 'Lunch', is_available: true
          },
          {
            name: 'Iced Caramel Macchiato',
            description: 'Espresso poured over milk and ice, topped with a caramel drizzle.',
            price: 210.00, category: 'Beverage',
            image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600',
            calories: 180, cooking_method: 'Brewed', recommended_for: 'Breakfast', is_available: true
          }
        ]
      },
      
      // Add Offers
      offers: {
        create: [
          {
            title: 'Royal Weekend 20% OFF',
            discount_percent: 20,
            valid_from: new Date(),
            valid_to: new Date(new Date().setDate(new Date().getDate() + 10)),
            is_active: true
          },
          {
            title: 'Flat ₹200 OFF on Meals',
            discount_percent: null, 
            valid_from: new Date(),
            valid_to: new Date(new Date().setDate(new Date().getDate() + 30)),
            is_active: true
          }
        ]
      },

      // Add Reviews (Critics)
      reviews: {
          create: [
              { rating: 5, comment: 'Absolutely mesmerizing flavors! The Truffle Risotto was beautifully perfectly cooked.', user: { create: { full_name: 'FoodCritic Jon', email: 'jon1@critics.com', password_hash: '123' } } },
              { rating: 4, comment: 'Amazing spread, incredible ambiance. The Biryani is a must-try. Portion could be bigger though.', user: { create: { full_name: 'Sara B', email: 'sara1@critics.com', password_hash: '123' } } },
              { rating: 5, comment: 'The Molten Lava cake changed my life. Excellent service and highly recommended for family dinners.', user: { create: { full_name: 'Dave G.', email: 'dave1@critics.com', password_hash: '123' } } },
          ]
      }
    }
  });

  console.log('Seeded Restaurant:', restaurant.name);
  console.log('Restaurant ID:', restaurant.id);
  console.log('Use this ID to test the restaurant page or API!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
