import { expect, test } from './base';

test.describe.serial('Create and delete a Listing', () => {
  let currentListingId: string;

  test('create listing ', async ({ page }) => {
    // This is a long test and will take more than our standard timeout to finish
    test.setTimeout(test.info().timeout * 3);

    await test.step('Navigate to the create listing page', async () => {
      await page.goto('/listing/create');
      await expect(page.getByText('Location Details')).toBeVisible();
    });

    await test.step('Enter the address and verify suggestion', async () => {
      await page.getByPlaceholder('Enter your address').fill('1354 Sevier Ave');
      await expect(
        page.getByText('1354 Sevier Avenue, Menlo Park, CA, USA'),
      ).toBeVisible();
    });

    await test.step('Select the suggested address and verify map visibility', async () => {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(page.getByLabel('Map')).toBeVisible();
    });

    await test.step('Navigate to the next step', async () => {
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(
        page.getByRole('heading', { name: 'Basic Information' }),
      ).toBeVisible();
    });

    await test.step('Fill in listing title and description', async () => {
      await page.getByLabel('Listing Title').fill('My new test listing');
      await page
        .getByLabel('Description')
        .fill(
          'This is a new test listing\nThis is the second line of the description',
        );
      await expect(page.getByLabel('Listing Title')).toHaveValue(
        'My new test listing',
      );
      await expect(page.getByLabel('Description')).toHaveValue(
        'This is a new test listing\nThis is the second line of the description',
      );
    });

    await test.step('Select property type', async () => {
      await page.getByRole('button', { name: 'House' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
    });

    await test.step('Navigate to amenities step', async () => {
      await expect(
        page.getByRole('heading', { name: 'Amenities' }),
      ).toBeVisible();
    });

    await test.step('Select amenities and verify selection', async () => {
      await page.getByRole('checkbox', { name: 'Wi-Fi' }).check();
      await page.getByRole('checkbox', { name: 'Washer' }).check();
      await page.getByRole('checkbox', { name: 'Dryer' }).check();

      await expect(page.getByRole('checkbox', { name: 'Wi-Fi' })).toBeChecked();
      await expect(
        page.getByRole('checkbox', { name: 'Washer' }),
      ).toBeChecked();
      await expect(page.getByRole('checkbox', { name: 'Dryer' })).toBeChecked();
    });

    await test.step('Navigate to photos step', async () => {
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByRole('heading', { name: 'Photos' })).toBeVisible();
    });

    await test.step('Upload images and verify upload', async () => {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(['e2e/fixtures/photo-1.jpg']);

      const button = page.getByRole('button', { name: 'Next' });

      while (await button.getAttribute('disabled')) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await button.click();
    });

    await test.step('Navigate to pricing step', async () => {
      await expect(
        page.getByRole('heading', { name: 'Pricing' }),
      ).toBeVisible();
    });

    await test.step('Fill in pricing details', async () => {
      await page.getByLabel('Price per night').fill('150');
      await page.getByLabel('Minimum stay').fill('2');
      await page.getByLabel('Maximum guests').fill('4');

      await expect(page.getByLabel('Price per night')).toHaveValue('150');
      await expect(page.getByLabel('Minimum stay')).toHaveValue('2');
      await expect(page.getByLabel('Maximum guests')).toHaveValue('4');
    });

    await test.step('Navigate to house rules step', async () => {
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(
        page.getByRole('heading', { name: 'House Rules' }),
      ).toBeVisible();
    });

    await test.step('Fill in house rules and submit listing', async () => {
      await page
        .getByLabel('House rules')
        .fill('No smoking is allowed. No pets.');
      await page.getByRole('button', { name: 'Submit Listing' }).click();
      await page.waitForURL(
        /\/listing\/\d+\/manage\/calendar\?newListing=true/,
      );

      currentListingId = new URL(page.url()).pathname.split('/')[2];
      expect(currentListingId).toBeDefined();
    });

    await test.step('Verify listing creation success message', async () => {
      await expect(
        page.getByText('Welcome to your new listing!'),
      ).toBeVisible();
      await expect(
        page.getByText('Manage "My new test listing"'),
      ).toBeVisible();
    });
  });

  test('Delete the listing', async ({ page }) => {
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Delete "My new test listing"')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForURL('/listing');
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Listing Not Found')).toBeVisible();
  });
});
