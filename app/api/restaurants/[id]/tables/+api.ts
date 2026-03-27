import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.params?.id || props.id;
        if (!id) return Response.json({ error: 'Missing ID' }, { status: 400 });

        const slots = await prisma.tableSlot.findMany({
            where: { restaurant_id: id },
            orderBy: { time: 'asc' },
        });

        return Response.json(slots);
    } catch (error: any) {
        console.error('Fetch table slots error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, props: any) {
    try {
        const body = await req.json();
        const { slotId, booked_seats } = body;
        
        if (!slotId) return Response.json({ error: 'Missing Slot ID' }, { status: 400 });

        const updated = await prisma.tableSlot.update({
            where: { id: slotId },
            data: { booked_seats: parseInt(booked_seats) },
        });

        return Response.json(updated);
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
