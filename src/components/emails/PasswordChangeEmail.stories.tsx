import { Meta, StoryObj } from '@storybook/react/*';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { PasswordChangeEmail } from './PasswordChangeEmail';

const meta: Meta<typeof PasswordChangeEmail> = {
  title: 'Emails/PasswordChangeEmail',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={PasswordChangeEmail} props={props} />
    </Suspense>
  ),
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
