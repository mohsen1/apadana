import crypto from 'crypto';

import { expect, test } from '@/e2e/base';

test('Password Change Flow', async ({ page, data, localInbox }) => {
  const USER_EMAIL = 'test-password-change@example.com';

  await test.step('Create user with random password', async () => {
    await data.createUser(USER_EMAIL, crypto.randomBytes(16).toString('hex'));
  });

  await test.step('Sends password change email', async () => {
    await page.goto(`/forgot-password?email=${USER_EMAIL}`);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await page.waitForSelector('text=check your email');
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  await test.step('Open inbox and click on password change link', async () => {
    const email = await localInbox.openEmail('Reset Your Password', USER_EMAIL);
    expect(email).toContain('Reset Your Password');

    const resetHref = await page.getByRole('link', { name: 'Reset Password' }).getAttribute('href');
    expect(resetHref).toContain('reset-password');
    if (!resetHref) {
      throw new Error('Reset password link not found');
    }
    await page.goto(resetHref);
    await expect(page.getByText(/Reset Your Password/i)).toBeVisible();
  });

  await test.step('Fill in new password and confirms user is logged in', async () => {
    await page.locator('input[name="password"]').fill('newpassword123');
    await page.locator('input[name="confirmPassword"]').fill('newpassword123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    await expect(page.getByTestId('nav-user-name')).toBeVisible();
  });
});
