import {
  BookingRequest,
  EmailAddress,
  Listing,
  ListingInventory,
  UploadThingImage,
  User,
} from '@prisma/client';

export type FullUser = User & {
  emailAddresses: EmailAddress[];
};

/**
 * Listing with all the related data
 */
export type FullListing = Listing & {
  images: UploadThingImage[];
  owner: FullUser;
  inventory: ListingInventory[];
};

export type FullBookingRequest = BookingRequest & {
  listing: Listing & {
    owner: FullUser;
  };
  user: FullUser;
};
