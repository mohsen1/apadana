import { Currency } from '@prisma/client';
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

import { formatCurrency, formatHHMMDate, getLocale } from '@/lib/utils';

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
    <Body className='bg-background font-sans'>
      <Container className='mx-auto max-w-lg py-5 pb-12'>
        <Heading className='text-foreground my-10 text-2xl font-bold'>New Booking Request</Heading>
        <Text className='text-foreground my-3 text-base leading-6'>
          You have received a new booking request from {guestName} for {listingTitle}.
        </Text>

        <Heading as='h2' className='text-foreground mb-4 mt-6 text-xl font-bold'>
          Booking Details:
        </Heading>
        <Section className='bg-muted my-4 rounded p-4'>
          <Text className='text-muted-foreground my-3 text-base leading-6'>
            Check-in: {formatHHMMDate(checkIn.toLocaleTimeString(getLocale()))}
          </Text>
          <Text className='text-muted-foreground my-3 text-base leading-6'>
            Check-out: {formatHHMMDate(checkOut.toLocaleTimeString(getLocale()))}
          </Text>
          <Text className='text-muted-foreground my-3 text-base leading-6'>
            Number of guests: {guests}
          </Text>
        </Section>
        <Text className='text-muted-foreground my-3 text-base leading-6'>
          Total price: {formatCurrency(totalPrice, currency.toUpperCase() as Currency)}
        </Text>
        <Text className='text-muted-foreground my-3 text-base leading-6'>
          Please review and respond to this request in your{' '}
          <Link
            href='https://apadana.app/listing'
            className='text-primary hover:text-primary/90 underline'
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
