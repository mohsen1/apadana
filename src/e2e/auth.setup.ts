import { BrowserContext, expect, Page, test as setup } from '@playwright/test';
import path from 'path';

import { prodE2eTestUser } from '@/e2e/fixtures/users';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

async function loginViaCommand(page: Page, context: BrowserContext) {
  const response = await context.request.post('/api/e2e', {
    data: {
      command: 'login',
    },
  });

  const body = (await response.json()) as { email: string };

  // Verify the response is successful
  expect(body.email).toBeTruthy();

  // Verify that the cookies are set
  const cookies = await page.context().cookies();
  expect(cookies.length).toBeGreaterThan(0);
}

async function deleteAllE2eListings(context: BrowserContext) {
  await context.request.post('/api/e2e', {
    data: {
      command: 'delete-all-e2e-listings',
    },
  });
}

setup('authenticate', async ({ page, context, baseURL }) => {
  await deleteAllE2eListings(context);

  if (baseURL?.includes('apadana.app')) {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(prodE2eTestUser.email);
    await page.getByLabel('Password').fill(prodE2eTestUser.password);

    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('/');
  } else {
    await loginViaCommand(page, context);
  }

  await page.goto('/');

  // Verify that the user-specific link is visible
  await expect(page.getByRole('button', { name: /Hello, .*?/ })).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
