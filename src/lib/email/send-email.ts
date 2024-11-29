import { Resend } from 'resend';

import { BookingRequestEmail } from '@/components/emails/booking-request-email';
import { EarlyAccessEmail } from '@/components/emails/early-access-email';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a booking request email to the host when a guest requests a booking.
 */
export async function sendBookingRequestEmail({
  hostEmail,
  guestName,
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  currency,
}: {
  hostEmail: string;
  guestName: string;
  listingTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
}) {
  try {
    await resend.emails.send({
      from: 'Apadana Bookings <bookings@apadana.app>',
      to: hostEmail,
      subject: `New Booking Request: ${listingTitle}`,
      react: BookingRequestEmail({
        guestName,
        listingTitle,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        currency,
      }),
    });
  } catch (error) {
    throw new Error('Failed to send email notification');
  }
}

/**
 * Send an early access email to a user when they sign up for early access.
 */
export async function sendEarlyAccessEmail(email: string) {
  await resend.emails.send({
    from: 'Apadana <onboarding@apadana.app>',
    to: email,
    subject: 'Welcome to Apadana Early Access',
    react: EarlyAccessEmail({ email }),
  });
}
