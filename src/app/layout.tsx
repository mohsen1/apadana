import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import Head from 'next/head';
import * as React from 'react';

import '@/styles/globals.css';

import { cn } from '@/lib/utils';

import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import Footer from '@/components/layout/Footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

import { getCurrentUser } from '@/app/auth/actions';
import { siteConfig } from '@/constant/config';
import { AuthProvider } from '@/contexts/auth-context';
import { validateEnvironmentVariables } from '@/utils/environment-variables';

import { fontHeading, fontSans, fontSubheading } from './fonts';

// this is added intentionally to make the build fail
// let unused = 1;

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

  const primaryEmail = user?.emailAddresses.find((email) => email.isPrimary);
  const needsVerification = primaryEmail && !primaryEmail.verified;

  return (
    <AuthProvider initialUser={user}>
      <html lang='en' suppressHydrationWarning>
        {process.env.NODE_ENV === 'production' && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
        <Head>
          <link
            rel='icon'
            type='image/png'
            href='/images/favicon/favicon-96x96.png'
            sizes='96x96'
          />
          <link rel='icon' type='image/svg+xml' href='/images/favicon/favicon.svg' />
          <link rel='shortcut icon' href='/images/favicon/favicon.ico' />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/images/favicon/apple-touch-icon.png'
          />
          <meta name='apple-mobile-web-app-title' content='Apadana' />
          <link rel='manifest' href='/images/favicon/site.webmanifest' />
        </Head>
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
              {needsVerification && <EmailVerificationBanner email={primaryEmail.emailAddress} />}
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
