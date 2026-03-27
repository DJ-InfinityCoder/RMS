import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding vendors...');

    const vendors = [
        {
            name: 'Spice Route Express',
            description: 'Fast and authentic Indian street food across the city.',
            critic_score: 4.5,
            food: ['Samosa', 'Vada Pav', 'Masala Chai', 'Indian'],
            image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
            tags: ['indian', 'street food', 'fast food'],
            location: 'Delhi, India',
            price_range: '$$',
        },
        {
            name: 'Green Leaf Bistro',
            description: 'Healthy organic salads and vegan delights.',
            critic_score: 4.8,
            food: ['Quinoa Bowl', 'Avocado Toast', 'Tofu Wrap', 'Salads'],
            image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
            tags: ['vegan', 'healthy', 'organic'],
            location: 'Mumbai, India',
            price_range: '$$$',
        },
        {
            name: 'Burger Pit Stop',
            description: 'Massive burgers and crispy loaded fries.',
            critic_score: 4.2,
            food: ['Monster Burger', 'Cheese Fries', 'Milkshake', 'Burgers'],
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
            tags: ['fast food', 'budget', 'american'],
            location: 'Bangalore, India',
            price_range: '$',
        },
        {
            name: 'Pasta e Basta',
            description: 'Homemade Italian pasta just like Nonna makes.',
            critic_score: 4.6,
            food: ['Lasagna', 'Fettuccine Alfredo', 'Penne Arrabbiata', 'Pasta'],
            image_url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80',
            tags: ['italian', 'fine dining', 'pasta'],
            location: 'Pune, India',
            price_range: '$$$',
        },
        {
            name: 'Sushi Zen Garden',
            description: 'Premium sushi and sashimi experience.',
            critic_score: 4.9,
            food: ['California Roll', 'Salmon Sashimi', 'Miso Soup', 'Japanese'],
            image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
            tags: ['japanese', 'premium', 'seafood'],
            location: 'Hyderabad, India',
            price_range: '$$$$',
        },
        {
            name: 'Taco Haven',
            description: 'Cheap and cheerful tacos with a modern twist.',
            critic_score: 4.0,
            food: ['Fish Taco', 'Beef Burrito', 'Nachos', 'Mexican'],
            image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
            tags: ['mexican', 'budget', 'spicy'],
            location: 'Chennai, India',
            price_range: '$',
        },
    ];

    for (const vData of vendors) {
        const existing = await prisma.vendor.findFirst({ where: { name: vData.name } });
        if (!existing) {
            await prisma.vendor.create({ data: vData });
            console.log(`Created vendor: ${vData.name}`);
        } else {
            console.log(`Vendor already exists: ${vData.name}`);
        }
    }

    console.log(`Seeding of ${vendors.length} vendors complete.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
