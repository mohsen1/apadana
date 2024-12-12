import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  // Middleware
  prisma.$use(async (params, next) => {
    const result = await next(params);

    // Skip password stripping if using a special action name:
    if (params.model === 'User' && result) {
      if (Array.isArray(result)) {
        result.forEach((user) => {
          if (user.password) delete user.password;
        });
      } else if (result.password) {
        delete result.password;
      }
    }

    return result;
  });

  return prisma;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Helper method to get a user's password. Note that user.password is not
 * selectable by default, so we need to use a special action name to get it.
 * @param userId - The ID of the user
 * @returns The password of the user or null if the user does not exist
 */
export async function getUserPassword(
  userId: string | undefined | null,
): Promise<string | null> {
  if (!userId) return null;

  const user = await prisma.$queryRaw<{ password: string }[]>`
    SELECT password FROM "User" WHERE id = ${userId}
  `;

  return user?.[0]?.password ?? null;
}
