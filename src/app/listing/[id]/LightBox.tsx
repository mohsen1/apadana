'use client';

import { UploadThingImage } from '@prisma/client';
import Image from 'next/image';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';

export function LightBox({
  images,
  title,
}: {
  images: UploadThingImage[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const lightboxImages = images.map((image) => ({ src: image.url }));

  return (
    <>
      <div
        className='relative h-[50vh] w-full cursor-pointer'
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={images[0].url}
          alt={title}
          layout='fill'
          objectFit='cover'
          priority
        />
      </div>
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={lightboxImages}
        index={0}
      />
    </>
  );
}
