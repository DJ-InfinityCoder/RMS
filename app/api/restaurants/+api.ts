import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: { is_active: true },
            include: {
                _count: {
                    select: { dishes: true },
                },
            },
        });
        return Response.json(restaurants);
    } catch (error) {
        console.error('Fetch restaurants error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
