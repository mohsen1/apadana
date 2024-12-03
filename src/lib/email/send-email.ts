import resend from '@/lib/email/resend';

import { BookingRequestEmail } from '@/components/emails/booking-request-email';
import { EarlyAccessEmail } from '@/components/emails/early-access-email';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';

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

// TODO: Implement sendWelcomeEmail
export async function sendWelcomeEmail(email: string) {
  return resend.emails.send({
    from: 'Apadana <onboarding@apadana.app>',
    to: email,
    subject: 'Welcome to the app',
    html: '<p>Welcome to the app</p>',
  });
}

/**
 * Send a password reset email to a user when they request a password reset.
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  return resend.emails.send({
    from: 'Apadana <security@apadana.app>',
    to: email,
    subject: 'Reset Your Password',
    react: PasswordResetEmail({ resetLink }),
  });
}
