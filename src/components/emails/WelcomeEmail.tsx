import { Heading, Text } from '@react-email/components';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';

import { EmailLayout } from './EmailLayout';

interface WelcomeEmailProps {
  firstName: string;
  verificationUrl: string;
}

export function WelcomeEmail({ firstName, verificationUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview='Welcome to Apadana - Verify Your Email'>
      <Heading className='text-foreground text-2xl font-bold'>
        Welcome to Apadana, {firstName}!
      </Heading>
      <Text className='text-muted-foreground mt-4'>
        We're excited to have you join our community. To get started, please verify your email
        address by clicking the button below.
      </Text>
      <EmailCallToActionButton href={verificationUrl}>Verify Email Address</EmailCallToActionButton>
      <Text className='text-muted-foreground mt-6 text-sm'>
        If you didn't create an account on Apadana, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
