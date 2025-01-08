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

  // Configure snapshot path to include platform for better organization
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{testFilePath}/{platform}/{arg}{ext}',

  expect: {
    // Configure screenshot comparison settings
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  use: {
    baseURL: process.env.STORYBOOK_URL || 'http://localhost:6006',
    get extraHTTPHeaders(): Record<string, string> {
      const headers: Record<string, string> = {};
      if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
        headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      }
      return headers;
    },
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: [
        '--accept-insecure-certs',
        '--ignore-certificate-errors',
        // Disable GPU acceleration for consistent rendering
        '--disable-gpu',
        // Force consistent color scheme
        '--force-color-profile=srgb',
        '--force-prefers-reduced-motion',
      ],
    },
    // Configure screenshot settings
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },
    // Ensure consistent viewport
    viewport: { width: 1280, height: 720 },
    // Force light theme for consistency
    colorScheme: 'light',
    // Ensure consistent font rendering
    deviceScaleFactor: 1,
    // Disable animations
    hasTouch: false,
    isMobile: false,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Additional Chrome-specific settings for consistent rendering
        launchOptions: {
          args: [
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text',
          ],
        },
      },
    },
  ],

  get webServer() {
    if (process.env.STORYBOOK_URL) {
      return undefined;
    }

    return {
      command: 'pnpm storybook',
      url: 'http://localhost:6006',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    };
  },
});
