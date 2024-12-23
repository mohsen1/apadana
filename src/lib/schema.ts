import { BookingRequestStatus, Currency } from '@prisma/client';
import { z } from 'zod';

import {
  ListingBaseModel,
  RelatedUploadedPhotoBaseModel,
  RelatedUserBaseModel,
} from '@/prisma/zod';

// Base schemas
export const UploadImageSchema = z.object({
  url: z.string(),
  key: z.string(),
  name: z.string(),
});

export const BaseListingSchema = ListingBaseModel.extend({
  images: RelatedUploadedPhotoBaseModel.array(),
  owner: RelatedUserBaseModel,
});

// User schemas
export const clientUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const successfulLogin = z.object({
  user: clientUserSchema,
});

// Listing schemas
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

export const EditListingSchema = BaseListingSchema.omit({ images: true }).partial().extend({
  id: z.string(),
});

export const CreateListingSchema = BaseListingSchema.extend({});

export const EditListingImagesSchema = z.object({
  listingId: z.string(),
  images: z.array(UploadImageSchema),
});

// Booking schemas
export const CreateBookingSchema = z.object({
  listingId: z.number(),
  checkIn: z.date(),
  checkOut: z.date(),
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

// Booking Request schemas
export const GetBookingRequestSchema = z.object({
  id: z.string(),
});

export const AlterBookingRequestSchema = z.object({
  bookingRequestId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guestCount: z.number(),
  message: z.string().optional(),
});

export const CreateBookingRequestSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string(),
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
          })
          .optional(),
        user: z
          .object({
            id: z.string(),
            firstName: z.string().nullable(),
            lastName: z.string().nullable(),
          })
          .optional(),
      })
      .nullable(),
  }),
});

export const ChangeBookingRequestStatusSchema = z.object({
  bookingRequestId: z.string(),
  status: z.nativeEnum(BookingRequestStatus),
});

export const GetBookingsSchema = z.object({
  listingId: z.string(),
  take: z.number().optional().default(10),
  skip: z.number().optional().default(0),
});

export const localEmailSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  subject: z.string(),
  html: z.string(),
});

// UpdateBookingSchema
export const UpdateBookingSchema = z.object({
  bookingId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});
// CancelBookingSchema
export const CancelBookingSchema = z.object({
  bookingId: z.string(),
});
// UpdateUserSchema
export const UpdateUserSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Type exports
export type UploadImage = z.infer<typeof UploadImageSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type GetListing = z.infer<typeof GetListingSchema>;
export type CreateListing = z.infer<typeof CreateListingSchema>;
export type EditInventory = z.infer<typeof EditInventorySchema>;
export type EditListingImages = z.infer<typeof EditListingImagesSchema>;
export type GetBookingRequest = z.infer<typeof GetBookingRequestSchema>;
export type AlterBookingRequest = z.infer<typeof AlterBookingRequestSchema>;
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;
export type GetBookingRequests = z.infer<typeof GetBookingRequestsSchema>;
export type BookingRequestResponse = z.infer<typeof BookingRequestResponseSchema>;
export type ChangeBookingRequestStatus = z.infer<typeof ChangeBookingRequestStatusSchema>;
export type GetBookings = z.infer<typeof GetBookingsSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
