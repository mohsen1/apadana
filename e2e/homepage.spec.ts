import { expect } from '@playwright/test';

import { test } from './base';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Apadana/);
});

test('get early access button', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: 'Get Early Access' }).first(),
  ).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Email' })
    .first()
    .fill('test@example.com');
  await page.getByRole('button', { name: 'Get Early Access' }).first().click();
  await page.waitForFunction(() =>
    document.querySelector('[data-testid="toast"]'),
  );

  await page.pause();
  await expect(page.getByText("You're on the list!")).toBeVisible();
});
