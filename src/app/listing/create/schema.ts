import { z } from 'zod';

// TODO: use code generators for this

export const UploadImageSchema = z.object({
  url: z.string(),
  key: z.string(),
  name: z.string().optional(),
});

export type UploadImage = z.infer<typeof UploadImageSchema>;

export const CreateListingSchema = z.object({
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

export type CreateListing = z.infer<typeof CreateListingSchema>;
