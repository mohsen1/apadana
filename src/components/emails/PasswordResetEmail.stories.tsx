import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { PasswordResetEmail } from './PasswordResetEmail';

const meta: Meta<typeof PasswordResetEmail> = {
  title: 'Emails/PasswordResetEmail',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={PasswordResetEmail} props={props} />
    </Suspense>
  ),
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
