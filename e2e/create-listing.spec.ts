import { expect, test } from './base';

test.describe.serial('create listing', () => {
  test('Fill in the form step by step and create the listing', async ({
    page,
    currentListing,
  }) => {
    // Navigate to the create listing page
    await page.goto('/listing/create');

    // Enter the address
    await page.getByPlaceholder('Enter your address').fill('1354 Sevier Ave');

    // Verify the address suggestion is visible
    await expect(
      page.getByText('1354 Sevier Avenue, Menlo Park, CA, USA'),
    ).toBeVisible();

    // Select the suggested address
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Verify the map is visible
    await expect(page.getByLabel('Map')).toBeVisible();

    // Move to the next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Fill in the listing title
    await page.getByLabel('Listing Title').fill('My new test listing');

    // Fill in the listing description
    await page
      .getByLabel('Description')
      .fill(
        'This is a new test listing\nThis is the second line of the description',
      );

    // Select the property type as 'House'
    await page.getByRole('button', { name: 'House' }).click();

    // Move to the next step
    await page.getByRole('button', { name: 'Next' }).click();

    // Select Wi-Fi amenity
    await page.getByRole('checkbox', { name: 'Wi-Fi' }).check();

    // Select Washer amenity
    await page.getByRole('checkbox', { name: 'Washer' }).check();

    // Select Dryer amenity
    await page.getByRole('checkbox', { name: 'Dryer' }).check();

    // Verify that the selected amenities are checked
    await expect(page.getByRole('checkbox', { name: 'Wi-Fi' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Washer' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Dryer' })).toBeChecked();

    // Move to the next step
    await page.getByRole('button', { name: 'Next' }).click();

    await page.route(
      '**/api/uploadthing?actionType=upload&slug=imageUploader',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              url: 'https://sea1.ingest.uploadthing.com/DO8cEdIOn9QlPii1Ujs8uaIC0NwKfJXpOT3zdBGoRUY4ErV9?expires=1732268657066&x-ut-identifier=l0v1d7mwqi&x-ut-file-name=photo-1.jpg&x-ut-file-size=192117&x-ut-file-type=image%252Fjpeg&x-ut-slug=imageUploader&x-ut-content-disposition=inline&signature=hmac-sha256%3D64798f89554c8113eb908004117ef6762194f8f853370857aa83eadb79335413',
              key: 'DO8cEdIOn9QlPii1Ujs8uaIC0NwKfJXpOT3zdBGoRUY4ErV9',
              name: 'photo-1.jpg',
              customId: null,
            },
          ]),
        });
      },
    );

    await page.route('https://*.uploadthing.com/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://utfs.io/f/DO8cEdIOn9QlPii1Ujs8uaIC0NwKfJXpOT3zdBGoRUY4ErV9',
          appUrl:
            'https://utfs.io/a/l0v1d7mwqi/DO8cEdIOn9QlPii1Ujs8uaIC0NwKfJXpOT3zdBGoRUY4ErV9',
          serverData: {
            uploadedBy: 'user_2pBNWcOEO4dt1XSmYwyCRd3IYJf',
          },
          fileHash: 'cfd8f6ed30409edfdcd674956b87ea1c',
        }),
      });
    });

    // Upload images
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(['e2e/fixtures/photo-1.jpg']);

    await page.getByRole('button', { name: 'Next' }).click();

    // Fill in the price per night
    await page.getByLabel('Price per night').fill('150');

    // Fill in the minimum stay
    await page.getByLabel('Minimum stay').fill('2');

    // Fill in the maximum guests
    await page.getByLabel('Maximum guests').fill('4');

    await page.getByRole('button', { name: 'Next' }).click();

    // House rules
    await page
      .getByLabel('House rules')
      .fill('No smoking is allowed. No pets.');

    await page.getByRole('button', { name: 'Submit Listing' }).click();

    await page.waitForURL(/\/listing\/\d+\/manage\/calendar\?newListing=true/, {
      waitUntil: 'networkidle', // Add waitUntil to handle redirects
    });
    currentListing.id = new URL(page.url()).pathname.split('/')[2];

    await expect(page.getByText('Welcome to your new listing!')).toBeVisible();
    await expect(page.getByText('Manage "My new test listing"')).toBeVisible();
  });

  test('Delete the listing', async ({ page, currentListing }) => {
    expect(currentListing.id).toBeDefined();
    await page.goto(`/listing/${currentListing.id}/delete`);
    await expect(page.getByText('Delete "My new test listing"')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForURL('/listing');
    await page.goto(`/listing/${currentListing.id}/delete`);
    await expect(page.getByText('Listing Not Found')).toBeVisible();
  });
});
