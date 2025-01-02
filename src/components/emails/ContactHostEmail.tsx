import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

export interface ContactHostEmailProps {
  guestName: string;
  hostName: string;
  message: string;
  listingTitle: string;
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
      <Preview>
        New message from {guestName} about {listingTitle}
      </Preview>
      <Tailwind>
        <Body className='bg-white'>
          <Container className='mx-auto px-4 py-8'>
            <Heading className='text-2xl font-bold text-gray-900'>
              New Message About Your Listing
            </Heading>
            <Text className='mt-4 text-gray-700'>Hi {hostName},</Text>
            <Text className='text-gray-700'>
              You have received a new message from {guestName} about your listing: {listingTitle}
            </Text>

            <Section className='mt-6 rounded-lg bg-gray-50 p-4'>
              <Text className='italic text-gray-700'>"{message}"</Text>
            </Section>

            <Text className='mt-6 text-gray-700'>
              You can respond to this message through the Apadana messaging system.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
