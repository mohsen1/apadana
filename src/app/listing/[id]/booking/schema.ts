import { z } from 'zod';

export const CreateBookingRequestSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string().optional(),
});

export type CreateBookingRequestSchema = z.infer<
  typeof CreateBookingRequestSchema
>;

export const UpdateBookingSchema = z.object({
  bookingId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export type UpdateBookingSchema = z.infer<typeof UpdateBookingSchema>;

export const CancelBookingSchema = z.object({
  bookingId: z.string(),
});

export type CancelBookingSchema = z.infer<typeof CancelBookingSchema>;

export const AlterBookingRequestSchema = z.object({
  bookingRequestId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guestCount: z.number(),
  message: z.string().optional(),
});

export type AlterBookingRequestSchema = z.infer<
  typeof AlterBookingRequestSchema
>;
