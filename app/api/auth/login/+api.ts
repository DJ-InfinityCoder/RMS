import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Missing fields' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return Response.json({ user: { id: user.id, email: user.email, name: user.full_name, role: user.role } }, { status: 200 });
    } catch (error: any) {
        console.error('Login error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
