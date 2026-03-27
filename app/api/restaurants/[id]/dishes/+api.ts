import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const dishes = await prisma.dish.findMany({
            where: { restaurant_id: id },
        });
        return Response.json(dishes);
    } catch (error) {
        console.error('Fetch dishes error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const { 
            name, 
            description, 
            cooking_method, 
            calories, 
            price, 
            recommended_for, 
            image_url, 
            is_available 
        } = body;

        if (!name || price === undefined) {
            return Response.json({ error: 'Missing required fields (name, price)' }, { status: 400 });
        }

        const dish = await prisma.dish.create({
            data: {
                restaurant_id: id,
                name,
                description,
                cooking_method,
                calories: calories ? parseInt(calories) : null,
                price: parseFloat(price),
                recommended_for,
                image_url,
                is_available: is_available ?? true,
            },
        });

        return Response.json(dish, { status: 201 });
    } catch (error: any) {
        console.error('Create dish error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
