import { test as baseTest } from '@playwright/test';

import { TestData } from '@/e2e/test-data';

interface TestExtensions {
  /**
   * The test data object that is extended with the createListing method
   */
  data: TestData;

  /**
   * Opens the local inbox and waits for the email content to be visible
   */
  openLocalInbox: () => Promise<void>;
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

  openLocalInbox: async ({ page, baseURL }, use) => {
    await use(async () => {
      if (!baseURL || baseURL.includes('apadana.app')) {
        throw new Error(`Can not use Local Inbox in ${baseURL}`);
      }
      await page.goto('/local-inbox');
      await page.waitForFunction(() => {
        const emailContent = document.getElementById('local-inbox-email-content');
        if (!emailContent) return false;
        const computedStyle = window.getComputedStyle(emailContent);
        return computedStyle?.opacity === '1';
      });
    });
  },
});

export const expect = test.expect;
