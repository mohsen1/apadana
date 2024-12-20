import { expect, test } from '../base';

test('health check', async ({ page }) => {
  await page.goto('/api/health');
  await expect(
    page.getByText(
      JSON.stringify({ status: 'healthy', database: 'connected' }),
    ),
  ).toBeVisible();
});
