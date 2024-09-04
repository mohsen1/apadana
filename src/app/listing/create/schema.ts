import { z } from 'zod';

// TODO: use code generators for this
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
});

export type CreateListing = z.infer<typeof CreateListingSchema>;
