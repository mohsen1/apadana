/* eslint-disable no-console */
import { expect, test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const port = process.env.PORT ?? 3000;

  try {
    await fetch(`http://localhost:${port}/api/e2e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'login',
      }),
    });
  } catch (e) {
    console.error('[auth.setup.ts] Failed to authenticate the test user', e);
  }

  // Expect user name in the header
  await page.waitForURL('/');
  await expect(page.getByRole('button', { name: 'Test User' })).toBeVisible();

  console.log('[auth.setup.ts] Authenticated the test user');

  await page.context().storageState({ path: authFile });
});
