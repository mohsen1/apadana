import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Playwright by default will launch the server in production mode.
 * When writing and debugging e2e tests locally, it's useful to have the dev server or any other server
 * that is already running instead.
 * This variable is used to determine whether to run the dev server or not.
 *
 * This variable is used in the e2e:debug package.json script
 */

const port = process.env.PORT || '3030';
const localUrl = `http://127.0.0.1:${port}`;
const baseURL = process.env.BASE_URL || localUrl;

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
  ],
  timeout: 30_000,

  globalSetup: require.resolve('./e2e/global-setup.ts'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: {
      mode: 'retain-on-failure',
      snapshots: true,
      screenshots: true,
      sources: true,
    },
  },
  // get webServer() {
  // if (process.env.CI) { return undefined; }
  //   return {
  //     command: `docker compose ps -q | grep -q . && nc -z localhost ${port} || (pnpm docker:prod:down && pnpm run docker:prod)`,
  //     url: baseURL,
  //     reuseExistingServer: true,
  //     timeout: 120_000,
  //   };
  // },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
