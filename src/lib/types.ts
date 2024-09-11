import {
  Listing,
  ListingInventory,
  UploadThingImage,
  User,
} from '@prisma/client';

/**
 * Listing with all the related data
 */
export type FullListing = Listing & {
  images: UploadThingImage[];
  owner: User;
  inventory: ListingInventory[];
};
