import { headers } from 'next/headers';

import { E2E_TESTING_SECRET_HEADER } from '@/lib/auth/constants';
import { getResend } from '@/lib/email/resend';

import { BookingAlterationEmail } from '@/components/emails/BookingAlterationEmail';
import { BookingRequestEmail } from '@/components/emails/BookingRequestEmail';
import { EarlyAccessEmail } from '@/components/emails/EarlyAccessEmail';
import EmailVerification from '@/components/emails/EmailVerification';
import { PasswordChangeEmail } from '@/components/emails/PasswordChangeEmail';
import { PasswordResetEmail } from '@/components/emails/PasswordResetEmail';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';

import { createLogger } from '@/utils/logger';
import { createListingUrl, createVerificationUrl } from '@/utils/url';

const logger = createLogger('send-email');

const BOOKING_EMAIL = 'Apadana <bookings@apadana.app>';
const ONBOARDING_EMAIL = 'Apadana <onboarding@apadana.app>';
const SECURITY_EMAIL = 'Apadana <security@apadana.app>';

// TODO: accept the user that is initiating the email send
// and rate limit the email sending from that user.
async function sendEmail({
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
  const { get } = await headers();
  const e2eTestingSecret = get(E2E_TESTING_SECRET_HEADER);
  const resend = getResend(e2eTestingSecret, email);

  if (process.env.NEXT_PUBLIC_TEST_ENV !== 'e2e' && email.endsWith('@example.com')) {
    logger.info('Skipping email send for e2e testing', { email });
    return;
  }

  return resend.emails.send({
    from,
    to: email,
    subject,
    react,
  });
}

// TODO: add a function to send a booking confirmation email
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
  listingId,
}: {
  hostEmail: string;
  guestName: string;
  listingTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
  listingId: string;
}) {
  try {
    const hostDashboardUrl = createListingUrl(`${listingId}/manage`);
    await sendEmail({
      email: hostEmail,
      subject: `New Booking Request: ${listingTitle}`,
      from: BOOKING_EMAIL,
      react: BookingRequestEmail({
        guest: {
          name: guestName,
          email: 'TODO',
        },
        listing: {
          title: listingTitle,
          location: 'TODO',
          checkInTime: 'TODO',
          checkOutTime: 'TODO',
          id: listingId,
        },
        checkIn,
        checkOut,
        guests,
        pricing: {
          total: totalPrice,
          currency,
          nightlyRate: 0,
          nights: 0,
          cleaningFee: 0,
          serviceFee: 0,
        },
        responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        hostDashboardUrl,
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
export async function sendWelcomeEmail(email: string, firstName: string, verificationUrl: string) {
  return sendEmail({
    email,
    from: ONBOARDING_EMAIL,
    subject: 'Welcome to the app',
    react: WelcomeEmail({ firstName, verificationUrl }),
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
  const verificationUrl = createVerificationUrl(params.verificationCode, params.to);

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

interface SendPasswordChangeEmailParams {
  name: string;
  email: string;
}

export async function sendPasswordChangeEmail({ email, name }: SendPasswordChangeEmailParams) {
  try {
    return await sendEmail({
      email,
      from: SECURITY_EMAIL,
      subject: 'Your password has been changed',
      react: PasswordChangeEmail({ name }),
    });
  } catch (error) {
    logger.error('Failed to send password change confirmation email', {
      error,
      email,
    });
    throw error;
  }
}

export async function sendBookingCancellationEmail(
  email: string,
  {
    checkIn,
    checkOut,
    user,
    listing,
  }: {
    checkIn: Date;
    checkOut: Date;
    user: {
      firstName: string;
      lastName: string;
    };
    listing: {
      title: string;
    };
  },
) {
  return sendEmail({
    email,
    from: BOOKING_EMAIL,
    subject: `Booking Cancelled - ${listing.title}`,
    react: BookingAlterationEmail({
      listingTitle: listing.title,
      startDate: checkIn,
      endDate: checkOut,
      guestName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      alterationType: 'cancelled',
    }),
  });
}
