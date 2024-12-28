import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { PasswordResetEmail } from './PasswordResetEmail';

const meta = {
  title: 'Emails/PasswordReset',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={PasswordResetEmail} props={props} />
    </Suspense>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PasswordResetEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    resetLink: 'https://apadana.app/reset-password?token=123',
  },
};
