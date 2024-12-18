import { prodE2eTestHostUser } from '@/e2e/fixtures/data';
import { storageState } from '@/e2e/playwright.config';

import { expect, test as setup } from './base';

setup('authenticate', async ({ page, data }) => {
  await data.deleteAllE2eListings();
  await data.createUser(
    prodE2eTestHostUser.email,
    prodE2eTestHostUser.password,
  );
  await data.login(prodE2eTestHostUser.email, page);
  await page.goto('/');

  // Verify that the user-specific link is visible
  await expect(page.getByTestId('nav-user-name')).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: storageState });
});
