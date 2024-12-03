/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

import { argon } from '@/lib/auth/argon';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await argon.hash('password123');

  await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword,
      emailAddresses: {
        create: [
          {
            emailAddress: 'test@example.com',
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log('[prisma/seed.ts]Database seeded successfully');
}

main()
  .catch(async (e) => {
    console.error('[prisma/seed.ts] Error seeding database', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
