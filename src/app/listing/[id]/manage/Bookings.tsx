import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getBookings } from '@/app/listing/[id]/manage/action';

export async function Bookings({ listingId }: { listingId: string }) {
  const res = await getBookings({ listingId });
  const result = res?.data;

  if (!result?.bookings) {
    throw new Error('Failed to get bookings');
  }

  const bookings = result.bookings;

  if (!bookings?.length) {
    return <div>No bookings found</div>;
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
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{format(booking.checkIn, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(booking.checkOut, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{booking.userId}</TableCell>
                  <TableCell>{booking.totalPrice}</TableCell>
                  <TableCell>{booking.bookingRequestId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
