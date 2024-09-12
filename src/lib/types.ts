import {
  BookingRequest,
  Listing,
  ListingInventory,
  UploadThingImage,
  User,
} from '@prisma/client';

// See the extension in prisma/client.ts
// We have to do this because Prisma doesn't support nested queries with Zod
//  See: https://github.com/prisma/prisma/issues/20091#issuecomment-2251448170
export type UserWithEmail = User & {
  email?: string;
};

/**
 * Listing with all the related data
 */
export type FullListing = Listing & {
  images: UploadThingImage[];
  owner: UserWithEmail;
  inventory: ListingInventory[];
};

export type FullBookingRequest = BookingRequest & {
  listing: Listing & {
    owner: UserWithEmail;
  };
  user: UserWithEmail;
};
