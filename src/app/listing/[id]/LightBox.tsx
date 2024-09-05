'use client';

import { UploadThingImage } from '@prisma/client';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';

export function LightBox({
  images,
  children,
  index,
}: {
  images: UploadThingImage[];
  children: React.ReactNode;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const lightboxImages = images.map((image) => ({ src: image.url }));

  return (
    <>
      <div className='cursor-pointer' onClick={() => setIsOpen(true)}>
        {children}
      </div>
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={lightboxImages}
        index={index}
      />
    </>
  );
}
