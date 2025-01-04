import { expect, test } from '@/e2e/base';

test.describe('Password Change Flow', () => {
  test('forgot password link shows up after failed login attempts', async ({ page, data }) => {
    // Create a test user with email and password
    const testEmail = 'test@e2e-testing.apadana.app';
    const testPassword = 'OldPassword123!';
    await data.createUser(testEmail, testPassword);

    // Go to login page
    await page.goto('/signin');

    // First failed attempt
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill('WrongPassword1!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Second failed attempt
    await page.getByLabel(/password/i).fill('WrongPassword2!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify forgot password link appears
    const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
    await expect(forgotPasswordLink).toBeVisible();

    // Click forgot password and verify flow
    await forgotPasswordLink.click();
    await expect(page).toHaveURL('/forgot-password');

    // Fill in email
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Verify success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
    await expect(page.getByText(new RegExp(`If an account exists for ${testEmail}`))).toBeVisible();
    await expect(page.getByRole('link', { name: /return to sign in/i })).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');

    // Try with invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Verify validation error
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });
});
