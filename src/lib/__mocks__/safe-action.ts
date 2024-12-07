import { vi } from 'vitest';

import { baseClient } from '@/lib/safe-action';

import { findOrCreateTestUser } from '@/__tests__/setup/fixtures';

export * from '@/lib/safe-action';

export const actionClient = baseClient.use(async ({ next }) => {
  const testUser = await findOrCreateTestUser('test@example.com');

  return next({
    ctx: {
      user: testUser,
      userId: testUser.id,
      setSession: vi.fn(),
    },
  });
});
