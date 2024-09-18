'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Listing } from '@prisma/client';
import { Loader2, SaveIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';
import { UploadedFileData } from 'uploadthing/types';

import {
  EditListingImages,
  EditListingImagesSchema,
} from '@/lib/prisma/schema';

import { DisappearingComponent } from '@/components/DisappearingComponent';
import { ImageUploader } from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { editListingImages } from '@/app/listing/[id]/manage/action';

export function EditPhotos({
  listing,
}: {
  listing: Listing & { images: UploadedFileData[] };
}) {
  const { status, execute } = useAction(editListingImages);
  const { handleSubmit, formState, control } = useForm<EditListingImages>({
    defaultValues: {
      images: listing.images,
      listingId: listing.id,
    },
    resolver: zodResolver(EditListingImagesSchema),
  });
  const { errors, isSubmitting } = formState;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Photos</CardTitle>
        <CardDescription>Edit your listing photos</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => {
            execute({
              ...data,
              listingId: listing.id,
            });
          })}
        >
          <div>
            <Controller
              control={control}
              name='images'
              render={({ field }) => (
                <ImageUploader
                  initialImages={listing.images}
                  onChange={(images) => {
                    const optimistic = images.some((image) =>
                      image.key.startsWith('optimistic-'),
                    );
                    if (!optimistic) {
                      field.onChange(images);
                    }
                  }}
                />
              )}
            />
            {errors.images && (
              <div className='text-red-500 dark:text-red-400'>
                {errors.images.message}
              </div>
            )}
          </div>
          <div className='flex justify-start items-center'>
            <Button
              disabled={isSubmitting || !formState.isDirty}
              type='submit'
              className='flex items-center gap-2'
            >
              {status === 'executing' ? (
                <>
                  <Loader2 />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SaveIcon />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
            {formState.isSubmitSuccessful && !formState.isSubmitting && (
              <DisappearingComponent
                disappearIn={3}
                className='mx-2 text-green-600 dark:text-green-400'
              >
                Your changes have been saved
              </DisappearingComponent>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
