import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const authors = await prisma.author.findMany({
      where: {
        penName: { not: null },
      },
      orderBy: { penName: 'asc' },
    });
    console.log("Authors:", authors);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
