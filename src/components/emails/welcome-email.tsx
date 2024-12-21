import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface WelcomeEmailProps {
  name: string;
  loginUrl?: string;
}

export default function WelcomeEmail({
  name,
  loginUrl = 'https://apadana.app/login',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Apadana - Let's get started!</Preview>
      <Tailwind>
        <Body className='mx-auto my-12 bg-white font-sans'>
          <Container className='max-w-[600px] rounded-lg bg-white p-8 shadow-lg'>
            <Heading className='mb-4 text-2xl font-bold text-gray-900'>
              Welcome to Apadana, {name}!
            </Heading>

            <Section className='my-8'>
              <Text className='mb-4 text-gray-700'>
                Thank you for creating an account with Apadana. We're excited to have you on board!
              </Text>

              <Text className='mb-4 text-gray-700'>With Apadana, you can:</Text>

              <ul className='mb-4 list-disc pl-6 text-gray-700'>
                <li>Manage your bookings efficiently</li>
                <li>Track your appointments in real-time</li>
                <li>Access detailed analytics and insights</li>
                <li>Connect with your clients seamlessly</li>
              </ul>

              <Text className='mb-6 text-gray-700'>
                To get started, simply click the button below to log in to your account:
              </Text>

              <Link
                href={loginUrl}
                className='inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700'
              >
                Log In to Your Account
              </Link>
            </Section>

            <Text className='mt-8 text-sm text-gray-600'>
              If you have any questions or need assistance, please don't hesitate to contact our
              support team at{' '}
              <Link href='mailto:support@apadana.app' className='text-blue-600'>
                support@apadana.app
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
