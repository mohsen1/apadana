import { Container, Text } from '@react-email/components';

import { EmailCallToActionButton } from '@/components/emails/EmailCallToActionButton';
import { EmailLayout } from '@/components/emails/EmailLayout';

interface PasswordResetEmailProps {
  resetLink: string;
}

export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <EmailLayout preview='Reset your Apadana password'>
      <Container className='mx-auto px-4 py-8'>
        <Text className='text-muted-foreground mt-4'>
          We received a request to reset your password. Click the button below to choose a new
          password:
        </Text>
        <EmailCallToActionButton href={resetLink}>Reset Password</EmailCallToActionButton>
        <Text className='text-muted-foreground mt-6 text-sm'>
          If you didn't request a password reset, you can safely ignore this email. Your password
          will remain unchanged.
        </Text>
      </Container>
    </EmailLayout>
  );
}
