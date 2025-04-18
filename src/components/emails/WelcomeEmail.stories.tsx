import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { createVerificationUrl } from '@/utils/url';

import { WelcomeEmail } from './WelcomeEmail';

const meta = {
  title: 'Emails/Welcome',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={WelcomeEmail} props={props} />
    </Suspense>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WelcomeEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    firstName: 'John',
    verificationUrl: createVerificationUrl('123', 'john@example.com'),
  },
};
