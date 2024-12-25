import { ImageProps, StaticImageData } from 'next/image';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * ImageLoader is a component that loads an image and displays it.
 * when the image src is switched, the image is loaded and displayed.
 * this is to avoid the flash of the image that is not yet loaded
 */
const ImageLoader = ({
  src,
  alt,
  ...props
}: Omit<ImageProps, 'src'> & { src: string | StaticImageData }) => {
  const [loadedSrc, setLoadedSrc] = useState<string | StaticImageData>(src);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (src !== loadedSrc) {
      setIsLoading(true);
      const img = new window.Image();
      img.src = typeof src === 'string' ? src : src.src;

      img.onload = () => {
        setLoadedSrc(src as string);
        setIsLoading(false);
      };

      // Clean up function
      return () => {
        img.onload = null;
      };
    }
  }, [src, loadedSrc]);

  return <Image src={isLoading ? loadedSrc : src} alt={alt} {...props} />;
};

export default ImageLoader;
