import crypto from 'crypto';

import { expect, test } from '@/e2e/base';

test('Password Change Flow', async ({ page, data }) => {
  const USER_EMAIL = 'test-password-change@example.com';
  await test.step('Sends password change email', async () => {
    await data.createUser(USER_EMAIL, crypto.randomBytes(16).toString('hex'));
    await page.goto('/forgot-password');
    await page.getByPlaceholder('Enter your email').fill(USER_EMAIL);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
  await test.step('Open inbox and click on password change link', async () => {
    await page.goto('/local-inbox');
    await page.waitForFunction(() => {
      const emailContent = document.getElementById('local-inbox-email-content');
      if (!emailContent) return false;
      const computedStyle = window.getComputedStyle(emailContent);
      return computedStyle?.opacity === '1';
    });
    // TODO: opening links that open in new tab are not working in CI
    const resetHref = await page.getByRole('link', { name: 'Reset Password' }).getAttribute('href');
    if (!resetHref) {
      throw new Error('Reset password link not found');
    }
    await page.goto(resetHref);
    await expect(page.getByText(/Reset Your Password/i)).toBeVisible();
  });
  // new tab opens with Reset Your Password title
  await test.step('New tab opens with Reset Your Password title', async () => {
    await expect(page.getByText(/Reset Your Password/i)).toBeVisible();
  });
  await test.step('Fill in new password', async () => {
    await page.locator('input[name="password"]').fill('newpassword123');
    await page.locator('input[name="confirmPassword"]').fill('newpassword123');
    await page.getByRole('button', { name: 'Reset Password' }).click();
  });
  await test.step('Navigates to log in page and log in with new password', async () => {
    await expect(page.getByText(/Login to your account/i)).toBeVisible();
    await page.getByLabel(/email/i).fill(USER_EMAIL);
    await page.getByLabel(/password/i).fill('newpassword123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page.getByTestId('nav-user-name')).toBeVisible();
  });
});
