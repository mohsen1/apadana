import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface WelcomeProps {
  firstName: string
  verificationUrl: string
}

export function Welcome({ firstName, verificationUrl }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Apadana - Verify Your Email</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold text-gray-900">
              Welcome to Apadana, {firstName}!
            </Heading>
            <Text className="text-gray-700 mt-4">
              We're excited to have you join our community. To get started, please verify your email address by clicking the button below.
            </Text>
            <Link
              href={verificationUrl}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md mt-6 font-medium"
            >
              Verify Email Address
            </Link>
            <Text className="text-gray-600 mt-6 text-sm">
              If you didn't create an account on Apadana, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 