import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;
        
        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        const qrCode = await prisma.restaurantQRCode.findUnique({
            where: { restaurant_id: id },
        });

        if (!qrCode) {
            return Response.json({ error: 'QR Code not found' }, { status: 404 });
        }

        return Response.json({
            ...qrCode,
            created_at: qrCode.created_at.toISOString(),
        });
    } catch (error: any) {
        console.error('Fetch QR Code error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request, props: any) {
    try {
        const id = props.id || props.params?.id;

        if (!id) {
            return Response.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Generate a unique URL for the restaurant's menu
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${id}&size=300x300`;

        const qrCode = await prisma.restaurantQRCode.upsert({
            where: { restaurant_id: id },
            update: { qr_code_url: qrCodeUrl },
            create: {
                restaurant_id: id,
                qr_code_url: qrCodeUrl,
            },
        });

        return Response.json({
            ...qrCode,
            created_at: qrCode.created_at.toISOString(),
        });
    } catch (error: any) {
        console.error('Generate QR Code error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
