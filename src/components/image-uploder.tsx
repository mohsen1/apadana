'use client';
import Image from 'next/image';
import { useState } from 'react';
import { UploadedFileData } from 'uploadthing/types';

import { UploadButton } from '@/utils/uploadthing';

export const ImageUploader = ({
  onChange,
  onError,
}: {
  onChange: (images: UploadedFileData[]) => void;
  onError?: (error: Error) => void;
}) => {
  const [images, setImages] = useState<UploadedFileData[]>([]);
  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-4'>
        {images.map((image) => (
          <div key={image.key} className='w-1/3 h-1/3'>
            <Image
              src={image.url}
              alt={image.name}
              width={100}
              height={100}
              className='object-cover'
            />
          </div>
        ))}
      </div>

      <UploadButton
        endpoint='imageUploader'
        onClientUploadComplete={(newImages) => {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onChange(updatedImages);
        }}
        onUploadError={(error: Error) => {
          onError?.(error);
        }}
      />
    </div>
  );
};
