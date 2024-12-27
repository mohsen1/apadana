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
import { format } from 'date-fns'

interface BookingConfirmationEmailProps {
  bookingId: string
  listingTitle: string
  checkIn: Date
  checkOut: Date
  guestName: string
  hostName: string
  totalPrice: number
}

export function BookingConfirmationEmail({
  bookingId,
  listingTitle,
  checkIn,
  checkOut,
  guestName,
  hostName,
  totalPrice,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your booking at {listingTitle} is confirmed!</Preview>
      <Tailwind>
        <Body className="bg-white">
          <Container className="mx-auto py-8 px-4">
            <Heading className="text-2xl font-bold text-gray-900">
              Booking Confirmed!
            </Heading>
            <Text className="text-gray-700 mt-4">
              Hi {guestName},
            </Text>
            <Text className="text-gray-700">
              Your booking at {listingTitle} has been confirmed. Here are your booking details:
            </Text>
            
            <Section className="mt-6 bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-700">
                <strong>Booking ID:</strong> {bookingId}
              </Text>
              <Text className="text-gray-700">
                <strong>Check-in:</strong> {format(checkIn, 'PPP')}
              </Text>
              <Text className="text-gray-700">
                <strong>Check-out:</strong> {format(checkOut, 'PPP')}
              </Text>
              <Text className="text-gray-700">
                <strong>Host:</strong> {hostName}
              </Text>
              <Text className="text-gray-700">
                <strong>Total Price:</strong> ${totalPrice}
              </Text>
            </Section>

            <Text className="text-gray-700 mt-6">
              We hope you enjoy your stay! If you need to contact your host, you can do so through the Apadana messaging system.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
} 