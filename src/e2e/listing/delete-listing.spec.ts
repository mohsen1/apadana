import { expect, test } from '../base';
import {
  prodE2eTestHostUser,
  prodE2eTestListing_usa_1,
} from '@/e2e/fixtures/data';

test.describe.serial('Delete the listing', async () => {
  let currentListingId: string;
  test('Create a listing', async ({ data, page }) => {
    const user = await data.login(prodE2eTestHostUser.email, page);
    const listing = await data.createListing({
      ...prodE2eTestListing_usa_1,
      owner: {
        connect: {
          id: user.userId,
        },
      },
    });
    expect(listing.listingId).toBeDefined();
    currentListingId = listing.listingId;
  });

  test('Use UI to delete the listing', async ({ page }) => {
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Delete "My new test listing"')).toBeVisible();

    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForURL('/listing', {
      timeout: test.info().timeout * 5,
    });
    await page.goto(`/listing/${currentListingId}/delete`);
    await expect(page.getByText('Listing Not Found')).toBeVisible();
  });
});
