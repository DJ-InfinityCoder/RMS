import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        const dishes = await prisma.dish.findMany({
            where: { restaurant_id: id },
        });

        const serializedDishes = dishes.map((dish: any) => ({
            ...dish,
            price: dish.price ? Number(dish.price) : 0,
        }));

        return Response.json(serializedDishes);
    } catch (error: any) {
        console.error('Fetch dishes error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
        const body = await req.json();
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

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

        const serializedDish = {
            ...dish,
            price: dish.price ? Number(dish.price) : 0,
        };

        return Response.json(serializedDish, { status: 201 });
    } catch (error: any) {
        console.error('Create dish error:', error);
        return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
