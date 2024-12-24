import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { CreateListingWithCoercion } from '@/lib/schema';

import { ImageUploader } from '@/components/image-uploader';

export function PhotosStep() {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useFormContext<CreateListingWithCoercion>();

  const currentImages = watch('images') || [];

  return (
    <div className='space-y-4'>
      <Controller<CreateListingWithCoercion, 'images'>
        name='images'
        control={control}
        render={({ field }) => (
          <ImageUploader
            initialImages={currentImages}
            onChange={(images) => {
              clearErrors('images');
              field.onChange(images);
            }}
            onError={(error) => {
              if (!error) {
                clearErrors('images');
                return;
              }
              setError('images', {
                type: 'uploadError',
                message: error?.message || 'Something went wrong while uploading the images',
              });
            }}
          />
        )}
      />
      {errors.images && <span className='text-red-500'>{errors.images.message}</span>}
    </div>
  );
}
