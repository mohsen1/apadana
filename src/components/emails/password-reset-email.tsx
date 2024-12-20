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
        <Body className='bg-white my-12 mx-auto font-sans'>
          <Container className='border border-solid border-gray-200 rounded-lg p-10 max-w-md mx-auto'>
            <Section>
              <Text className='text-2xl font-bold text-gray-900'>
                Reset Your Password
              </Text>
              <Text className='text-gray-600'>
                Someone requested a password reset for your account. If this
                wasn't you, you can safely ignore this email.
              </Text>
              <Button
                className='bg-blue-600 text-white px-6 py-3 rounded-md font-medium'
                href={resetLink}
              >
                Reset Password
              </Button>
              <Text className='text-sm text-gray-500 mt-4'>
                This link will expire in 1 hour for security reasons.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
