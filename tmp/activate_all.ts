import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.restaurant.updateMany({
    data: { is_active: true }
  });
  console.log(`Activated ${updated.count} restaurants.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
