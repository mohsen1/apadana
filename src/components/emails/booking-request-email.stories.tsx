import type { Meta, StoryObj } from '@storybook/react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { BookingRequestEmail } from './booking-request-email';

const meta: Meta<typeof BookingRequestEmail> = {
  title: 'Emails/BookingRequestEmail',
  render: (args) => (
    <ReactEmailStoryRenderer Component={BookingRequestEmail} props={args} />
  ),
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookingRequestEmail>;

export const Default: Story = {
  args: {
    guestName: 'John Doe',
    listingTitle: 'Luxury Beach Villa',
    checkIn: new Date('2024-07-01'),
    checkOut: new Date('2024-07-07'),
    guests: 2,
    totalPrice: 1200,
    currency: 'USD',
  },
};

export const LongStay: Story = {
  args: {
    guestName: 'Jane Smith',
    listingTitle: 'Mountain Retreat Cabin',
    checkIn: new Date('2024-08-01'),
    checkOut: new Date('2024-08-31'),
    guests: 4,
    totalPrice: 5500,
    currency: 'EUR',
  },
};

export const SingleNight: Story = {
  args: {
    guestName: 'Mike Johnson',
    listingTitle: 'City Center Apartment',
    checkIn: new Date('2024-06-15'),
    checkOut: new Date('2024-06-16'),
    guests: 1,
    totalPrice: 150,
    currency: 'GBP',
  },
};
