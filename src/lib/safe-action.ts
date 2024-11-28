import { auth } from '@clerk/nextjs/server';
import { createSafeActionClient } from 'next-safe-action';

const baseClient = createSafeActionClient({});

export const actionClient = baseClient.use(async ({ next }) => {
  const { userId } = await auth();
  return next({
    ctx: {
      userId,
    },
  });
});
