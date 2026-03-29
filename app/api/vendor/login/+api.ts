import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();

  const vendor = await prisma.vendorAdmin.findUnique({
    where: { email }
  });

  return Response.json(vendor);
}
