import { Page, test as baseTest, TestInfo } from '@playwright/test';

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
    testInfo: TestInfo,
  ) => {
    page.signIn = async () => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.fill('input[name="identifier"]', 'test_user@example.com');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.fill('input[name="password"]', 'test1234');
      await page.getByRole('button', { name: 'Continue' }).click();
    };
    await use(page);
    // Capture screenshot on failure
    if (testInfo.status !== 'passed') {
      await page.screenshot({
        path: `${testInfo.outputDir}/test-failed-${testInfo.title.replace(/\s+/g, '-')}.png`,
      });
    }
  },
});

export const expect = test.expect;
