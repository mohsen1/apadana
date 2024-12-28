import type { Meta, StoryObj } from '@storybook/react';
import { Suspense } from 'react';

import { ContactHostEmail, ContactHostEmailProps } from '@/components/emails/contact-host-email';
import { ReactEmailStoryRenderer } from '@/components/emails/ReactEmailStoryRenderer';

const meta = {
  title: 'Emails/ContactHost',
  component: (props: ContactHostEmailProps) => (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactEmailStoryRenderer Component={ContactHostEmail} props={props} />
    </Suspense>
  ),

  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ContactHostEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    guestName: 'John Doe',
    hostName: 'Jane Smith',
    message: 'Hi, I have a question about your listing...',
    listingTitle: 'Cozy Downtown Apartment',
  },
};
