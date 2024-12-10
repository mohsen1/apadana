import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';

interface BookingAlterationEmailProps {
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  guestName: string;
  alterationType: 'cancelled' | 'modified';
  previousStartDate?: Date;
  previousEndDate?: Date;
}

export default function BookingAlterationEmail({
  listingTitle,
  startDate,
  endDate,
  guestName,
  alterationType,
  previousStartDate,
  previousEndDate,
}: BookingAlterationEmailProps) {
  const formatDate = (date: Date) => format(date, 'PPP');

  return (
    <Html>
      <Head />
      <Preview>
        Your booking for {listingTitle} has been {alterationType}
      </Preview>
      <Body style={{ fontFamily: 'system-ui' }}>
        <Container>
          <Heading>
            Booking {alterationType} for {listingTitle}
          </Heading>
          <Text>Dear {guestName},</Text>

          {alterationType === 'cancelled' ? (
            <Text>
              Your booking for {listingTitle} from {formatDate(startDate)} to{' '}
              {formatDate(endDate)} has been cancelled.
            </Text>
          ) : (
            <>
              <Text>Your booking for {listingTitle} has been modified.</Text>
              <Text>
                Previous dates: {formatDate(previousStartDate!)} to{' '}
                {formatDate(previousEndDate!)}
              </Text>
              <Text>
                New dates: {formatDate(startDate)} to {formatDate(endDate)}
              </Text>
            </>
          )}

          <Text>
            If you have any questions, please contact support@apadana.app
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
