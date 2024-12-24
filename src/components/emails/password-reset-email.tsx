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
        <Body className='bg-background mx-auto my-12 font-sans'>
          <Container className='border-border mx-auto max-w-md rounded-lg border p-10'>
            <Section>
              <Text className='text-foreground text-2xl font-bold'>Reset Your Password</Text>
              <Text className='text-muted-foreground'>
                Someone requested a password reset for your account. If this wasn't you, you can
                safely ignore this email.
              </Text>
              <Button
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium'
                href={resetLink}
              >
                Reset Password
              </Button>
              <Text className='text-muted-foreground mt-4 text-sm'>
                This link will expire in 1 hour for security reasons.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
