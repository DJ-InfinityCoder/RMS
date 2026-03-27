import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.params?.id || props.id;
        if (!id) return Response.json({ error: 'Missing ID' }, { status: 400 });

        const reviews = await prisma.review.findMany({
            where: { restaurant_id: id },
            orderBy: { created_at: 'desc' },
            include: { user: { select: { full_name: true } }, dish: { select: { name: true } } }
        });

        return Response.json(reviews);
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
