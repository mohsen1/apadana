import { expect, test } from '../base';

test.describe('Email Verification Process', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test.verification-${crypto.randomUUID().slice(0, 6)}@apadana.app`,
    password: 'password123',
  };

  test.beforeEach(async ({ page, data }) => {
    await page.context().clearCookies();
    await data.deleteUser(testUser.email);
  });

  test('resend verification email appears in inbox', async ({ page, data, baseURL }) => {
    expect(baseURL).toBeDefined();
    // Skip this test when testing against production since we do not have local inbox in prod
    test.skip(!!baseURL?.toLowerCase().includes('apadana.app'), 'Skipping test for production');

    // 1. Create new account
    await data.createUser(testUser.email, testUser.password);
    await data.login(testUser.email, page);

    // 2. Click resend
    await page.goto('/');
    await page.getByRole('button', { name: 'Resend verification email' }).click();
    await expect(page.getByTestId('toast').getByText('Verification email sent')).toBeVisible();

    // 3. Check local inbox for new verification email
    await page.goto('/local-inbox');

    // expect Verify your email address to be visible
    const firstEmailRow = page.getByTestId('email-list-item').first();
    await expect(firstEmailRow).toBeVisible();
    await expect(firstEmailRow.getByText('Verify your email address')).toBeVisible();

    // ensure it is for this user
    await expect(firstEmailRow.getByText(testUser.email)).toBeVisible();
  });

  test.afterEach(async ({ data }) => {
    await data.deleteUser(testUser.email);
  });
});
