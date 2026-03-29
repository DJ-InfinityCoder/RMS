import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name');

  if (!name) return Response.json({ error: 'Name required' }, { status: 400 });

  const vendor = await prisma.vendor.findFirst({
    where: { name }
  });

  return Response.json(vendor);
}

export async function POST(req: Request) {

  try {
    const body = await req.json();
    const { id, name, email, ...rest } = body;

    // Use name as identifier if ID is missing (for demo purposes)
    const identifier = id ? { id } : { name };

    const data = {
      ...rest,
      name,
      critic_score: rest.critic_score ? parseFloat(rest.critic_score) : 0,
      food: rest.food || [],
      tags: rest.tags || []
    };

    let vendor;
    if (id) {
        vendor = await prisma.vendor.update({
            where: { id },
            data: data
        });
    } else {
        const existing = await prisma.vendor.findFirst({
            where: { name }
        });

        if (existing) {
            vendor = await prisma.vendor.update({
                where: { id: existing.id },
                data: data
            });
        } else {
            vendor = await prisma.vendor.create({
                data: data
            });
        }
    }


    return Response.json(vendor);
  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}