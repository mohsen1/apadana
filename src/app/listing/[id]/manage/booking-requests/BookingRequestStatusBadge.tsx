import { BookingRequestStatus } from '@prisma/client';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

export function BookingRequestStatusBadge({ status }: { status: BookingRequestStatus }) {
  return (
    <Badge
      variant='outline'
      className={cn('px-4 py-1', {
        'bg-destructive text-destructive-foreground': status === 'REJECTED',
        'bg-green-500': status === 'ACCEPTED',
        'bg-primary/60 text-primary-foreground': status === 'PENDING',
      })}
    >
      {status}
    </Badge>
  );
}
