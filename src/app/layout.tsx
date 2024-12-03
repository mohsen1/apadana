import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import * as React from 'react';
import { extractRouterConfig } from 'uploadthing/server';

import '@/styles/globals.css';

import { getUserFromSession, sanitizeUserForClient } from '@/lib/auth';
import { cn } from '@/lib/utils';

import Footer from '@/components/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

import { ourFileRouter as fileRouter } from '@/app/api/uploadthing/core';
import { siteConfig } from '@/constant/config';
import { AuthProvider } from '@/contexts/auth-context';

import { fontHeading, fontSans, fontSubheading } from './fonts';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();

  return (
    <AuthProvider user={sanitizeUserForClient(user)}>
      <html lang='en' suppressHydrationWarning>
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
        <body
          className={cn(
            'min-h-screen bg-background font-sans antialiased flex flex-col',
            fontSans.variable,
            fontHeading.variable,
            fontSubheading.variable,
          )}
        >
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <ToastProvider>
              <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
              <Header />
              <div className='flex-grow'>{children}</div>
              <Toaster />
              <Footer />
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
