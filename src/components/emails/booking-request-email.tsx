import {
  Body,
  Container,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingRequestEmailProps {
  guestName: string;
  listingTitle: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  currency: string;
}

export const BookingRequestEmail: React.FC<Readonly<BookingRequestEmailProps>> = ({
  guestName,
  listingTitle,
  checkIn,
  checkOut,
  guests,
  totalPrice,
  currency,
}) => (
  <Html>
    <Preview>New Booking Request for {listingTitle}</Preview>
    <Body className='bg-white font-sans'>
      <Container className='mx-auto max-w-lg py-5 pb-12'>
        <Heading className='my-10 text-2xl font-bold text-gray-700'>New Booking Request</Heading>
        <Text className='text-foreground my-3 text-base leading-6'>
          You have received a new booking request from {guestName} for {listingTitle}.
        </Text>

        <Heading as='h2' className='text-foreground mb-4 mt-6 text-xl font-bold'>
          Booking Details:
        </Heading>
        <Section className='bg-muted my-4 rounded p-4'>
          <Text className='my-3 text-base leading-6 text-gray-700'>
            Check-in: {checkIn.toLocaleDateString()}
          </Text>
          <Text className='my-3 text-base leading-6 text-gray-700'>
            Check-out: {checkOut.toLocaleDateString()}
          </Text>
          <Text className='my-3 text-base leading-6 text-gray-700'>Number of guests: {guests}</Text>
          <Text className='my-3 text-base leading-6 text-gray-700'>
            Total price: {totalPrice} {currency}
          </Text>
        </Section>

        <Text className='my-3 text-base leading-6 text-gray-700'>
          Please review and respond to this request in your{' '}
          <Link href='https://apadana.app/listing' className='text-blue-600 underline'>
            host dashboard
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingRequestEmail;
