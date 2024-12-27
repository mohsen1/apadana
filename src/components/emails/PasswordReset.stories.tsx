import type { Meta, StoryObj } from '@storybook/react'
import { PasswordResetEmail } from './password-reset-email'

const meta = {
  title: 'Emails/PasswordReset',
  component: PasswordResetEmail,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PasswordResetEmail>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    resetLink: 'https://apadana.app/reset-password?token=123',
  },
} 