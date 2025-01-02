import { Container, Row, Section, Text } from '@react-email/components';
import { format } from 'date-fns';
import Image from 'next/image';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';
import { EmailLayout } from '@/components/emails/EmailLayout';

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
  id: string;
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
    <EmailLayout preview={`New Booking Request for ${listing.title}`}>
      <Container className='mx-auto max-w-[600px] py-5'>
        <Text className='text-muted-foreground mb-6 text-base leading-relaxed'>
          You have received a new booking request from <strong>{guest.name}</strong> for{' '}
          <strong>{listing.title}</strong>.
          {guest.previousBookings
            ? ` They have completed ${guest.previousBookings} bookings on Apadana.`
            : ''}
        </Text>

        {/* Listing Preview */}
        {listing.image && (
          <Section className='mb-6'>
            <Image
              src={listing.image}
              alt={listing.title}
              width='600'
              height='300'
              className='rounded-lg'
            />
            <Text className='text-muted-foreground mt-2 text-sm'>{listing.location}</Text>
          </Section>
        )}

        {/* Booking Details */}
        <Section className='bg-muted mb-6 rounded-lg p-6'>
          <Text className='text-muted-foreground mb-2'>
            <strong>Check-in:</strong> {format(checkIn, 'PPP')} at {listing.checkInTime}
          </Text>
          <Text className='text-muted-foreground mb-2'>
            <strong>Check-out:</strong> {format(checkOut, 'PPP')} at {listing.checkOutTime}
          </Text>
          <Text className='text-muted-foreground'>
            <strong>Number of guests:</strong> {guests}
          </Text>
        </Section>

        {/* Price Breakdown */}
        <Section className='bg-muted rounded-lg'>
          <Row>
            <Text className='text-muted-foreground py-2 pl-6'>
              {formatPrice(pricing.nightlyRate)} × {pricing.nights} nights
            </Text>
            <Text className='text-muted-foreground py-2 pr-6 text-right font-semibold'>
              {formatPrice(pricing.nightlyRate * pricing.nights)}
            </Text>
          </Row>
          <Row>
            <Text className='text-muted-foreground py-2 pl-6'>Cleaning fee</Text>
            <Text className='text-muted-foreground py-2 pr-6 text-right font-semibold'>
              {formatPrice(pricing.cleaningFee)}
            </Text>
          </Row>
          <Row>
            <Text className='text-muted-foreground py-2 pl-6'>Service fee</Text>
            <Text className='text-muted-foreground py-2 pr-6 text-right font-semibold'>
              {formatPrice(pricing.serviceFee)}
            </Text>
          </Row>
          <Row>
            <Text className='text-muted-foreground border-border border-t py-2 pl-6 font-bold'>
              Total
            </Text>
            <Text className='text-muted-foreground border-border border-t py-2 pr-6 text-right font-bold'>
              {formatPrice(pricing.total)}
            </Text>
          </Row>
        </Section>

        {/* Guest Message */}
        {message && (
          <>
            <Text className='text-foreground mt-6 text-xl font-bold'>Guest Message:</Text>
            <Section className='bg-muted rounded-lg'>
              <Text className='text-muted-foreground p-6 text-base leading-relaxed'>{message}</Text>
            </Section>
          </>
        )}

        {/* Call to Action */}
        <Section className='flex flex-col items-center pt-10'>
          <Text className='text-muted-foreground mb-4 mt-8 text-center text-sm'>
            Please respond to this request by {format(responseDeadline, 'PPP')}
          </Text>
          <EmailCallToActionButton href={hostDashboardUrl}>
            Review Request in Dashboard
          </EmailCallToActionButton>
        </Section>
      </Container>
    </EmailLayout>
  );
};

export default BookingRequestEmail;
