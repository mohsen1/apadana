import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      user: {
        email: {
          needs: {
            // TODO: Remove @ts-expect-error once Prisma is updated the "needs" type in
            //   DynamicQueryExtensionCbArgsArgs is updated.
            // @ts-expect-error - Prisma types are wrong.
            // See: https://github.com/prisma/prisma/issues/20091#issuecomment-2251448170
            emailAddresses: true,
          },
          compute: (user) => {
            return user.emailAddresses.find((email) => email.isPrimary)
              ?.emailAddress;
          },
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
