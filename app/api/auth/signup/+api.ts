import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email, phone, password } = await req.json();

        if (!name || !email || !password || !phone) {
            return Response.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return Response.json({ error: 'User already exists' }, { status: 400 });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                full_name: name,
                email,
                phone,
                password_hash,
                role: 'CUSTOMER',
            },
        });

        return Response.json({ user: { id: user.id, email: user.email, name: user.full_name } }, { status: 201 });
    } catch (error: any) {
        console.error('Signup error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
