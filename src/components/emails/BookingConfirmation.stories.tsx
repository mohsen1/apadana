import { BookingConfirmationEmail } from '@/components/emails/booking-confirmation-email'
import type { Meta, StoryObj } from '@storybook/react'


const meta = {
  title: 'Emails/BookingConfirmation',
  component: BookingConfirmationEmail,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BookingConfirmationEmail>

export default meta
type Story = StoryObj<typeof meta>

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
} 