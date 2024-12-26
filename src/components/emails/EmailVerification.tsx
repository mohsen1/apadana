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

interface EmailVerificationProps {
  verificationUrl: string;
  emailAddress: string;
}

export default function EmailVerification({
  verificationUrl,
  emailAddress,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Apadana</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ padding: '40px 0', textAlign: 'center' }}>
          <Section>
            <Text>Please verify your email address</Text>
            <Text>Click the button below to verify {emailAddress}</Text>
            <Button
              href={verificationUrl}
              style={{
                backgroundColor: '#000',
                borderRadius: '6px',
                color: '#fff',
                padding: '12px 24px',
                textDecoration: 'none',
                textTransform: 'none',
                margin: '16px 0',
              }}
            >
              Verify Email Address
            </Button>
            <Text style={{ color: '#666', fontSize: '14px' }}>
              If you didn't request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
