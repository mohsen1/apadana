import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import * as React from 'react';

import '@/styles/globals.css';

import { cn } from '@/lib/utils';

import Footer from '@/components/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

import { getCurrentUser } from '@/app/auth/actions';
import { siteConfig } from '@/constant/config';
import { AuthProvider } from '@/contexts/auth-context';
import { validateEnvironmentVariables } from '@/utils/environment-variables';

import { fontHeading, fontSans, fontSubheading } from './fonts';
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.title} ${process.env.NODE_ENV === 'development' ? '(dev)' : ''}`,
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  validateEnvironmentVariables();

  const result = await getCurrentUser();
  const user = result?.data?.user;

  return (
    <AuthProvider initialUser={user}>
      <html lang='en' suppressHydrationWarning>
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
        <body
          className={cn(
            'bg-background text-foreground min-h-screen',
            'flex flex-col',
            fontSans.variable,
            fontHeading.variable,
            fontSubheading.variable,
          )}
        >
          <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
            <ToastProvider>
              <Header className='h-16' />
              <main className='mx-auto min-h-[calc(100vh-4rem)] w-full flex-1'>{children}</main>
              <Footer className='mt-auto' />
              <Toaster />
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </AuthProvider>
  );
}
