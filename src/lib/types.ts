import {
  BookingRequest,
  EmailAddress,
  Listing,
  ListingInventory,
  UploadedPhoto,
  User,
} from '@prisma/client';

export type FullUser = User & {
  emailAddresses: EmailAddress[];
};

/**
 * Listing with all the related data
 */
export type FullListing = Listing & {
  images: UploadedPhoto[];
  owner: User;
  inventory: ListingInventory[];
};

/**
 * Listing with only the public data
 */
export type PublicListing = Listing & {
  images: UploadedPhoto[];
  owner: User;
  inventory: ListingInventory[];
};

/**
 * Booking request with all the related data
 */
export type FullBookingRequest = BookingRequest & {
  listing: Listing & {
    owner: FullUser;
  };
  user: FullUser;
};

/**
 * Booking request with only the public data
 */
export type PublicBookingRequest = BookingRequest & {
  listing: PublicListing;
  inventory?: ListingInventory[];
  user: FullUser;
};
