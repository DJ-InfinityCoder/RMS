import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const vendor = await prisma.vendor.create({
    data: {
      ...body,
      critic_score: parseFloat(body.critic_score),
      food: body.food,
      tags: body.tags
    }
  });

  return Response.json(vendor);
}