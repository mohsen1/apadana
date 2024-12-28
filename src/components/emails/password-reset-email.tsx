import { Body, Container, Head, Heading, Html, Link, Preview, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface PasswordResetEmailProps {
  resetLink: string;
}

export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Apadana password</Preview>
      <Tailwind>
        <Body className='bg-white'>
          <Container className='mx-auto px-4 py-8'>
            <Heading className='text-2xl font-bold text-gray-900'>Reset Your Password</Heading>
            <Text className='mt-4 text-gray-700'>
              We received a request to reset your password. Click the button below to choose a new
              password:
            </Text>
            <Link
              href={resetLink}
              className='mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white'
            >
              Reset Password
            </Link>
            <Text className='mt-6 text-sm text-gray-600'>
              If you didn't request a password reset, you can safely ignore this email. Your
              password will remain unchanged.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
