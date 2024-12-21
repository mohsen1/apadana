import type { Meta, StoryObj } from '@storybook/react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { EarlyAccessEmail } from './early-access-email';

const meta: Meta<typeof EarlyAccessEmail> = {
  title: 'Emails/EarlyAccessEmail',
  component: EarlyAccessEmail,
  render: (args) => <ReactEmailStoryRenderer Component={EarlyAccessEmail} props={args} />,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EarlyAccessEmail>;

export const Default: Story = {
  args: {
    email: 'user@example.com',
  },
};

export const LongEmail: Story = {
  args: {
    email: 'very.long.email.address@really.long.domain.example.com',
  },
};
