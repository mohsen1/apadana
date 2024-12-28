import { expect, Page, test } from '@playwright/test';
import glob from 'fast-glob';
import path from 'path';

interface StoryModule {
  default: {
    title: string;
    name?: string;
  };
  [key: string]: {
    name?: string;
  };
}

// Helper function to navigate to a story and take a screenshot
async function captureStory(page: Page, storyId: string, variant: string, theme: 'light' | 'dark') {
  const testId = `${storyId.replaceAll('/', '-')}--${variant.toLowerCase()}`;
  const searchParams = new URLSearchParams();
  searchParams.set('args', '');
  searchParams.set('globals', `theme:${theme}`);
  searchParams.set('id', testId);
  searchParams.set('viewMode', 'story');

  const timeout = test.info().timeout;
  await page.goto(`/iframe.html?${searchParams.toString()}`);

  // make sure no errors are shown before loading story. fail quickly if they are.
  await expect(page.locator('h1#error-message')).not.toBeVisible({
    timeout: timeout / 100,
  });

  // wait for storybook-root to include data-storybook-wrapper
  await page.waitForSelector('#storybook-root > [data-storybook-wrapper="true"]');

  // Wait for any loading states to disappear
  await page.locator('text=Loading...').waitFor({ state: 'hidden', timeout: timeout / 10 });

  // wait for all images to load
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalHeight !== 0),
  );

  // Small wait to ensure everything is loaded and settled
  await page.waitForTimeout(timeout / 10);

  // no errors after loading story
  await expect(page.locator('h1#error-message')).not.toBeVisible();

  // Take screenshot and compare
  const screenshot = await page.screenshot({
    fullPage: true,
    animations: 'disabled',
  });

  expect(screenshot).toMatchSnapshot(`${testId}--${theme}.png`, { maxDiffPixelRatio: 0.015 });
}

// Find all story files
const storyFiles = glob.sync('src/**/*.stories.tsx', {
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/storybook-e2e/**',
    '**/e2e/**',
    '**/.cache/**',
    '**/config/**',
  ],
});

/**
 * Convert a story name to a valid story ID
 * Converts PascalCase to kebab-case
 * Converts spaces to dashes
 * Converts underscores to dashes
 * Converts to lowercase
 */
function sanitizeStoryName(name: string) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

for (const storyFile of storyFiles) {
  const componentName = path.basename(storyFile, '.stories.tsx');
  const relativePath = path.relative(process.cwd(), storyFile);

  test.describe(componentName, () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const storyModule = require(`../../${relativePath}`) as StoryModule;
    const storyId = storyModule.default.title?.toLowerCase().replace(/\s+/g, '-');

    if (!storyId) {
      test.fail(true, `No story title found in ${relativePath}`);
      return;
    }

    const variants: string[] = [];
    // Find all exports that aren't 'default' - these are the story variants
    for (const [key, value] of Object.entries(storyModule)) {
      if ('name' in value && value.name) {
        variants.push(sanitizeStoryName(value.name));
      } else if (sanitizeStoryName(key) !== 'default') {
        // eslint-disable-next-line no-console
        console.warn(
          `No name found for story variant ${key} in ${relativePath}. Please add names to all Storybook variants`,
        );
        variants.push(sanitizeStoryName(key));
      }
    }

    // If no variants found, test the default story
    if (variants.length === 0) {
      variants.push('default');
    }

    for (const theme of ['light', 'dark'] as const) {
      for (const variant of variants) {
        test(`${variant} ${theme}`, async ({ page }) => {
          await captureStory(page, storyId, variant, theme);
        });
      }
    }
  });
}
