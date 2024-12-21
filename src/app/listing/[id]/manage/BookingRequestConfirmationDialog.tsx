'use client';

import { BookingRequest, BookingRequestStatus, User } from '@prisma/client';
import { formatRelative } from 'date-fns';
import { useState } from 'react';

import { FullListing } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { BookingRequestActions } from '@/app/listing/[id]/manage/BookingRequestActions';
import { BookingRequestStatusBadge } from '@/app/listing/[id]/manage/BookingRequestStatusBadge';

export function BookingRequestConfirmationDialog({
  bookingRequest,
  listing,
}: {
  bookingRequest: BookingRequest & { user: User };
  listing: FullListing;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {bookingRequest.status === BookingRequestStatus.PENDING ? (
        <DialogTrigger>
          <Button variant='link'>View</Button>
        </DialogTrigger>
      ) : null}
      <Button
        variant='link'
        // TODO: Update link to contact guest when chat is ready
        href={`/chat/${bookingRequest.user.id}`}
      >
        Contact Guest
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Request</DialogTitle>
          <BookingRequestCard bookingRequest={bookingRequest} listing={listing} />
          <DialogFooter className='flex justify-end gap-2 pt-4'>
            <BookingRequestActions
              bookingRequest={bookingRequest}
              onStatusChange={() => {
                setOpen(false);
              }}
            />
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function BookingRequestCard({
  bookingRequest,
  listing,
}: {
  bookingRequest: BookingRequest & { user: User };
  listing: FullListing;
}) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => {
    return (
      <div className='mt-2 grid grid-cols-[160px_1fr] gap-4'>
        <div>{label}</div>
        <div>{children}</div>
      </div>
    );
  };
  return (
    <div>
      <header className='my-2 mb-4 flex items-center gap-2'>
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
        <Row label='Sent on:'>{formatRelative(bookingRequest.createdAt, new Date(), {})}</Row>
        <Row label='Property:'>
          <Button variant='link' className='text-md p-0' href={`/listing/${listing.id}`}>
            {listing.title.trim().slice(0, 100)}
          </Button>
        </Row>
        <Row label='Check In:'>{bookingRequest.checkIn.toLocaleDateString()}</Row>
        <Row label='Check Out:'>{bookingRequest.checkOut.toLocaleDateString()}</Row>
        <Row label='Number of Guests:'>{bookingRequest.guests.toLocaleString()} guests</Row>
        <Row label='Total Price:'>
          {formatCurrency(bookingRequest.totalPrice, listing.currency)}
        </Row>
        <Row label='Status:'>
          <BookingRequestStatusBadge status={bookingRequest.status} />
        </Row>
        <Row label='Message:'>{null}</Row>
        <div className='mt-0 max-h-48 min-h-24 overflow-y-auto rounded-md border p-2'>
          {bookingRequest.message}
        </div>
      </div>
    </div>
  );
}
