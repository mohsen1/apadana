import { z } from 'zod';

export const CreateBookingSchema = z.object({
  listingId: z.number(),
  checkIn: z.date(),
  checkOut: z.date(),
});

export type CreateBooking = z.infer<typeof CreateBookingSchema>;
