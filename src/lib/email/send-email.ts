import resend from '@/lib/email/resend';

import { BookingRequestEmail } from '@/components/emails/booking-request-email';
import BookingAlterationEmail from '@/components/emails/BookingAlterationEmail';
import { EarlyAccessEmail } from '@/components/emails/early-access-email';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import WelcomeEmail from '@/components/emails/welcome-email';

function sendEmail({
  email,
  subject,
  from,
  react,
}: {
  email: string;
  subject: string;
  from: string;
  react: React.ReactNode;
}) {
  if (email.includes('@e2e-testing.apadana.app')) {
    return;
  }

  return resend.emails.send({
    from,
    to: email,
    subject,
    react,
  });
}

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
    await sendEmail({
      email: hostEmail,
      subject: `New Booking Request: ${listingTitle}`,
      from: 'Apadana <bookings@apadana.app>',
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
  } catch {
    throw new Error('Failed to send email notification');
  }
}

export interface BookingAlterationEmailProps {
  hostEmail: string;
  guestName: string;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  alterationType?: 'modified' | 'cancelled';
}

export async function sendBookingAlterationEmail(
  props: BookingAlterationEmailProps,
) {
  const {
    hostEmail,
    guestName,
    listingTitle,
    startDate,
    endDate,
    alterationType = 'modified',
  } = props;

  return sendEmail({
    email: hostEmail,
    subject: `Booking ${alterationType === 'cancelled' ? 'Cancelled' : 'Modified'} - ${listingTitle}`,
    from: 'Apadana <bookings@apadana.app>',
    react: BookingAlterationEmail({
      listingTitle,
      startDate,
      endDate,
      guestName,
      alterationType,
    }),
  });
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
export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: 'Apadana <onboarding@apadana.app>',
    to: email,
    subject: 'Welcome to the app',
    react: WelcomeEmail({ name }),
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
