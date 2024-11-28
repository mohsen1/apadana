import { expect } from '@playwright/test';

import { test } from './base';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Apadana/);
});

test('get early access button', async ({ page }) => {
  await page.signIn();
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Get Early Access' }).first(),
  ).toBeVisible();
});
