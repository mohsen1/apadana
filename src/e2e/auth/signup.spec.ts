import { expect, test } from '../base';

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page.getByText(/First name is required/i)).toBeVisible();
    await expect(page.getByText(/Last name is required/i)).toBeVisible();
    await expect(page.getByText(/Invalid email address/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholder('John', { exact: true }).fill('John');
    await page.getByPlaceholder('Doe', { exact: true }).fill('Doe');
    await page
      .getByPlaceholder('john.doe@example.com', { exact: true })
      .fill('john.doe@example.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password456');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    await expect(page.getByText(/Passwords don't match/i)).toBeVisible();
  });

  test('successfully creates account with valid information', async ({ page, data }) => {
    const email = `e2e_testing_${crypto.randomUUID().slice(0, 8)}@example.com`;
    const password = 'password';
    await page.goto('/signup');
    await page.getByPlaceholder('John', { exact: true }).fill('John');
    await page.getByPlaceholder('Doe', { exact: true }).fill('Doe');
    await page.getByPlaceholder('john.doe@example.com', { exact: true }).fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[name="confirmPassword"]').fill(password);
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();

    // Verify successful signup and redirect
    await expect(page).toHaveURL('/user/profile');
    await expect(page.getByTestId('nav-user-name')).toBeVisible();
    await data.deleteUser(email);
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/signup');
    await page.getByText(/Log in/i).click();
    await expect(page).toHaveURL('/signin');
  });
});
