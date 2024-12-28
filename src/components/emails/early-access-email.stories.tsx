import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { EarlyAccessEmail } from './early-access-email';
import { ReactEmailStoryRenderer } from './ReactEmailStoryRenderer';

const meta: Meta<typeof EarlyAccessEmail> = {
  title: 'Emails/EarlyAccessEmail',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={EarlyAccessEmail} props={props} />
    </Suspense>
  ),
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
