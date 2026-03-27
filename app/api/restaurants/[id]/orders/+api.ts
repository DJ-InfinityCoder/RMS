import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

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

        const serializedOrders = orders.map((order: any) => ({
            ...order,
            created_at: order.created_at.toISOString(),
            order_items: order.order_items.map((item: any) => ({
                ...item,
                dish: item.dish ? {
                    ...item.dish,
                    price: item.dish.price ? Number(item.dish.price) : 0,
                } : null
            }))
        }));

        return Response.json(serializedOrders);
    } catch (error: any) {
        console.error('Fetch orders error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
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
    } catch (error: any) {
        console.error('Update order error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
