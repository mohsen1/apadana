import { Container, Text } from '@react-email/components';
import { format } from 'date-fns';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';
import { EmailLayout } from '@/components/emails/EmailLayout';

interface BookingAlterationEmailProps {
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  guestName: string;
  alterationType: 'cancelled' | 'modified';
  previousStartDate?: Date;
  previousEndDate?: Date;
}

export function BookingAlterationEmail({
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
    <EmailLayout preview={`Your booking for ${listingTitle} has been ${alterationType}`}>
      <Container>
        <Text className='text-muted-foreground'>Dear {guestName},</Text>

        {alterationType === 'cancelled' ? (
          <Text className='text-muted-foreground'>
            Your booking for {listingTitle} from {formatDate(startDate)} to {formatDate(endDate)}{' '}
            has been cancelled.
          </Text>
        ) : (
          <>
            <Text className='text-muted-foreground'>
              Your booking for {listingTitle} has been modified.
            </Text>
            {previousStartDate && previousEndDate && (
              <Text className='text-muted-foreground'>
                Previous dates: {formatDate(previousStartDate)} to {formatDate(previousEndDate)}
              </Text>
            )}
            <Text className='text-muted-foreground'>
              New dates: {formatDate(startDate)} to {formatDate(endDate)}
            </Text>
          </>
        )}

        <Text className='text-muted-foreground'>If you have any questions, please contact us:</Text>
        <EmailCallToActionButton href='mailto:support@apadana.app'>
          Contact Support
        </EmailCallToActionButton>
      </Container>
    </EmailLayout>
  );
}
