import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

import logger from '@/utils/logger';

dotenv.config();

const isTestingDev = process.env.PLAYWRIGHT_IS_TESTING_DEV === 'true';

export const storageState = path.join(
  process.cwd(),
  '.cache/__e2e__auth/state.json',
);

/**
 * Playwright by default will launch the server in production mode.
 * When writing and debugging e2e tests locally, it's useful to have the dev server or any other server
 * that is already running instead.
 * This variable is used to determine whether to run the dev server or not.
 *
 * This variable is used in the e2e:debug package.json script
 */

const port = process.env.PORT || '3030';
const localUrl = `http://localhost:${port}`;
const baseURL = process.env.BASE_URL || localUrl;

const htmlReportFolder = path.join(
  process.cwd(),
  'test-results',
  'html-report',
);
if (!fs.existsSync(htmlReportFolder)) {
  fs.mkdirSync(htmlReportFolder, { recursive: true });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: path.join(process.cwd(), 'src/e2e'),
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
    [
      'html',
      {
        open: process.env.CI ? 'never' : 'on-failure',
        outputFolder: htmlReportFolder,
      },
    ],
  ],

  globalSetup: path.join(process.cwd(), 'src/e2e/global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    get extraHTTPHeaders(): Record<string, string> {
      // Learn more about this here:
      // https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET !== undefined) {
        logger.info('Using Vercel automation bypass secret');
        return {
          'x-vercel-protection-bypass':
            process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        };
      }
      return {};
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: {
      mode: 'retain-on-failure',
      snapshots: true,
      screenshots: true,
      sources: true,
    },
    video: isTestingDev ? 'on' : 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState,
      },
      dependencies: ['setup'],
    },
  ],
});
