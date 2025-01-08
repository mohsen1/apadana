import { Page, test as baseTest } from '@playwright/test';

import { TestData } from '@/e2e/test-data';

class LocalInbox {
  constructor(private page: Page) {}

  /**
   * Opens the local inbox and optionally navigates to a specific inbox
   * @param to - The inbox to navigate to
   */
  async open(to?: string) {
    if (this.page.url().includes('apadana.app')) {
      throw new Error('Can not use Local Inbox in production');
    }
    await this.page.goto('/local-inbox' + (to ? `?to=${to}` : ''));
  }

  /**
   * Waits for the email content to be visible
   */
  async waitForEmailContent() {
    await this.page.waitForFunction(() => {
      const emailContent = document.getElementById('local-inbox-email-content');
      if (!emailContent) return false;
      const computedStyle = window.getComputedStyle(emailContent);
      return computedStyle?.opacity === '1';
    });
  }

  /**
   * Clicks the email item with the given title
   * @param title - The title of the email item to click
   * @param to - Recipient email address
   */
  async openEmail(title: string, to?: string) {
    if (this.page.url().includes('apadana.app')) {
      throw new Error('Can not use Local Inbox in production');
    }
    // if not in /local-inbox, navigate to it
    if (!this.page.url().includes('/local-inbox')) {
      await this.open(to);
    }
    const emailItemLocator = `[data-testid="email-list-item"][title="${title}"]`;
    await expect(this.page.locator(emailItemLocator)).toBeVisible();
    await this.page.click(emailItemLocator);
    await this.waitForEmailContent();
  }
}

interface TestExtensions {
  /**
   * The test data object that is extended with the createListing method
   */
  data: TestData;

  /**
   * Opens the local inbox and waits for the email content to be visible
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
