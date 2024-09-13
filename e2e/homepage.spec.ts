import { expect } from '@playwright/test';

import { test } from './base';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Apadana/);
});

test('get started link', async ({ page }) => {
  await page.signIn();
  await page.goto('/');
  // Click the get started link.
  await page.getByText('Get started').first().click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
});
