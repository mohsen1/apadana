/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

import { argon } from '@/lib/auth/argon';
import prisma from '@/lib/prisma/client';

async function main() {
  await createUser('test@example.com', 'password123');

  // Create 5 additional users with realistic names
  for (let i = 1; i < 6; i++) {
    await createUser(`test_${i}@example.com`, 'password123');
  }

  console.log('[prisma/seed.ts] Database seeded successfully');
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

async function createUser(email: string, password: string) {
  const hashedPassword = await argon.hash(password);

  const existingUser = await prisma.user.findFirst({
    where: {
      emailAddresses: {
        some: { emailAddress: email },
      },
    },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      imageUrl: faker.image.avatarGitHub(),
      password: hashedPassword,
      emailAddresses: {
        create: [{ emailAddress: email, isPrimary: true }],
      },
      roles: {
        create: [{ role: email === process.env.ADMIN_EMAIL ? Role.ADMIN : Role.HOST }],
      },
    },
  });
}
