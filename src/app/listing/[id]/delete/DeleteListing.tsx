'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Listing } from '@prisma/client';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';

import { deleteListing } from './action';

export function DeleteListing({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { execute } = useAction(deleteListing, {
    onSuccess: () => {
      router.push('/listing');
      router.refresh();
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ id: string }>({
    defaultValues: {
      id: listing.id.toString(),
    },
    resolver: zodResolver(
      z.object({
        id: z.string(),
      }),
    ),
  });

  return (
    <form
      className='mx-auto max-w-4xl flex-grow space-y-8 p-6 pt-12'
      onSubmit={(e) => {
        e.preventDefault();
        return handleSubmit((data) => {
          execute({
            id: String(data.id),
          });
        })(e);
      }}
    >
      <h1 className='flex items-center gap-2 text-2xl font-bold'>
        <TrashIcon className='text-destructive' size={48} />
        Delete "{listing.title}"
      </h1>

      <div className='flex items-center gap-2'>
        <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
      </div>
      <input type='hidden' name='id' value={listing.id.toString()} />
      <div className='flex justify-end gap-4'>
        <Button variant='outline' href='/listing'>
          Cancel
        </Button>
        <Button type='submit' variant='destructive' disabled={isSubmitting}>
          Delete
        </Button>
      </div>
    </form>
  );
}
