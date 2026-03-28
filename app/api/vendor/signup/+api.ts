import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, email, mobile } = await req.json();

  const vendor = await prisma.vendorAdmin.create({
    data: { name, email, mobile }
  });

  return Response.json(vendor);
}