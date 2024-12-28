import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

import { Welcome } from './Welcome';

const meta = {
  title: 'Emails/Welcome',
  component: (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={Welcome} props={props} />
    </Suspense>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Welcome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    firstName: 'John',
    verificationUrl: 'https://apadana.app/verify?token=123',
  },
};
