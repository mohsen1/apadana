'use client';
import { Check, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';

import { Button } from '@/components/ui/button';

import { BookingRequest, BookingRequestStatus } from '@/__generated__/prisma';
import { changeBookingRequestStatus } from '@/app/listing/[id]/manage/action';

export function BookingRequestActions({
  bookingRequest,
  onStatusChange,
}: {
  bookingRequest: BookingRequest;
  onStatusChange: (status: BookingRequestStatus) => void;
}) {
  const router = useRouter();
  const { execute, status, input } = useAction(changeBookingRequestStatus, {
    onSuccess: (result) => {
      router.refresh();
      if (result.data?.success && result.data?.status) {
        onStatusChange(result?.data?.status);
      }
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
        onClick={getHandler(BookingRequestStatus.REJECTED)}
      >
        {status === 'executing' &&
        input?.status === BookingRequestStatus.REJECTED ? (
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
      <Button
        variant='link'
        onClick={getHandler(BookingRequestStatus.ACCEPTED)}
      >
        {status === 'executing' &&
        input?.status === BookingRequestStatus.ACCEPTED ? (
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
