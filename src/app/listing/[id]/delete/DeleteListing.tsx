import { zodResolver } from '@hookform/resolvers/zod';
import { Listing } from '@prisma/client';
import { TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';

import { deleteListing } from './action';

export function DeleteListing({ listing }: { listing: Listing }) {
  const { execute, status } = useAction(deleteListing);

  const { handleSubmit } = useForm<{ id: string }>({
    defaultValues: {
      id: listing.id.toString(),
    },
    resolver: zodResolver(
      z.object({
        id: z.string().uuid(),
      }),
    ),
  });

  return (
    <form
      className='max-w-4xl mx-auto pt-12 p-6 space-y-8 flex-grow'
      onSubmit={handleSubmit((data) =>
        execute({
          id: data.id,
        }),
      )}
    >
      <h1 className='text-2xl font-bold flex items-center gap-2'>
        <TrashIcon className='text-destructive' size={48} />
        Delete "{listing.title}"
      </h1>

      <div className='flex items-center gap-2'>
        <p>
          Are you sure you want to delete this listing? This action cannot be
          undone.
        </p>
      </div>
      <input type='hidden' name='id' value={listing.id} />
      <div className='flex justify-end gap-4'>
        <Button variant='outline' href='/listing'>
          Cancel
        </Button>
        <Button
          type='submit'
          variant='destructive'
          disabled={status === 'executing'}
        >
          Delete
        </Button>
      </div>
    </form>
  );
}
