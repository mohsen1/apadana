'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';

import { Listing } from '@/__generated__/prisma';

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
      className='max-w-4xl mx-auto pt-12 p-6 space-y-8 flex-grow'
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit((data) => {
          execute({
            id: String(data.id),
          });
        })(e);
      }}
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
