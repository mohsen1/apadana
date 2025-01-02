'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Listing, UploadedPhoto } from '@prisma/client';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';

import { EditListingImages, EditListingImagesSchema } from '@/lib/schema';

import { SaveButton } from '@/components/common/SaveButton';
import { ImageUploader } from '@/components/image-uploader';

import { editListingImages } from '@/app/listing/[id]/manage/action';

type ListingWithImages = Listing & {
  images: UploadedPhoto[];
};

interface EditPhotosProps {
  listing: ListingWithImages;
}

export function EditPhotos({ listing }: EditPhotosProps) {
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
    <div className='space-y-6'>
      <div className='space-y-2 px-6 md:px-0'>
        <h3 className='text-lg font-medium'>Listing Photos</h3>
        <p className='text-muted-foreground text-sm'>Edit your listing photos</p>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          execute({
            ...data,
            listingId: listing.id,
          });
        })}
        className='space-y-2'
      >
        <div className='space-y-4 px-6 md:px-0'>
          <Controller
            control={control}
            name='images'
            render={({ field }) => (
              <ImageUploader
                initialImages={listing.images}
                onChange={(images) => {
                  const optimistic = images.some((image) => image.key.startsWith('optimistic-'));
                  if (!optimistic) {
                    field.onChange(images);
                  }
                }}
              />
            )}
          />
          {errors.images && <div className='text-destructive'>{errors.images.message}</div>}
        </div>

        <SaveButton
          isSubmitting={isSubmitting}
          isValid={true}
          isDirty={formState.isDirty}
          status={status}
          isSubmitSuccessful={formState.isSubmitSuccessful}
          successMessage='Photos have been saved successfully'
        />
      </form>
    </div>
  );
}
