import { Container, Text } from '@react-email/components';
import * as React from 'react';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';
import { EmailLayout } from '@/components/emails/EmailLayout';

interface EarlyAccessEmailProps {
  email: string;
}

export const EarlyAccessEmail: React.FC<Readonly<EarlyAccessEmailProps>> = ({ email }) => (
  <EmailLayout preview='Welcome to Apadana Early Access'>
    <Container className='mx-auto max-w-lg py-5 pb-12'>
      <Text className='text-foreground mb-6 text-base leading-relaxed'>
        Thank you for signing up for early access. We've added {email} to our waitlist and we'll
        notify you as soon as we launch.
      </Text>
      <Text className='text-foreground mb-4 mt-8 text-base leading-relaxed'>
        We are working hard to bring you the best experience possible. We'll be in touch soon.
      </Text>
      <Text className='text-foreground mb-6 text-base leading-relaxed'>
        In the meantime, follow us on Twitter to stay updated on our progress.
      </Text>
    </Container>
    <Container className='mb-20 pt-10 text-center'>
      <EmailCallToActionButton href='https://twitter.com/apadana_app'>
        Follow us on Twitter
      </EmailCallToActionButton>
    </Container>
  </EmailLayout>
);

export default EarlyAccessEmail;
