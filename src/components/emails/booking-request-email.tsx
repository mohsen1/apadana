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

export const BookingRequestEmail: React.FC<
  Readonly<BookingRequestEmailProps>
> = ({
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
      <Container className='mx-auto py-5 pb-12 max-w-lg'>
        <Heading className='text-2xl font-bold text-gray-700 my-10'>
          New Booking Request
        </Heading>
        <Text className='text-base text-gray-700 leading-6 my-3'>
          You have received a new booking request from {guestName} for{' '}
          {listingTitle}.
        </Text>

        <Heading as='h2' className='text-xl font-bold text-gray-700 mt-6 mb-4'>
          Booking Details:
        </Heading>
        <Section className='my-4 p-4 bg-gray-50 rounded'>
          <Text className='text-base text-gray-700 leading-6 my-3'>
            Check-in: {checkIn.toLocaleDateString()}
          </Text>
          <Text className='text-base text-gray-700 leading-6 my-3'>
            Check-out: {checkOut.toLocaleDateString()}
          </Text>
          <Text className='text-base text-gray-700 leading-6 my-3'>
            Number of guests: {guests}
          </Text>
          <Text className='text-base text-gray-700 leading-6 my-3'>
            Total price: {totalPrice} {currency}
          </Text>
        </Section>

        <Text className='text-base text-gray-700 leading-6 my-3'>
          Please review and respond to this request in your{' '}
          <Link
            href='https://apadana.app/listing'
            className='text-blue-600 underline'
          >
            host dashboard
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingRequestEmail;
