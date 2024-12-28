import type { Meta, StoryObj } from '@storybook/react';
import { addDays, addHours } from 'date-fns';
import { Suspense } from 'react';

import { AVATAR1, LISTING_PHOTO1 } from '@/components/emails/constants';
import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { BookingRequestEmail } from './BookingRequestEmail';

const meta: Meta<typeof BookingRequestEmail> = {
  title: 'Emails/BookingRequestEmail',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={BookingRequestEmail} props={props} />
    </Suspense>
  ),
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingRequestEmail>;

const baseDate = new Date();

export const Default: Story = {
  name: 'Default',
  args: {
    guest: {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: AVATAR1,
      previousBookings: 3,
    },
    listing: {
      id: '123',
      title: 'Luxury Beach Villa',
      location: 'Malibu, California',
      image: LISTING_PHOTO1,
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      amenities: ['Pool', 'Ocean View', 'WiFi'],
    },
    checkIn: addDays(baseDate, 30),
    checkOut: addDays(baseDate, 37),
    guests: 2,
    pricing: {
      nightlyRate: 200,
      nights: 7,
      cleaningFee: 100,
      serviceFee: 150,
      total: 1650,
      currency: 'USD',
    },
    message:
      "Hi, I'm looking forward to staying at your beautiful property. We're coming to celebrate our anniversary and would love to know if you offer any special arrangements for such occasions.",
    responseDeadline: addHours(baseDate, 24),
    hostDashboardUrl: 'https://apadana.app/host/requests/123',
  },
};

export const NoMessage: Story = {
  name: 'No Message',
  args: {
    ...Default.args,
    message: undefined,
  },
};

export const FirstTimeGuest: Story = {
  name: 'First Time Guest',
  args: {
    ...Default.args,
    guest: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      previousBookings: 0,
    },
  },
};
