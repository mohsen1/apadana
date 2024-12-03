import { Page, test as baseTest } from '@playwright/test';

interface CurrentListing {
  id: string | undefined;
}

interface TestExtensions {
  /**
   * The page object that is extended with the signIn method
   */
  page: Page;

  /**
   * The current listing that is being tested
   */
  currentListing: CurrentListing;
}

export const test = baseTest.extend<TestExtensions>({
  currentListing: { id: undefined },
});

export const expect = test.expect;
