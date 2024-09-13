import { Booking } from '@prisma/client';

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

export function Bookings({ bookings }: { bookings: Booking[] }) {
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
                <TableCell colSpan={6} className='text-center my-4'>
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>{booking.userId}</TableCell>
                  <TableCell>{booking.totalPrice}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
