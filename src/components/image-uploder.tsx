'use client';
import { XIcon } from 'lucide-react';
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

  const deleteImage = (key: string) => {
    const updatedImages = images.filter((image) => image.key !== key);
    setImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-4'>
        {images.map((image) => (
          <div key={image.key} className='w-1/3 h-1/3 relative m-2'>
            <div className='border rounded-lg shadow-md overflow-hidden'>
              <Image
                src={image.url}
                alt={image.name}
                width={100}
                className='object-cover w-full h-full'
                height={100}
              />
            </div>
            <button
              onClick={() => deleteImage(image.key)}
              className='absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none'
            >
              <XIcon className='w-4 h-4' />
            </button>
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
