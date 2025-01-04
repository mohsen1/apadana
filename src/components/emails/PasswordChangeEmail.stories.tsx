import { Meta, StoryObj } from '@storybook/react';

import { PasswordChangeEmail } from './PasswordChangeEmail';

const meta: Meta<typeof PasswordChangeEmail> = {
  title: 'Emails/PasswordChangeEmail',
  component: PasswordChangeEmail,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordChangeEmail>;

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};
