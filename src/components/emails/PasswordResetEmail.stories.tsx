import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { createPasswordResetUrl } from '@/utils/url';

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
  name: 'Default',
  args: {
    resetLink: createPasswordResetUrl('example-token', 'user@example.com'),
  },
};

export const LongToken: Story = {
  name: 'Long Token',
  args: {
    resetLink: createPasswordResetUrl(
      'very-long-token-string-for-testing-overflow-behavior-12345',
      'user@example.com',
    ),
  },
};
