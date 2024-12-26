import resend from '@/lib/email/resend';

import { BookingRequestEmail } from '@/components/emails/booking-request-email';
import BookingAlterationEmail from '@/components/emails/BookingAlterationEmail';
import { EarlyAccessEmail } from '@/components/emails/early-access-email';
import EmailVerification from '@/components/emails/EmailVerification';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import WelcomeEmail from '@/components/emails/welcome-email';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

const BOOKING_EMAIL = 'Apadana <bookings@apadana.app>';
const ONBOARDING_EMAIL = 'Apadana <onboarding@apadana.app>';
const SECURITY_EMAIL = 'Apadana <security@apadana.app>';

// TODO: accept the user that is initiating the email send
// and rate limit the email sending from that user.
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
      from: BOOKING_EMAIL,
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

export async function sendBookingAlterationEmail(props: BookingAlterationEmailProps) {
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
    from: BOOKING_EMAIL,
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
  return sendEmail({
    email,
    from: ONBOARDING_EMAIL,
    subject: 'Welcome to Apadana Early Access',
    react: EarlyAccessEmail({ email }),
  });
}

// TODO: Implement sendWelcomeEmail
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    email,
    from: ONBOARDING_EMAIL,
    subject: 'Welcome to the app',
    react: WelcomeEmail({ name }),
  });
}

/**
 * Send a password reset email to a user when they request a password reset.
 */
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  return sendEmail({
    email,
    from: SECURITY_EMAIL,
    subject: 'Reset Your Password',
    react: PasswordResetEmail({ resetLink }),
  });
}

export async function sendEmailVerificationEmail(params: { to: string; verificationCode: string }) {
  const verificationUrl = `https://${process.env.VERCEL_URL}/api/verify-email?code=${
    params.verificationCode
  }&email=${encodeURIComponent(params.to)}`;

  try {
    return sendEmail({
      email: params.to,
      from: ONBOARDING_EMAIL,
      subject: 'Verify your email address',
      react: EmailVerification({
        verificationUrl,
        emailAddress: params.to,
      }),
    });
  } catch (error) {
    logger.error('Failed to send verification email', { error, to: params.to });
    throw error;
  }
}
