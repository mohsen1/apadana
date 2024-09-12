import { BookingRequest } from '@prisma/client';
import { AvatarImage } from '@radix-ui/react-avatar';
import { differenceInDays } from 'date-fns';

import { FullListing } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getBookingRequests } from '@/app/listing/[id]/booking/action';
import NotFound from '@/app/not-found';

export async function BookingRequests({ listing }: { listing: FullListing }) {
  const res = await getBookingRequests({
    listingId: listing.id,
    include: {
      user: true,
    },
  });

  if (!res?.data?.success) {
    throw new Error(res?.data?.error || 'Failed to fetch booking requests');
  }

  const bookingRequests = res.data.data;

  if (!bookingRequests) {
    return <NotFound title='No bookings found' />;
  }

  const numberOfNights = (bookingRequest: BookingRequest) => {
    return differenceInDays(bookingRequest.checkOut, bookingRequest.checkIn);
  };

  return (
    <Card className='box-shadow-none border-none'>
      <CardHeader>
        <CardTitle>Booking Requests</CardTitle>
        <CardDescription>
          View current and past booking requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingRequests.map((bookingRequest) => (
              <TableRow key={bookingRequest.id}>
                <TableCell>
                  <Avatar>
                    <AvatarFallback>
                      <AvatarImage
                        src={bookingRequest.user.imageUrl ?? ''}
                        alt={bookingRequest.user.firstName ?? ''}
                      />
                      {bookingRequest.user.firstName?.charAt(0)}
                      {bookingRequest.user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {bookingRequest.user.firstName}{' '}
                    {bookingRequest.user.lastName}
                  </span>
                </TableCell>
                <TableCell>
                  {bookingRequest.checkIn.toLocaleDateString()}
                  <div className='text-muted-foreground'>
                    Arriving in{' '}
                    {differenceInDays(bookingRequest.checkIn, new Date()) + 1}{' '}
                    days
                  </div>
                </TableCell>
                <TableCell>
                  {bookingRequest.checkOut.toLocaleDateString()}
                </TableCell>
                <TableCell>{bookingRequest.guests}</TableCell>
                <TableCell>
                  {formatCurrency(
                    listing.pricePerNight * numberOfNights(bookingRequest),
                    listing.currency,
                  )}
                </TableCell>
                <TableCell>{bookingRequest.status}</TableCell>
                <TableCell>
                  <Button
                    variant='link'
                    href={`/listing/${listing.id}/booking/${bookingRequest.id}`}
                  >
                    View
                  </Button>
                  <Button variant='link' size='sm' className='text-destructive'>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
