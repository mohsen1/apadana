import { Page } from '@playwright/test';
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
  let resetPage: Page;
  await test.step('Open inbox and click on password change link', async () => {
    await page.goto('/local-inbox');
    await page.waitForTimeout(1000);
    const newPagePromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Reset Password' }).click();
    resetPage = await newPagePromise;
    await expect(resetPage.getByText(/Reset Your Password/i)).toBeVisible();
  });
  // new tab opens with Reset Your Password title
  await test.step('New tab opens with Reset Your Password title', async () => {
    await expect(resetPage.getByText(/Reset Your Password/i)).toBeVisible();
  });
  await test.step('Fill in new password', async () => {
    const resetPage = page.context().pages()[1]; // Get the reset password page
    await resetPage.locator('input[name="password"]').fill('newpassword123');
    await resetPage.locator('input[name="confirmPassword"]').fill('newpassword123');
    await resetPage.getByRole('button', { name: 'Reset Password' }).click();
  });
  await test.step('Navigates to log in page and log in with new password', async () => {
    await expect(resetPage.getByText(/Login to your account/i)).toBeVisible();
    await resetPage.getByLabel(/email/i).fill(USER_EMAIL);
    await resetPage.getByLabel(/password/i).fill('newpassword123');
    await resetPage.getByRole('button', { name: /log in/i }).click();
    await expect(resetPage.getByTestId('nav-user-name')).toBeVisible();
  });
});
