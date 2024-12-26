import { BookingStatus } from '@prisma/client';
import { format } from 'date-fns';

import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getBookings } from '@/app/listing/[id]/manage/action';
import { formatPrice } from '@/utils/format';

function BookingsTableSkeleton() {
  return (
    <Card className='box-shadow-none border-none'>
      <CardHeader>
        <Skeleton className='h-8 w-[100px]' />
        <Skeleton className='h-4 w-[200px]' />
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function Bookings({ listingId }: { listingId: string }) {
  const loading = false; // Replace with actual loading state if needed

  if (loading) {
    return <BookingsTableSkeleton />;
  }

  const res = await getBookings({ listingId });

  if (!res?.data?.bookings) {
    return <EmptyState>Failed to load bookings. Please try again.</EmptyState>;
  }

  const { bookings } = res.data;

  if (!bookings.length) {
    return (
      <EmptyState>
        No bookings yet. When guests book your listing, they will appear here.
      </EmptyState>
    );
  }

  return (
    <Card className='box-shadow-none border-none'>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View current and past bookings</CardDescription>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='my-4 text-center'>
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className='font-mono'>{booking.id}</TableCell>
                  <TableCell>{format(booking.checkIn, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(booking.checkOut, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{booking.userId}</TableCell>
                  <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === BookingStatus.ACCEPTED
                          ? 'default'
                          : booking.status === BookingStatus.PENDING
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {booking.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
