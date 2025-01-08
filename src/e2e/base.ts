import { test as baseTest } from '@playwright/test';

import { TestData } from '@/e2e/test-data';
import { LocalInbox } from '@/e2e/utils/local-inbox';

interface TestExtensions {
  /**
   * The test data object that is extended with the createListing method
   */
  data: TestData;

  /**
   * The local inbox object. Offers methods to open the local inbox and interact with emails
   */
  localInbox: LocalInbox;
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

  localInbox: async ({ page }, use) => {
    const localInbox = new LocalInbox(page);
    await use(localInbox);
  },
});

export const expect = test.expect;
