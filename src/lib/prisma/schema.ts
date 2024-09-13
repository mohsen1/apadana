import { BookingRequestStatus } from '@prisma/client';
import { z } from 'zod';

// TODO: use code generators for this

export const UploadImageSchema = z.object({
  url: z.string(),
  key: z.string(),
  name: z.string().optional(),
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
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  amenities: z.array(z.string()),
  pricePerNight: z.number(),
  minimumStay: z.number().optional(),
  maximumGuests: z.number().optional(),
  houseRules: z.string(),
  published: z.boolean().optional(),
  timeZone: z.string(),
  images: z.array(UploadImageSchema).optional(),
});

export const GetListingSchema = z.object({
  id: z.number(),
  include: z
    .object({
      inventory: z.boolean().optional(),
      owner: z.boolean().optional(),
      images: z.boolean().optional(),
      bookings: z.boolean().optional(),
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
    id: z.number(),
  });

export const CreateListingSchema = BaseListingSchema.extend({});

export type CreateListing = z.infer<typeof CreateListingSchema>;

export const EditInventorySchema = z.object({
  listingId: z.number(),
  inventory: z.array(
    z.object({
      date: z.coerce.date(),
      isAvailable: z.boolean().optional().default(true),
      price: z.number(),
      bookingId: z.number().nullable().optional(),
    }),
  ),
});

export type EditInventory = z.infer<typeof EditInventorySchema>;

export const CreateBookingRequestSchema = z.object({
  listingId: z.number(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const GetBookingRequestSchema = z.object({
  id: z.number(),
});

export type GetBookingRequest = z.infer<typeof GetBookingRequestSchema>;

export const GetBookingRequestsSchema = z.object({
  listingId: z.number(),
  include: z
    .object({
      user: z.boolean().optional(),
      listing: z.boolean().optional(),
    })
    .optional(),
  take: z
    .number()
    .optional()
    .default(10)
    .describe('Limit of how many booking requests to return'),
  skip: z
    .number()
    .optional()
    .default(0)
    .describe('Offset of how many booking requests to skip'),
  status: z.nativeEnum(BookingRequestStatus).optional(),
});

export type GetBookingRequests = z.infer<typeof GetBookingRequestsSchema>;

export const ChangeBookingRequestStatusSchema = z.object({
  bookingRequestId: z.string(),
  status: z.nativeEnum(BookingRequestStatus),
});

export type ChangeBookingRequestStatus = z.infer<
  typeof ChangeBookingRequestStatusSchema
>;
