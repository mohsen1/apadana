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

  test('resend verification email appears in inbox', async ({ page, data, localInbox }) => {
    // 1. Create new account
    await data.createUser(testUser.email, testUser.password);
    await data.login(testUser.email, page);

    // 2. Click resend
    await page.goto('/');
    await page.getByRole('button', { name: 'Resend verification email' }).click();
    await expect(page.getByTestId('toast').getByText('Verification email sent')).toBeVisible();

    const allEmails = await data.getEmails();
    expect(allEmails.emails.length).toBeGreaterThan(0);

    // 3. Check local inbox for new verification email
    const email = await localInbox.openEmail('Verify your email address', testUser.email);

    expect(email).toContain('Verify your email address');
  });

  test.afterEach(async ({ data }) => {
    await data.deleteUser(testUser.email);
  });
});
