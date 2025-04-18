import {
  Inter as FontSans,
  Merriweather as FontHeading,
  Noto_Sans as FontSubheading,
  Outfit as FontOutfit,
} from 'next/font/google';

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontHeading = FontHeading({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '700', '900'],
});

export const fontSubheading = FontSubheading({
  subsets: ['latin'],
  variable: '--font-subheading',
  weight: ['400', '500', '600', '700'],
});

export const fontOutfit = FontOutfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '700'],
});
