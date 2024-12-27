import { ContactHostEmail } from '@/components/emails/contact-host-email'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Emails/ContactHost',
  component: ContactHostEmail,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ContactHostEmail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    guestName: 'John Doe',
    hostName: 'Jane Smith',
    message: 'Hi, I have a question about your listing...',
    listingTitle: 'Cozy Downtown Apartment',
  },
} 