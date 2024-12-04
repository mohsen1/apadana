/* eslint-disable no-console */
import { expect, test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(async () => {
    const response = await fetch(`/api/e2e`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        command: 'login',
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to authenticate the test user: ${response.status} ${response.statusText} ${text}`,
      );
    }
    console.log('[auth.setup.ts] Authenticated the test user');
  });

  // Proceed with your test
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Hello, .*?/ })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
