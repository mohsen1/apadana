import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { BookingConfirmationEmail } from '@/components/emails/BookingConfirmationEmail';
import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

const meta: Meta<typeof BookingConfirmationEmail> = {
  title: 'Emails/BookingConfirmation',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={BookingConfirmationEmail} props={props} />
    </Suspense>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BookingConfirmationEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    bookingId: 'booking_123',
    listingTitle: 'Cozy Downtown Apartment',
    checkIn: new Date('2024-04-01'),
    checkOut: new Date('2024-04-05'),
    guestName: 'John Doe',
    hostName: 'Jane Smith',
    totalPrice: 500,
  },
};
