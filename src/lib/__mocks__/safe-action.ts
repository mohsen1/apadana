import { vi } from 'vitest';

import { SafeActionContext } from '@/lib/safe-action';

import { findOrCreateTestUser } from '@/__tests__/setup/fixtures';

export * from '@/lib/safe-action';

let context: SafeActionContext;

export async function setSafeActionContext(
  ctx?: Pick<SafeActionContext, 'user'>,
) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('setSafeActionContext is only available in test');
  }

  if (ctx) {
    context = {
      user: ctx.user,
      userId: ctx.user?.id,
      setSession: vi.fn(),
    };
    return;
  }
  const testUser = await findOrCreateTestUser('test@example.com');
  context = {
    user: testUser,
    userId: testUser.id,
    setSession: vi.fn(),
  };
}

const { baseClient } =
  await vi.importActual<typeof import('@/lib/safe-action')>(
    '@/lib/safe-action',
  );

export { baseClient };

export const actionClient = baseClient.use(async ({ next }) => {
  return next({
    ctx: context,
  });
});
