import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.params?.id || props.id;
        console.log('[API] GET Offers - ID:', id);

        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        const offers = await prisma.offer.findMany({
            where: { restaurant_id: id },
            orderBy: { valid_from: 'desc' },
        });
        
        return Response.json(offers);
    } catch (error: any) {
        console.error('[API] Fetch offers error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, props: any) {
    try {
        const id = props.params?.id || props.id;
        const body = await req.json();
        console.log('[API] POST Offer - ID:', id, 'Body:', body);
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { 
            title, 
            discount_percent, 
            valid_from, 
            valid_to, 
            is_active 
        } = body;

        if (!title || discount_percent === undefined) {
            return Response.json({ error: 'Missing required fields (title, discount_percent)' }, { status: 400 });
        }

        const offer = await prisma.offer.create({
            data: {
                restaurant_id: id,
                title,
                discount_percent: parseInt(discount_percent),
                valid_from: valid_from ? new Date(valid_from) : null,
                valid_to: valid_to ? new Date(valid_to) : null,
                is_active: is_active ?? true,
            },
        });

        return Response.json(offer, { status: 201 });
    } catch (error: any) {
        console.error('[API] Create offer error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
