import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const dishes = await prisma.dish.findMany({
            where: { restaurant_id: id, is_available: true },
        });
        return Response.json(dishes);
    } catch (error) {
        console.error('Fetch dishes error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
