import { Img, ImgProps } from '@react-email/components';

import { cn } from '@/lib/utils';

export interface ColorSchemeAwareImgProps extends ImgProps {
  src: string;
  src2x: string;
  darkSrc: string;
  darkSrc2x: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function ColorSchemeAwareImg({
  src,
  src2x,
  darkSrc,
  darkSrc2x,
  alt,
  width,
  height,
  className,
  ...props
}: ColorSchemeAwareImgProps) {
  return (
    <>
      <Img
        src={src}
        width={width}
        height={height}
        alt={alt}
        srcSet={`${src} 1x, ${src2x} 2x`}
        className={cn('dark:hidden', className)}
        {...props}
      />
      <Img
        src={darkSrc}
        width={width}
        height={height}
        alt={alt}
        srcSet={`${darkSrc} 1x, ${darkSrc2x} 2x`}
        className={cn('hidden dark:block', className)}
        {...props}
      />
    </>
  );
}
