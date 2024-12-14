import { z } from 'zod';

export const CreateBookingRequestSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number(),
  pets: z.boolean(),
  message: z.string().optional(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const UpdateBookingSchema = z.object({
  bookingId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;

export const CancelBookingSchema = z.object({
  bookingId: z.string(),
});

export type CancelBooking = z.infer<typeof CancelBookingSchema>;

export const AlterBookingRequestSchema = z.object({
  bookingRequestId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guestCount: z.number(),
  message: z.string().optional(),
});

export type AlterBookingRequest = z.infer<typeof AlterBookingRequestSchema>;
