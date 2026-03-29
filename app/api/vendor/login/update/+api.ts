import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { oldEmail, newEmail, newMobile } = await req.json();

    if (!oldEmail) return Response.json({ error: 'Current email required' }, { status: 400 });

    const updated = await prisma.vendorAdmin.update({
      where: { email: oldEmail },
      data: {
        email: newEmail || undefined,
        mobile: newMobile || undefined,
      }
    });

    return Response.json(updated);
  } catch (error) {
    console.error('Update login details error:', error);
    return Response.json({ error: 'Failed to update login details' }, { status: 500 });
  }
}
