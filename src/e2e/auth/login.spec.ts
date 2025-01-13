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
    const email = `test-${Math.random().toString(36).substring(2, 15)}@example.com`;
    const password = 'Password123!';
    await data.createUser(email, password);
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
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

  test('redirects to original location after login', async ({ page, data }) => {
    const email = `test-${Math.random().toString(36).substring(2, 15)}@example.com`;
    const password = 'Password123!';
    await data.createUser(email, password);

    // Test with simple path
    await page.goto('/signin?redirect=/dashboard');
    await page.getByLabel(/email/i).fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    // Wait for navigation to complete
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Logout and wait for it to complete
    await data.logOut(page);
    await page.waitForURL('/');

    // Test with path and query parameters
    const complexPath = '/dashboard/settings?tab=security&view=permissions';
    await page.goto(`/signin?redirect=${encodeURIComponent(complexPath)}`);
    await page.getByLabel(/email/i).fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    // Wait for navigation to complete
    await page.waitForURL(complexPath);
    await expect(page).toHaveURL(complexPath);
  });

  test('redirects to home if already logged in', async ({ page, data }) => {
    const email = `test-${Math.random().toString(36).substring(2, 15)}@example.com`;
    const password = 'Password123!';
    await data.createUser(email, password);

    // Login first and wait for it to complete
    await page.goto('/signin');
    await page.getByLabel(/email/i).fill(email);
    await page.getByPlaceholder('Enter your password').fill(password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await page.waitForURL('/');

    // Verify user is logged in
    await expect(page.getByTestId('nav-user-name')).toBeVisible();

    // Try accessing login page with redirect
    await page.goto('/signin?redirect=/dashboard');
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Try accessing login page without redirect
    await page.goto('/signin');
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });
});
