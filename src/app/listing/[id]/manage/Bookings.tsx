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

export function Bookings() {
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
            <TableRow>
              <TableCell>001</TableCell>
              <TableCell>2024-09-15</TableCell>
              <TableCell>2024-09-20</TableCell>
              <TableCell>John Doe</TableCell>
              <TableCell>$500</TableCell>
              <TableCell>Upcoming</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>002</TableCell>
              <TableCell>2024-08-01</TableCell>
              <TableCell>2024-08-05</TableCell>
              <TableCell>Jane Smith</TableCell>
              <TableCell>$400</TableCell>
              <TableCell>Completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
