import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface PasswordResetEmailProps {
  resetLink: string;
}

export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className='mx-auto my-12 bg-white p-4 font-sans'>
          <Container className='mx-auto max-w-md rounded-lg border border-solid border-gray-200 p-10'>
            <Section>
              <Text className='text-2xl font-bold text-gray-900'>Reset Your Password</Text>
              <Text className='text-gray-600'>
                Someone requested a password reset for your account. If this wasn't you, you can
                safely ignore this email.
              </Text>
              <Button
                className='rounded-md bg-blue-600 px-6 py-3 font-medium text-white'
                href={resetLink}
              >
                Reset Password
              </Button>
              <Text className='mt-4 text-sm text-gray-500'>
                This link will expire in 1 hour for security reasons.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
