import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const isTestingDev = process.env.PLAYWRIGHT_IS_TESTING_DEV === 'true';

export const storageState = path.join(
  process.cwd(),
  '.cache/__e2e__auth/state.json',
);

const port = process.env.PORT || '3030';
const localUrl = `http://localhost:${port}`;
const baseURL = process.env.BASE_URL || localUrl;

const htmlReportFolder = path.join(
  process.cwd(),
  '.next',
  'playwright-report',
  'html',
);
const jsonReportFolder = path.join(
  process.cwd(),
  '.next',
  'playwright-report',
  'json',
);
if (!fs.existsSync(htmlReportFolder)) {
  fs.mkdirSync(htmlReportFolder, { recursive: true });
}
if (!fs.existsSync(jsonReportFolder)) {
  fs.mkdirSync(jsonReportFolder, { recursive: true });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: path.join(process.cwd(), 'src/e2e'),
  testMatch: '**/*.spec.ts',
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
    [
      'json',
      {
        outputFile: path.join(jsonReportFolder, 'report.json'),
      },
    ],
  ],

  globalSetup: path.join(process.cwd(), 'src/e2e/global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    get extraHTTPHeaders(): Record<string, string> {
      const headers: Record<string, string> = {};
      // Learn more about this here:
      // https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET !== undefined) {
        headers['x-vercel-protection-bypass'] =
          process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      }

      // This is used to authenticate the e2e tests with the API in production
      // without this value /api/e2e will reject the request
      if (process.env.E2E_TESTING_SECRET !== undefined) {
        headers['x-e2e-testing-secret'] = process.env.E2E_TESTING_SECRET;
      }

      return headers;
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
