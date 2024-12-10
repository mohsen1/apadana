import { expect, test as setup } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const prodTestUser = {
  email: 'me+apadana_prod_test@azimi.me',
  password: 'nslr83ub9v8',
};

setup('authenticate', async ({ page, context, baseURL }) => {
  if (baseURL?.includes('apadana.app')) {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(prodTestUser.email);
    await page.getByLabel('Password').fill(prodTestUser.password);

    await page.getByRole('button', { name: 'Log in' }).click();
    return;
  }

  const response = await context.request.post('/api/e2e', {
    data: {
      command: 'login',
    },
  });

  const body = await response.json();

  // Verify the response is successful
  expect(body.email).toBeTruthy();

  // Verify that the cookies are set
  const cookies = await page.context().cookies();
  expect(cookies.length).toBeGreaterThan(0);

  await page.goto('/');

  // Verify that the user-specific link is visible
  await expect(page.getByRole('link', { name: /Hello, .*?/ })).toBeVisible();

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});
