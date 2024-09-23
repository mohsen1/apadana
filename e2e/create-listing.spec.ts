import { expect, test } from './base';

const fakeUploadThingResponse = [
  {
    key: '1ec959da-a7f8-462f-bf58-c57d7759fef7-9uf9nu.jpg',
    fileName: 'photo-1.jpg',
    fileType: 'image',
    fileUrl:
      'https://utfs.io/f/1ec959da-a7f8-462f-bf58-c57d7759fef7-9uf9nu.jpg',
    pollingJwt: 'fake',
    pollingUrl: 'https://api.uploadthing.com/v6/serverCallback',
    url: 'https://uploadthing-prod-sea1.s3.us-west-2.amazonaws.com/',
    contentDisposition: 'inline',
    customId: null,
    fields: {
      acl: 'public-read',
      'Content-Type': 'image/jpeg',
      'Content-Disposition':
        'inline; filename="photo-1.jpg"; filename*=UTF-8\'\'photo-1.jpg',
      bucket: 'uploadthing-prod-sea1',
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': 'fake',
      'X-Amz-Date': '20240918T114658Z',
      key: '1ec959da-a7f8-462f-bf58-c57d7759fef7-9uf9nu.jpg',
      Policy: 'fake',
      'X-Amz-Signature': 'fake',
    },
  },
];

const fakeUploadThingResponseServerCallbask = {
  status: 'done',
  callbackData: {
    uploadedBy: 'user_2lO2Xgv9x9ODXHdXjgDjwHT85qe',
  },
};

test.describe.serial('create listing', () => {
  test('Fill in the form step by step and create the listing', async ({
    page,
    currentListing,
  }) => {
    // Sign in to the application
    await page.signIn();

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

    // Fake file uploads
    await page.route(
      '**/api/uploadthing?actionType=upload&slug=imageUploader',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(fakeUploadThingResponse),
        });
      },
    );

    await page.route(
      'https://uploadthing-prod-sea1.s3.us-west-2.amazonaws.com/*',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '',
        });
      },
    );
    await page.route(
      'https://api.uploadthing.com/v6/serverCallback',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(fakeUploadThingResponseServerCallbask),
        });
      },
    );

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
    await page.getByRole('button', { name: 'Submit Listing' }).click();

    await page.waitForURL(/\/listing\/\d+\/manage\/calendar\?newListing=true/);
    currentListing.id = new URL(page.url()).pathname.split('/')[2];

    await expect(page.getByText('Welcome to your new listing!')).toBeVisible();
    await expect(page.getByText('Manage "My new test listing"')).toBeVisible();
  });

  test('Delete the listing', async ({ page, currentListing }) => {
    expect(currentListing.id).toBeDefined();
    await page.signIn();
    await page.goto(`/listing/${currentListing.id}/delete`);
    await expect(page.getByText('Delete "My new test listing"')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForURL('/listing');
    await page.goto(`/listing/${currentListing.id}/delete`);
    await expect(page.getByText('Listing Not Found')).toBeVisible();
  });
});
