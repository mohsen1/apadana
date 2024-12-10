import { PrismaClient, User } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
  // .$extends({
  //   query: {
  //     user: {
  //       async $allOperations({ args, query }) {
  //         const result = await query(args);

  //         // Handle both single user and multiple users results
  //         if (Array.isArray(result)) {
  //           return result.map((user) => ({
  //             ...user,
  //             password: null,
  //           }));
  //         }

  //         if (result) {
  //           return {
  //             ...(result as User),
  //             password: null,
  //           };
  //         }

  //         return result;
  //       },
  //     },
  //   },
  // })
  // .$extends({
  //   model: {
  //     user: {
  //       async getPassword(prisma: PrismaClient, where: { id: string }) {
  //         const user = await prisma.user.findUnique({
  //           where,
  //           select: { password: true },
  //         });
  //         return user?.password ?? null;
  //       },
  //     },
  //   },
  // });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
