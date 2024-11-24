import { ClerkProvider } from '@clerk/nextjs';
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import {
  Inter as FontSans,
  Merriweather as FontHeading,
  Noto_Sans as FontSubheading,
} from 'next/font/google';
import * as React from 'react';
import { extractRouterConfig } from 'uploadthing/server';

import '@/styles/globals.css';

import { cn } from '@/lib/utils';

import Footer from '@/components/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';

import { ourFileRouter as fileRouter } from '@/app/api/uploadthing/core';
import { siteConfig } from '@/constant/config';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = FontHeading({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300', '400', '700', '900'],
});

const fontSubheading = FontSubheading({
  subsets: ['latin'],
  variable: '--font-subheading',
  weight: ['400', '500', '600', '700'],
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  // !STARTERCONF this is the default favicon, you can generate your own from https://realfavicongenerator.net/
  // ! copy to /favicon folder
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
    // creator: '@th_clarence',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <SpeedInsights />
        <Analytics />
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased flex flex-col',
            fontSans.variable,
            fontHeading.variable,
            fontSubheading.variable,
          )}
        >
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
