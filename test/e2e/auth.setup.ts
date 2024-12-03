/* eslint-disable no-console */
import { expect, test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    fetch(`/api/e2e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        command: 'login',
      }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to authenticate the test user: ${res.statusText}`,
        );
      }
      console.log('[auth.setup.ts] Authenticated the test user');
    });
  });

  await page.pause();

  // Expect user name in the header
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Test User' })).toBeVisible();

  console.log('[auth.setup.ts] Authenticated the test user');

  await page.context().storageState({ path: authFile });
});
