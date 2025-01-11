import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import _ from 'lodash';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

import { E2E_TESTING_SECRET_HEADER } from '@/lib/auth/constants';

dotenv.config();

// Validate environment variables. Run only once to avoid running the validation
// on every test run.
_.memoize(() => {
  const processEnvSchema = z.object({
    BASE_URL: z.string().url().describe('The base URL of the app.'),
    E2E_TESTING_SECRET: z
      .string()
      .min(20)
      .max(60)
      .describe('The secret used to authenticate the /api/e2e route.'),
  });

  const processEnv = processEnvSchema.safeParse(process.env);

  if (!processEnv.success) {
    throw new Error(
      `Invalid environment variables:\n${Object.entries(
        processEnv.error.flatten().fieldErrors ?? {},
      )
        .map(([key, value]) => `${key}: ${value?.join(', ')}`)
        .join('\n')}`,
    );
  }
})();

export const storageState = path.join(process.cwd(), '.cache/__e2e__auth/state.json');

const htmlReportFolder = path.join(process.cwd(), '.next', 'playwright-report', 'html');
const jsonReportFolder = path.join(process.cwd(), '.next', 'playwright-report', 'json');
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
  retries: process.env.CI ? 1 : 0,
  /* Always run tests in parallel */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html',
      {
        get open() {
          if (process.env.DOCKER_CONTAINER || process.env.CI) {
            return 'never';
          }
          return 'never';
        },
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
    baseURL: process.env.BASE_URL,
    get extraHTTPHeaders(): Record<string, string> {
      const headers: Record<string, string> = {};
      // Learn more about this here:
      // https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
        headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      }
      // Docs: https://vercel.com/docs/workflow-collaboration/vercel-toolbar/managing-toolbar#disable-toolbar-for-automation
      headers['x-vercel-skip-toolbar'] = '1';

      // E2E testing secret
      if (process.env.E2E_TESTING_SECRET) {
        headers[E2E_TESTING_SECRET_HEADER] = process.env.E2E_TESTING_SECRET;
      }

      return headers;
    },
    // Trust our specific CA certificate instead of ignoring all cert errors
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [`--accept-insecure-certs`, '--ignore-certificate-errors'],
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: {
      mode: 'retain-on-failure',
      snapshots: true,
      screenshots: true,
      sources: true,
    },
    video: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: 'only-on-failure',
    // Ensure screenshots work in Linux container
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      get name() {
        // Use Chrome on macOS because it's faster to resolve
        // self-signed certificate
        if (os.platform() === 'darwin') {
          return 'chrome';
        }
        return 'chromium';
      },
      use: {
        ...devices['Desktop Chrome'],
        storageState,
      },
      dependencies: ['setup'],
    },
  ],
});
