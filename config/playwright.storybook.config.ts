import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: path.join(process.cwd(), './src/storybook-e2e'),
  testMatch: '**/*.spec.ts',
  outputDir: path.join(process.cwd(), './storybook-e2e-test-results/storybook'),
  timeout: 10000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined, // always run in parallel

  reporter: [['html', { outputFolder: path.join(process.cwd(), './storybook-e2e-html-report') }]],

  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{testFilePath}/{platform}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:6006',
    get extraHTTPHeaders(): Record<string, string> {
      const headers: Record<string, string> = {};
      // Learn more about this here:
      // https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
        headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      }

      return headers;
    },
    trace: 'on-first-retry',
    screenshot: {
      mode: 'only-on-failure',
    },
  },
  projects: [
    {
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: 'pnpm storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
