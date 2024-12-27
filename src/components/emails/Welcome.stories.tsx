import { Welcome } from '@/components/emails/Welcome'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Emails/Welcome',
  component: Welcome,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Welcome>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    firstName: 'John',
    verificationUrl: 'https://apadana.app/verify?token=123',
  },
} 