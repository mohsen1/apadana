import { prodE2eTestHostUser } from '@/e2e/fixtures/data';
import { storageState } from '@/e2e/playwright.config';

import { expect, test as setup } from './base';

setup.beforeAll(async ({ data }) => {
  await data.deleteAllE2eEmails();
  await data.deleteAllE2eListings();
  await data.deleteUser(prodE2eTestHostUser.email);
  await data.createUser(prodE2eTestHostUser.email, prodE2eTestHostUser.password);
});

setup('authenticate', async ({ page, data, baseURL }) => {
  if (baseURL?.includes('https://apadana.app')) {
    // Login using UI in prod
    await page.goto('/signin');
    await page.locator('input[name="email"]').fill(prodE2eTestHostUser.email);
    await page.locator('input[name="password"]').fill(prodE2eTestHostUser.password);
    await page.locator('button[type="submit"]').click();
  } else {
    await data.login(prodE2eTestHostUser.email, page);
  }

  await page.goto('/user/profile');

  // Verify that the user-specific link is visible
  await expect(page.getByTestId('nav-user-name')).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: storageState });
});
