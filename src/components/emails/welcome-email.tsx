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
        <Body className='bg-white my-12 mx-auto font-sans'>
          <Container className='p-8 rounded-lg shadow-lg bg-white max-w-[600px]'>
            <Heading className='text-2xl font-bold text-gray-900 mb-4'>
              Welcome to Apadana, {name}!
            </Heading>

            <Section className='my-8'>
              <Text className='text-gray-700 mb-4'>
                Thank you for creating an account with Apadana. We're excited to
                have you on board!
              </Text>

              <Text className='text-gray-700 mb-4'>With Apadana, you can:</Text>

              <ul className='list-disc pl-6 mb-4 text-gray-700'>
                <li>Manage your bookings efficiently</li>
                <li>Track your appointments in real-time</li>
                <li>Access detailed analytics and insights</li>
                <li>Connect with your clients seamlessly</li>
              </ul>

              <Text className='text-gray-700 mb-6'>
                To get started, simply click the button below to log in to your
                account:
              </Text>

              <Link
                href={loginUrl}
                className='bg-blue-600 text-white px-6 py-3 rounded-md font-medium inline-block hover:bg-blue-700'
              >
                Log In to Your Account
              </Link>
            </Section>

            <Text className='text-gray-600 text-sm mt-8'>
              If you have any questions or need assistance, please don't
              hesitate to contact our support team at{' '}
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
