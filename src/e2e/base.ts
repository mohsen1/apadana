import { test as baseTest } from '@playwright/test';

import { TestData } from '@/e2e/test-data';

interface TestExtensions {
  /**
   * The test data object that is extended with the createListing method
   */
  data: TestData;
}

export const test = baseTest.extend<TestExtensions>({
  data: async ({ playwright, baseURL }, use) => {
    if (!baseURL) {
      throw new Error('baseURL is required');
    }

    // Create a dedicated API request context
    const apiContext = await playwright.request.newContext();
    const data = new TestData(apiContext, baseURL);
    await use(data);
    await data.dispose();
  },
});

export const expect = test.expect;
