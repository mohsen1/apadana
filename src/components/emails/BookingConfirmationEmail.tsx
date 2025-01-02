import { Container, Section, Text } from '@react-email/components';
import { format } from 'date-fns';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';
import { EmailLayout } from '@/components/emails/EmailLayout';

import { createUrl } from '@/utils/url';

interface BookingConfirmationEmailProps {
  bookingId: string;
  listingTitle: string;
  checkIn: Date;
  checkOut: Date;
  guestName: string;
  hostName: string;
  totalPrice: number;
}

export function BookingConfirmationEmail({
  bookingId,
  listingTitle,
  checkIn,
  checkOut,
  guestName,
  hostName,
  totalPrice,
}: BookingConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Your booking at ${listingTitle} is confirmed!`}>
      <Container className='mx-auto px-4 py-8'>
        <Text className='text-muted-foreground mt-4'>Hi {guestName},</Text>
        <Text className='text-muted-foreground'>
          Your booking at {listingTitle} has been confirmed. Here are your booking details:
        </Text>

        <Section className='bg-muted mt-6 rounded-lg p-4'>
          <Text className='text-muted-foreground'>
            <strong>Booking ID:</strong> {bookingId}
          </Text>
          <Text className='text-muted-foreground'>
            <strong>Check-in:</strong> {format(checkIn, 'PPP')}
          </Text>
          <Text className='text-muted-foreground'>
            <strong>Check-out:</strong> {format(checkOut, 'PPP')}
          </Text>
          <Text className='text-muted-foreground'>
            <strong>Host:</strong> {hostName}
          </Text>
          <Text className='text-muted-foreground'>
            <strong>Total Price:</strong> ${totalPrice}
          </Text>
        </Section>

        <Text className='text-muted-foreground mt-6'>Need to contact your host? Click below:</Text>
        <EmailCallToActionButton href={createUrl(`messages/${bookingId}`)}>
          View Messages
        </EmailCallToActionButton>
      </Container>
    </EmailLayout>
  );
}
