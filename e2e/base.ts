import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { Page, test as baseTest } from '@playwright/test';

interface ExtendedPage extends Page {
  /**
   * Sign in to the application with the test user
   */
  signIn: () => Promise<void>;
}

interface CurrentListing {
  id: string | undefined;
}

interface TestExtensions {
  /**
   * The page object that is extended with the signIn method
   */
  page: ExtendedPage;

  /**
   * The current listing that is being tested
   */
  currentListing: CurrentListing;
}

export const test = baseTest.extend<TestExtensions>({
  currentListing: { id: undefined },

  page: async (
    { page }: { page: ExtendedPage },
    use: (page: ExtendedPage) => void,
  ) => {
    await setupClerkTestingToken({ page });
    page.signIn = async () => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.fill(
        'input[name="identifier"]',
        'user_+clerk_test@example.com',
      );
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.fill('input[name="password"]', 'test1234');
      await page.getByRole('button', { name: 'Continue' }).click();
    };
    await use(page);
  },
});

export const expect = test.expect;
