import { BookingRequestStatus } from '@prisma/client';
import { z } from 'zod';

import { BookingBaseModel, BookingRequestBaseModel, ListingBaseModel } from '@/prisma/zod';

export const UploadImageSchema = z.object({
  url: z.string(),
  key: z.string(),
  name: z.string(),
});

export type UploadImage = z.infer<typeof UploadImageSchema>;

export const CreateBookingSchema = BookingBaseModel.pick({
  checkIn: true,
  checkOut: true,
}).extend({
  listingId: z.string(),
});

export const CreateListingSchema = ListingBaseModel.extend({
  images: z.array(UploadImageSchema).optional(),
});

export const EditListingSchema = ListingBaseModel.omit({ images: true }).partial().extend({
  id: z.string(),
});

export const GetListingSchema = z.object({
  id: z.string(),
  include: z
    .object({
      images: z.boolean(),
      inventory: z.boolean(),
      owner: z.boolean(),
    })
    .optional(),
});

export const GetListingsSchema = z.object({
  take: z.number().optional().default(10).describe('Limit of how many listings to return'),
  skip: z.number().optional().default(0).describe('Offset of how many listings to skip'),
});

export const EditInventorySchema = z.object({
  listingId: z.string(),
  inventory: z.array(
    z.object({
      date: z.coerce.date(),
      isAvailable: z.boolean().optional().default(true),
      price: z.number(),
      bookingId: z.string().nullable().optional(),
    }),
  ),
});

export type EditInventory = z.infer<typeof EditInventorySchema>;

export const EditListingImagesSchema = z.object({
  listingId: z.string(),
  images: z.array(UploadImageSchema),
});

export type EditListingImages = z.infer<typeof EditListingImagesSchema>;

export const CreateBookingRequestSchema = BookingRequestBaseModel.pick({
  listingId: true,
  checkIn: true,
  checkOut: true,
  guests: true,
  pets: true,
  message: true,
});

export const GetBookingRequestsSchema = z.object({
  take: z.number().optional(),
  skip: z.number().optional(),
  status: z.nativeEnum(BookingRequestStatus).optional(),
  listingId: z.string().optional(),
  include: z
    .object({
      user: z.boolean().optional(),
      listing: z.boolean().optional(),
    })
    .optional(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;
export type GetBookingRequests = z.infer<typeof GetBookingRequestsSchema>;

export const BookingRequestResponseSchema = z.object({
  data: z.object({
    bookingRequest: z
      .object({
        id: z.string(),
        userId: z.string(),
        listingId: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        guests: z.number(),
        status: z.nativeEnum(BookingRequestStatus),
        message: z.string(),
        pets: z.boolean(),
        totalPrice: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
        alterationOf: z.string().nullable(),
        listing: z
          .object({
            id: z.string(),
            title: z.string(),
            // Add other listing fields as needed
          })
          .optional(),
        user: z
          .object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
            // Add other user fields as needed
          })
          .optional(),
      })
      .nullable(),
  }),
});

export type BookingRequestResponse = z.infer<typeof BookingRequestResponseSchema>;

export const ChangeBookingRequestStatusSchema = z.object({
  bookingRequestId: z.string(),
  status: z.nativeEnum(BookingRequestStatus),
});

export type ChangeBookingRequestStatus = z.infer<typeof ChangeBookingRequestStatusSchema>;

export const GetBookingsSchema = z.object({
  listingId: z.string(),
  take: z.number().optional().default(10),
  skip: z.number().optional().default(0),
});

export type GetBookings = z.infer<typeof GetBookingsSchema>;
