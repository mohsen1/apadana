import { expect, test } from '../base';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/signin');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByText(/Please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('successfully logs in with valid credentials', async ({ page, data }) => {
    const USER_EMAIL = `test-${Math.random().toString(36).substring(2, 15)}@example.com`;
    const USER_PASSWORD = 'Password123!';
    await data.createUser(USER_EMAIL, USER_PASSWORD);
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(USER_EMAIL);
    await page.getByPlaceholder('Enter your password').fill(USER_PASSWORD);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();

    // Verify successful login
    await expect(page.getByTestId('nav-user-name')).toBeVisible();
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForSelector('text=invalid email or password');
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword2');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.getByText(/forgot your password/i).click();
    await expect(page).toHaveURL('/forgot-password?email=invalid@example.com');
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/signin');
    await page.getByText(/sign up/i).click();
    await expect(page).toHaveURL('/signup');
  });
});
