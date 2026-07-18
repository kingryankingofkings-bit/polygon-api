import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const prisma = new PrismaClient();

async function main() {
  const email = 'kingryankingofkings@gmail.com';
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });
  console.log('Updated user role to admin:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
