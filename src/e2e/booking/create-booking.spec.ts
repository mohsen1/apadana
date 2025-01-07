import { addDays, format } from 'date-fns';

import { expect, test } from '@/e2e/base';

test.describe('Booking Flow', () => {
  const userEmail = 'booking-test@example.com';
  const userPassword = 'Test123!@#';
  const hostEmail = 'host-test@example.com';
  const hostPassword = 'Host123!@#';

  test.beforeEach(async ({ data }) => {
    // Create test users and clean up any existing data
    await data.deleteUser(userEmail);
    await data.deleteUser(hostEmail);
    await data.createUser(userEmail, userPassword);
    await data.createUser(hostEmail, hostPassword);
    await data.deleteAllE2eListings();
  });

  test.afterEach(async ({ data }) => {
    await data.deleteUser(userEmail);
    await data.deleteUser(hostEmail);
    await data.deleteAllE2eListings();
  });

  // TODO: Enable complete booking flow
  test.skip('complete booking flow', async ({ page, data }) => {
    // Create a test listing
    const hostUser = await data.createUser(hostEmail, hostPassword);
    const listing = await data.createListing({
      title: 'Test Booking Property',
      description: 'A beautiful property for testing bookings',
      pricePerNight: 100,
      address: 'Test Location',
      owner: {
        connect: {
          id: hostUser.userId,
        },
      },
      images: {
        create: [
          {
            url: 'https://apadana.app/images/placeholder/listing1.jpg',
            key: 'test-image-1',
            name: 'Test Image 1',
          },
          {
            url: 'https://apadana.app/images/placeholder/listing2.jpg',
            key: 'test-image-2',
            name: 'Test Image 2',
          },
        ],
      },
      propertyType: 'APARTMENT',
      maximumGuests: 4,
      minimumStay: 1,
      houseRules: 'No smoking, no parties',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      amenities: ['wifi', 'parking'],
      currency: 'USD',
      published: true,
      showExactLocation: true,
      locationRadius: 1,
      allowPets: false,
      petPolicy: 'No pets allowed',
      slug: 'test-booking-property',
    });

    // Log in as the user
    await data.login(userEmail, page);

    // Navigate to the listing page
    await page.goto(`/listing/${listing.listingId}`);
    await expect(page.getByText('Test Booking Property')).toBeVisible();

    // Select dates
    const startDate = addDays(new Date(), 1);
    const endDate = addDays(new Date(), 3);

    await page.getByLabel('Check-in').click();
    await page.getByText(format(startDate, 'd')).click();

    await page.getByLabel('Check-out').click();
    await page.getByText(format(endDate, 'd')).click();

    // Set number of guests
    await page.getByLabel('Number of guests').click();
    await page.getByText('2').click();

    // Click book now
    await page.getByRole('button', { name: 'Book Now' }).click();

    // Verify booking confirmation
    await expect(page.getByText('Booking Confirmed')).toBeVisible();
    await expect(page.getByText('Test Booking Property')).toBeVisible();
    await expect(page.getByText('2 guests')).toBeVisible();

    // Verify booking details
    const formattedStartDate = format(startDate, 'MMM d, yyyy');
    const formattedEndDate = format(endDate, 'MMM d, yyyy');
    await expect(page.getByText(`${formattedStartDate} - ${formattedEndDate}`)).toBeVisible();

    // Navigate to bookings page and verify booking is listed
    await page.goto('/bookings');
    await expect(page.getByText('Test Booking Property')).toBeVisible();
    await expect(page.getByText(`${formattedStartDate} - ${formattedEndDate}`)).toBeVisible();
  });
});
