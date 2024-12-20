import { BookingRequestStatus } from '@prisma/client';
import { z } from 'zod';

export const UploadImageSchema = z.object({
  url: z.string(),
  key: z.string(),
  name: z.string(),
});

export type UploadImage = z.infer<typeof UploadImageSchema>;

export const CreateBookingSchema = z.object({
  listingId: z.number(),
  checkIn: z.date(),
  checkOut: z.date(),
});

export type CreateBooking = z.infer<typeof CreateBookingSchema>;

export const BaseListingSchema = z.object({
  title: z.string(),
  description: z.string(),
  propertyType: z.string(),
  address: z.string(),
  showExactLocation: z.boolean().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  amenities: z.array(z.string()),
  pricePerNight: z.number().min(1),
  minimumStay: z.number().min(1).optional(),
  maximumGuests: z.number().min(1).max(20).optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  images: z.array(UploadImageSchema).optional(),
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

export type GetListing = z.infer<typeof GetListingSchema>;

export const GetListingsSchema = z.object({
  take: z
    .number()
    .optional()
    .default(10)
    .describe('Limit of how many listings to return'),
  skip: z
    .number()
    .optional()
    .default(0)
    .describe('Offset of how many listings to skip'),
});

export const EditListingSchema = BaseListingSchema.omit({ images: true })
  .partial()
  .extend({
    id: z.string(),
  });

export const CreateListingSchema = BaseListingSchema.extend({});

export type CreateListing = z.infer<typeof CreateListingSchema>;

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

// Schema for getting a booking request
export const GetBookingRequestSchema = z.object({
  id: z.string(),
});

export type GetBookingRequest = z.infer<typeof GetBookingRequestSchema>;

// Schema for altering a booking request
export const AlterBookingRequestSchema = z.object({
  bookingRequestId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guestCount: z.number(),
  message: z.string().optional(),
});

export type AlterBookingRequest = z.infer<typeof AlterBookingRequestSchema>;

// Schema for creating a booking request
export const CreateBookingRequestSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

// Schema for getting booking requests
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

export type GetBookingRequests = z.infer<typeof GetBookingRequestsSchema>;

// Schema for booking request response
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

export type BookingRequestResponse = z.infer<
  typeof BookingRequestResponseSchema
>;

export const ChangeBookingRequestStatusSchema = z.object({
  bookingRequestId: z.string(),
  status: z.nativeEnum(BookingRequestStatus),
});

export type ChangeBookingRequestStatus = z.infer<
  typeof ChangeBookingRequestStatusSchema
>;

export const GetBookingsSchema = z.object({
  listingId: z.string(),
  take: z.number().optional().default(10),
  skip: z.number().optional().default(0),
});

export type GetBookings = z.infer<typeof GetBookingsSchema>;
