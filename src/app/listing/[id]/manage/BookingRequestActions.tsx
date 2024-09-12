'use client';
import { BookingRequest } from '@prisma/client';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';

import { Button } from '@/components/ui/button';

import { changeBookingRequestStatus } from '@/app/listing/[id]/manage/action';

type BookingRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export function BookingRequestActions({
  bookingRequest,
}: {
  bookingRequest: BookingRequest;
}) {
  const router = useRouter();
  const { execute, status, input } = useAction(changeBookingRequestStatus, {
    onSuccess: () => {
      router.refresh();
    },
  });

  function getHandler(status: BookingRequestStatus) {
    return () => {
      execute({ bookingRequestId: String(bookingRequest.id), status });
    };
  }
  return (
    <div className='inline-flex gap-2'>
      <Button
        variant='link'
        className='text-destructive'
        onClick={getHandler('REJECTED')}
      >
        {status === 'executing' && input?.status === 'REJECTED' ? (
          <>
            <Loader2 className='mr-2' />
            <span>Saving</span>
          </>
        ) : (
          <>
            <X className='mr-2' />
            <span>Reject</span>
          </>
        )}
      </Button>
      <Button variant='link' onClick={getHandler('ACCEPTED')}>
        {status === 'executing' && input?.status === 'ACCEPTED' ? (
          <>
            <Loader2 className='mr-2' />
            <span>Saving</span>
          </>
        ) : (
          <>
            <Check className='mr-2' />
            <span>Accept</span>
          </>
        )}
      </Button>
    </div>
  );
}
