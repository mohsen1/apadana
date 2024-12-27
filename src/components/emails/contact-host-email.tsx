import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

interface ContactHostEmailProps {
  guestName: string
  hostName: string
  message: string
  listingTitle: string
}

export function ContactHostEmail({
  guestName,
  hostName,
  message,
  listingTitle,
}: ContactHostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {guestName} about {listingTitle}</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold text-gray-900">
              New Message About Your Listing
            </Heading>
            <Text className="text-gray-700 mt-4">
              Hi {hostName},
            </Text>
            <Text className="text-gray-700">
              You have received a new message from {guestName} about your listing: {listingTitle}
            </Text>
            
            <Section className="mt-6 bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-700 italic">
                "{message}"
              </Text>
            </Section>

            <Text className="text-gray-700 mt-6">
              You can respond to this message through the Apadana messaging system.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 