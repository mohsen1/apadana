import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

import { VercelLogsReporterOptions } from './e2e/reporters/vercel-logs-reporter';

dotenv.config();

/**
 * Playwright by default will launch the server in production mode.
 * When writing and debugging e2e tests locally, it's useful to have the dev server or any other server
 * that is already running instead.
 * This variable is used to determine whether to run the dev server or not.
 *
 * This variable is used in the e2e:debug package.json script
 */
const startServer = process.env.PLAYWRIGHT_START_SERVER === 'true';
const port = process.env.PORT || '3030';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { open: 'never', outputFolder: '.next/__e2e__reports__' }],
    [
      require.resolve('./e2e/reporters/vercel-logs-reporter'),
      {
        config: {
          reporterOptions: {
            outputDir: '.next/__e2e__reports__',
            maxLogs: 10_000,
          },
        },
      } as VercelLogsReporterOptions,
    ],
  ],

  globalSetup: require.resolve('./e2e/global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.BASE_URL || `http://127.0.0.1:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: {
      mode: 'retain-on-failure',
      snapshots: true,
      screenshots: true,
      sources: true,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // TODO: Enable e2e testing for firefox and webkit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local server in production mode before starting the tests if not debugging the tests */
  webServer: startServer
    ? {
        command: 'if [ ! -d ".next" ]; then pnpm run build; fi; pnpm run start',
        env: {
          PORT: port,
        },
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
