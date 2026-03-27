import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Missing fields' }, { status: 400 });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { email },
        });

        if (!restaurant) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, restaurant.password_hash);

        if (!isPasswordValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return Response.json({ 
            user: { 
                id: restaurant.id, 
                email: restaurant.email, 
                name: restaurant.name, 
                role: 'RESTAURANT_ADMIN',
                restaurant_id: restaurant.id
            } 
        }, { status: 200 });
    } catch (error: any) {
        console.error('Login error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
