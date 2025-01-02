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
    <picture>
      <source srcSet={`${src} 1x, ${src2x} 2x`} media='(prefers-color-scheme: light)' />
      <source srcSet={`${darkSrc} 1x, ${darkSrc2x} 2x`} media='(prefers-color-scheme: dark)' />

      <Img
        src='https://apadana.app/images/logo/wide-bg.jpg'
        alt={alt}
        width={width}
        height={height}
        srcSet={`${src} 1x, ${src2x} 2x`}
        className={cn('inline-block', className)}
        {...props}
      />
    </picture>
  );
}
