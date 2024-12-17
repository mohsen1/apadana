import { prodE2eTestHostUser } from '@/e2e/fixtures/data';
import { storageState } from '@/e2e/playwright.config';

import { test as setup, expect } from './base';

setup('authenticate', async ({ page, baseURL, data }) => {
  await data.deleteAllE2eListings();

  if (baseURL?.includes('apadana.app') || baseURL?.includes('.vercel.app')) {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(prodE2eTestHostUser.email);
    await page.getByLabel('Password').fill(prodE2eTestHostUser.password);

    await page.getByRole('button', { name: 'Log in', exact: true }).click();
  } else {
    await data.createUser(
      prodE2eTestHostUser.email,
      prodE2eTestHostUser.password,
    );
    await data.login(prodE2eTestHostUser.email, page);
    await page.goto('/');
  }

  // Verify that the user-specific link is visible
  await expect(page.getByRole('button', { name: /Hello, .*?/ })).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: storageState });
});
