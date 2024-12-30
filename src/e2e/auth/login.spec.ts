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
    const email = `e2e_testing_${crypto.randomUUID().slice(0, 8)}@example.com`;
    const password = 'password';
    await data.createUser(email, password);
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
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
