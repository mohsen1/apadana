import { Heading, Text } from '@react-email/components';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';

import { EmailLayout } from './EmailLayout';

interface WelcomeProps {
  firstName: string;
  verificationUrl: string;
}

export function Welcome({ firstName, verificationUrl }: WelcomeProps) {
  return (
    <EmailLayout preview='Welcome to Apadana - Verify Your Email'>
      <Heading className='text-2xl font-bold text-gray-900'>
        Welcome to Apadana, {firstName}!
      </Heading>
      <Text className='mt-4 text-gray-700'>
        We're excited to have you join our community. To get started, please verify your email
        address by clicking the button below.
      </Text>
      <EmailCallToActionButton href={verificationUrl}>Verify Email Address</EmailCallToActionButton>
      <Text className='mt-6 text-sm text-gray-600'>
        If you didn't create an account on Apadana, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
