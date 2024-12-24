import { Body, Container, Heading, Html, Link, Preview, Text } from '@react-email/components';
import clsx from 'clsx';
import * as React from 'react';

interface EarlyAccessEmailProps {
  email: string;
}

export const EarlyAccessEmail: React.FC<Readonly<EarlyAccessEmailProps>> = ({ email }) => (
  <Html>
    <Preview>Welcome to Apadana Early Access</Preview>
    <Body className='bg-background font-sans'>
      <Container className='mx-auto max-w-lg py-5 pb-12'>
        <Heading className='text-foreground text-2xl font-semibold tracking-tight'>
          Welcome to Apadana!
        </Heading>
        <Text className='text-muted-foreground mb-6 text-base leading-relaxed'>
          Thank you for signing up for early access. We've added {email} to our waitlist and we'll
          notify you as soon as we launch.
        </Text>
        <Text className='mb-6 text-base leading-relaxed text-gray-700'>
          In the meantime, follow us on Twitter to stay updated on our progress.
        </Text>
        <Link
          href='https://twitter.com/apadana_app'
          className={clsx(
            'block w-full',
            'bg-primary text-primary-foreground',
            'text-center text-base',
            'rounded px-4 py-3',
            'hover:bg-primary/90 no-underline',
          )}
        >
          Follow us on Twitter
        </Link>
      </Container>
    </Body>
  </Html>
);

export default EarlyAccessEmail;
