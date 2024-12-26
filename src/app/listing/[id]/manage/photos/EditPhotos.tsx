'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Listing, UploadedPhoto } from '@prisma/client';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';

import { EditListingImages, EditListingImagesSchema } from '@/lib/schema';

import { SaveButton } from '@/components/common/SaveButton';
import { ImageUploader } from '@/components/image-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      </CardContent>
    </Card>
  );
}
