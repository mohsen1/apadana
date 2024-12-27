import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
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
      <Preview>Reset your Apadana password</Preview>
      <Tailwind>
        <Body className='bg-white'>
          <Container className='mx-auto py-8 px-4'>
            <Heading className='text-2xl font-bold text-gray-900'>
              Reset Your Password
            </Heading>
            <Text className='text-gray-700 mt-4'>
              We received a request to reset your password. Click the button below to choose a new password:
            </Text>
            <Link
              href={resetLink}
              className='inline-block bg-blue-600 text-white px-6 py-3 rounded-md mt-6 font-medium'
            >
              Reset Password
            </Link>
            <Text className='text-gray-600 mt-6 text-sm'>
              If you didn't request a password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
