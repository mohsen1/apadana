import { Body, Container, Heading, Html, Link, Preview, Text } from '@react-email/components';
import clsx from 'clsx';
import * as React from 'react';

interface EarlyAccessEmailProps {
  email: string;
}

export const EarlyAccessEmail: React.FC<Readonly<EarlyAccessEmailProps>> = ({ email }) => (
  <Html>
    <Preview>Welcome to Apadana Early Access</Preview>
    <Body className='bg-white font-sans'>
      <Container className='mx-auto py-5 pb-12 max-w-lg'>
        <Heading className='text-2xl font-semibold text-black tracking-tight'>
          Welcome to Apadana!
        </Heading>
        <Text className='text-base leading-relaxed text-gray-700 mb-6'>
          Thank you for signing up for early access. We've added {email} to our waitlist and we'll
          notify you as soon as we launch.
        </Text>
        <Text className='text-base leading-relaxed text-gray-700 mb-6'>
          In the meantime, follow us on Twitter to stay updated on our progress.
        </Text>
        <Link
          href='https://twitter.com/apadana_app'
          className={clsx(
            'block w-full',
            'bg-black text-white',
            'text-base text-center',
            'py-3 px-4 rounded',
            'no-underline',
          )}
        >
          Follow us on Twitter
        </Link>
      </Container>
    </Body>
  </Html>
);

export default EarlyAccessEmail;
