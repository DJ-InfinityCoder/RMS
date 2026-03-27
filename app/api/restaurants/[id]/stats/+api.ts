import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        const totalOrders = await prisma.order.count({
            where: { restaurant_id: id },
        });

        const pendingOrders = await prisma.order.count({
            where: { restaurant_id: id, status: 'PENDING' },
        });

        const activeOrders = await prisma.order.count({
            where: {
                restaurant_id: id,
                status: { in: ['CONFIRMED', 'PREPARING', 'READY'] as any },
            },
        });

        const completedOrders = await prisma.order.count({
            where: { restaurant_id: id, status: 'COMPLETED' },
        });

        const ordersWithItems = await prisma.order.findMany({
            where: { restaurant_id: id, status: 'COMPLETED' },
            include: {
                order_items: {
                    include: {
                        dish: true,
                    },
                },
            },
        });

        let revenue = 0;
        ordersWithItems.forEach((order: any) => {
            order.order_items.forEach((item: any) => {
                if (item.dish.price) {
                    revenue += Number(item.dish.price) * (item.quantity || 1);
                }
            });
        });

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            select: { name: true }
        });

        return Response.json({
            restaurantName: restaurant?.name || 'My Restaurant',
            stats: [
                { label: 'Total Orders', value: totalOrders.toString(), icon: 'cart-outline', color: '#4CAF50' },
                { label: 'Pending', value: pendingOrders.toString(), icon: 'time-outline', color: '#FF9800' },
                { label: 'Active', value: activeOrders.toString(), icon: 'flame-outline', color: '#9C27B0' },
                { label: 'Revenue', value: `₹${revenue.toFixed(0)}`, icon: 'cash-outline', color: '#2196F3' },
            ]
        });
    } catch (error: any) {
        console.error('Fetch stats error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
