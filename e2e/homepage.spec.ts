import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Apadana/);
});

// TODO: We need to handle auth in test
test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByText('Get started').first().click();

  // expect to go to /listing/create
  await expect(page).toHaveURL(/listing\/create/);

  // expect the form with address field and next button to be rendered
  await expect(page.getByRole('form')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
});
