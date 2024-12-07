import prisma from '@/lib/prisma';

export async function findOrCreateTestUser(emailAddress: string) {
  const data = {
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: {
      create: [{ emailAddress, isPrimary: true }],
    },
  };

  const existing = await prisma.user.findFirst({
    include: { emailAddresses: true },
    where: {
      emailAddresses: {
        some: {
          emailAddress,
        },
      },
    },
  });

  if (!existing) {
    return prisma.user.create({
      data,
      include: { emailAddresses: true },
    });
  }

  return existing;
}
