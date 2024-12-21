import type { Meta, StoryObj } from '@storybook/react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { PasswordResetEmail } from './password-reset-email';

const meta: Meta<typeof PasswordResetEmail> = {
  title: 'Emails/PasswordResetEmail',
  render: (args) => <ReactEmailStoryRenderer Component={PasswordResetEmail} props={args} />,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PasswordResetEmail>;

export const Default: Story = {
  args: {
    resetLink: 'https://apadana.app/reset-password?token=example-token',
  },
};

export const LongLink: Story = {
  args: {
    resetLink:
      'https://apadana.app/reset-password?token=very-long-token-string-for-testing-overflow-behavior-12345',
  },
};
