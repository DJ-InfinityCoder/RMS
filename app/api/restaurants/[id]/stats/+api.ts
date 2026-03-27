import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const totalOrders = await prisma.order.count({
            where: { restaurant_id: id },
        });

        const pendingOrders = await prisma.order.count({
            where: { restaurant_id: id, status: 'PENDING' },
        });

        const completedOrders = await prisma.order.count({
            where: { restaurant_id: id, status: 'COMPLETED' },
        });

        // Calculate revenue from completed orders
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
        ordersWithItems.forEach(order => {
            order.order_items.forEach(item => {
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
                { label: 'Completed', value: completedOrders.toString(), icon: 'checkmark-circle-outline', color: '#2196F3' },
                { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, icon: 'cash-outline', color: '#9C27B0' },
            ]
        });
    } catch (error) {
        console.error('Fetch stats error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
