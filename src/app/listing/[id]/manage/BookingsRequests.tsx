import { BookingRequest, User } from '@prisma/client';
import { AvatarImage } from '@radix-ui/react-avatar';
import { differenceInDays } from 'date-fns';

import { FullListing } from '@/lib/types';
import { formatCurrency, getLocale } from '@/lib/utils';

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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { getBookingRequests } from '@/app/listing/[id]/booking/action';
import { BookingRequestActions } from '@/app/listing/[id]/manage/BookingRequestActions';
import { BookingRequestStatusBadge } from '@/app/listing/[id]/manage/BookingRequestStatusBadge';
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
                  <div className='flex items-center gap-2'>
                    <Avatar>
                      <AvatarImage
                        src={bookingRequest.user.imageUrl ?? ''}
                        alt={bookingRequest.user.firstName ?? ''}
                      />
                      <AvatarFallback>
                        {bookingRequest.user.firstName?.charAt(0)}
                        {bookingRequest.user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {bookingRequest.user.firstName}{' '}
                      {bookingRequest.user.lastName}
                    </span>
                  </div>
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
                <TableCell>
                  <BookingRequestStatusBadge status={bookingRequest.status} />
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger>
                      <Button variant='link'>View</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Booking Request</DialogTitle>
                        <BookingRequestCard
                          bookingRequest={bookingRequest}
                          listing={listing}
                        />
                        <DialogFooter className='flex justify-end gap-2 pt-4'>
                          <BookingRequestActions
                            bookingRequest={bookingRequest}
                          />
                        </DialogFooter>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BookingRequestCard({
  bookingRequest,
  listing,
}: {
  bookingRequest: BookingRequest & { user: User };
  listing: FullListing;
}) {
  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className='grid grid-cols-[160px_1fr] gap-4 mt-2'>
        <div>{label}</div>
        <div>{children}</div>
      </div>
    );
  };
  return (
    <div>
      <header className='flex items-center gap-2 my-2 mb-4'>
        <Avatar>
          <AvatarImage
            src={bookingRequest.user.imageUrl ?? ''}
            alt={bookingRequest.user.firstName ?? ''}
          />
          <AvatarFallback>
            {bookingRequest.user.firstName?.charAt(0)}
            {bookingRequest.user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3>
            {bookingRequest.user.firstName} {bookingRequest.user.lastName}
          </h3>
        </div>
      </header>
      <div>
        <Row label='Sent on:'>
          {bookingRequest.createdAt.toLocaleDateString(getLocale(), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Row>
        <Row label='Property:'>
          <Button
            variant='link'
            className='p-0 text-md'
            href={`/listing/${listing.id}`}
          >
            {listing.title.trim().slice(0, 100)}
          </Button>
        </Row>
        <Row label='Check In:'>
          {bookingRequest.checkIn.toLocaleDateString()}
        </Row>
        <Row label='Check Out:'>
          {bookingRequest.checkOut.toLocaleDateString()}
        </Row>
        <Row label='Number of Guests:'>
          {bookingRequest.guests.toLocaleString()}
        </Row>
        <Row label='Status:'>
          <BookingRequestStatusBadge status={bookingRequest.status} />
        </Row>
        <Row label='Message:'>{null}</Row>
        <Textarea
          value={bookingRequest.message}
          disabled
          rows={5}
          className='cursor-text'
        />
      </div>
    </div>
  );
}
