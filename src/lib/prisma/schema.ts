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
