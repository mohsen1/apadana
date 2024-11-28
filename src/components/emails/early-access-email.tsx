import {
  Body,
  Container,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EarlyAccessEmailProps {
  email: string;
}

export const EarlyAccessEmail: React.FC<Readonly<EarlyAccessEmailProps>> = ({
  email,
}) => (
  <Html>
    <Preview>Welcome to Apadana Early Access</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Apadana!</Heading>
        <Text style={text}>
          Thank you for signing up for early access. We've added {email} to our
          waitlist and we'll notify you as soon as we launch.
        </Text>
        <Text style={text}>
          In the meantime, follow us on Twitter to stay updated on our progress.
        </Text>
        <Link href='https://twitter.com/apadana_app' style={button}>
          Follow us on Twitter
        </Link>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#000',
  letterSpacing: '-0.5px',
};

const text = {
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#333',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#000',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

export default EarlyAccessEmail;
