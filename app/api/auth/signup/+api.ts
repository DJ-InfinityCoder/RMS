import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            name, // Restaurant Name
            email, 
            password, 
            restaurantAddress, 
            city, 
            restaurantPhone 
        } = body;

        if (!name || !email || !password) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingRestaurant = await prisma.restaurant.findFirst({
            where: { email },
        });

        if (existingRestaurant) {
            return Response.json({ error: 'Restaurant with this email already exists' }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                email,
                password_hash,
                address: restaurantAddress || 'N/A',
                city: city || 'N/A',
                phone: restaurantPhone || '',
            },
        });

        return Response.json({ 
            user: { 
                id: restaurant.id, 
                name: restaurant.name,
                email: restaurant.email,
                role: 'RESTAURANT_ADMIN',
                restaurant_id: restaurant.id
            } 
        }, { status: 201 });
    } catch (error: any) {
        console.error('Signup error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
