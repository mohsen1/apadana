import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';
import * as React from 'react';

import { formatPrice } from '@/utils/format';

interface GuestProfile {
  name: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  previousBookings?: number;
}

interface ListingDetails {
  title: string;
  location: string;
  image?: string;
  amenities?: string[];
  checkInTime: string;
  checkOutTime: string;
}

interface PriceBreakdown {
  nightlyRate: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  currency: string;
}

interface BookingRequestEmailProps {
  guest: GuestProfile;
  listing: ListingDetails;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  pricing: PriceBreakdown;
  message?: string;
  responseDeadline: Date;
  hostDashboardUrl: string;
}

export const BookingRequestEmail: React.FC<Readonly<BookingRequestEmailProps>> = ({
  guest,
  listing,
  checkIn,
  checkOut,
  guests,
  pricing,
  message,
  responseDeadline,
  hostDashboardUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>New Booking Request for {listing.title}</Preview>
      <Body className='bg-gray-50 font-sans'>
        <Container className='mx-auto mb-16 max-w-[600px] rounded-lg bg-white py-5 pb-12'>
          {/* Header */}
          <Section className='border-b border-gray-200 px-10 py-8'>
            <Img
              src='https://apadana.app/logo.png'
              width='120'
              height='40'
              alt='Apadana'
              className='mx-auto'
            />
          </Section>

          {/* Main Content */}
          <Section className='p-10'>
            <Heading className='mb-6 text-2xl font-bold leading-snug text-gray-900'>
              New Booking Request
            </Heading>

            {/* Guest Info */}
            <Row className='mb-6'>
              <Column>
                {guest.avatar && (
                  <Img
                    src={guest.avatar}
                    width='48'
                    height='48'
                    alt={guest.name}
                    className='mr-3 rounded-full'
                  />
                )}
                <Text className='text-base leading-relaxed text-gray-700'>
                  You have received a new booking request from <strong>{guest.name}</strong> for{' '}
                  <strong>{listing.title}</strong>.
                  {guest.previousBookings
                    ? ` They have completed ${guest.previousBookings} bookings on Apadana.`
                    : ''}
                </Text>
              </Column>
            </Row>

            {/* Listing Preview */}
            {listing.image && (
              <Section className='mb-6'>
                <Img
                  src={listing.image}
                  alt={listing.title}
                  width='600'
                  height='300'
                  className='rounded-lg'
                />
                <Text className='mt-2 text-sm text-gray-500'>{listing.location}</Text>
              </Section>
            )}

            {/* Booking Details */}
            <Heading className='mb-4 text-xl font-bold leading-snug text-gray-900'>
              Booking Details:
            </Heading>
            <Section className='rounded-lg bg-gray-100'>
              <Row className='flex flex-col gap-4 p-6'>
                <Column>
                  <Text className='text-base leading-relaxed text-gray-700'>
                    <strong>Check-in:</strong> {format(checkIn, 'PPP')} at {listing.checkInTime}
                  </Text>
                  <Text className='text-base leading-relaxed text-gray-700'>
                    <strong>Check-out:</strong> {format(checkOut, 'PPP')} at {listing.checkOutTime}
                  </Text>
                  <Text className='text-base leading-relaxed text-gray-700'>
                    <strong>Number of guests:</strong> {guests}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Price Breakdown */}
            <Heading className='mb-4 mt-6 text-xl font-bold leading-snug text-gray-900'>
              Price Breakdown:
            </Heading>
            <Section className='rounded-lg bg-gray-100'>
              <Row>
                <Column className='py-2 pl-6'>
                  <Text className='text-base text-gray-700'>
                    {formatPrice(pricing.nightlyRate)} × {pricing.nights} nights
                  </Text>
                </Column>
                <Column className='py-2 pr-6 text-right'>
                  <Text className='text-base font-semibold text-gray-700'>
                    {formatPrice(pricing.nightlyRate * pricing.nights)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column className='py-2 pl-6'>
                  <Text className='text-base text-gray-700'>Cleaning fee</Text>
                </Column>
                <Column className='py-2 pr-6 text-right'>
                  <Text className='text-base font-semibold text-gray-700'>
                    {formatPrice(pricing.cleaningFee)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column className='py-2 pl-6'>
                  <Text className='text-base text-gray-700'>Service fee</Text>
                </Column>
                <Column className='py-2 pr-6 text-right'>
                  <Text className='text-base font-semibold text-gray-700'>
                    {formatPrice(pricing.serviceFee)}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column className='border-t border-gray-200 py-2 pl-6'>
                  <Text className='text-base font-bold text-gray-700'>Total</Text>
                </Column>
                <Column className='border-t border-gray-200 py-2 pr-6 text-right'>
                  <Text className='text-base font-bold text-gray-700'>
                    {formatPrice(pricing.total)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Guest Message */}
            {message && (
              <>
                <Heading className='mb-4 mt-6 text-xl font-bold leading-snug text-gray-900'>
                  Guest Message:
                </Heading>
                <Section className='rounded-lg bg-gray-100'>
                  <Text className='p-6 text-base leading-relaxed text-gray-700'>{message}</Text>
                </Section>
              </>
            )}

            {/* Call to Action */}
            <Section className='my-8 text-center'>
              <Text className='mb-4 text-sm text-gray-700'>
                Please respond to this request by {format(responseDeadline, 'PPP')}
              </Text>
              <Link href={hostDashboardUrl} className='block'>
                <span className='rounded-md border border-blue-900 bg-blue-400 px-6 py-3 text-base font-medium text-white'>
                  Review Request in Dashboard
                </span>
              </Link>
            </Section>

            {/* Footer */}
            <Section className='border-t border-gray-200 px-10 pt-8 text-center'>
              <Text className='mb-2 text-xs text-gray-500'>
                © {new Date().getFullYear()} Apadana. All rights reserved.
              </Text>
              <Text className='text-sm text-gray-500'>
                <Link href='https://apadana.app/terms' className='text-blue-600 hover:underline'>
                  Terms of Service
                </Link>
                {' • '}
                <Link href='https://apadana.app/privacy' className='text-blue-600 hover:underline'>
                  Privacy Policy
                </Link>
              </Text>
              <Text className='mt-2 text-sm text-gray-500'>
                <Link href='https://facebook.com/apadana' className='text-blue-600 hover:underline'>
                  Facebook
                </Link>
                {' • '}
                <Link href='https://twitter.com/apadana' className='text-blue-600 hover:underline'>
                  Twitter
                </Link>
                {' • '}
                <Link
                  href='https://instagram.com/apadana'
                  className='text-blue-600 hover:underline'
                >
                  Instagram
                </Link>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingRequestEmail;
