import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const ingredients = await prisma.ingredient.findMany({
            orderBy: { name: 'asc' },
        });
        return Response.json(ingredients);
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
