import { prodE2eTestHostUser, prodE2eTestListing_usa_1 } from '@/e2e/fixtures/data';

import { expect, test } from '../base';

test.describe.serial('Delete the listing', async () => {
  let currentListingId: string;
  test.beforeAll(async ({ data, page }) => {
    const user = await data.login(prodE2eTestHostUser.email, page);
    const listing = await data.createListing({
      ...prodE2eTestListing_usa_1,
      owner: {
        connect: {
          id: user.userId,
        },
      },
    });
    currentListingId = listing.listingId;
  });

  test('Use UI to delete the listing', async ({ page }) => {
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Delete "My new test listing"')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('No listings were found')).toBeVisible();
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Listing Not Found')).toBeVisible();
  });
});
