import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const orders = await prisma.order.findMany({
            where: { restaurant_id: id },
            include: {
                user: {
                    select: {
                        full_name: true,
                        phone: true,
                    },
                },
                order_items: {
                    include: {
                        dish: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        return Response.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return Response.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        return Response.json(updatedOrder);
    } catch (error) {
        console.error('Update order error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
