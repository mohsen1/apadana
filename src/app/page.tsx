import { Calendar, CheckCircle, Globe, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { Novatrix } from 'uvcanvas';

import { EarlyAccessForm } from '@/components/early-access-form';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className='flex flex-col'>
      <div className='grid flex-1 grid-cols-[1fr] place-content-center'>
        <section className='md:py-18 relative w-full py-8 lg:py-24 xl:py-32'>
          <div
            className='absolute inset-0 z-0 min-h-screen w-full overflow-hidden opacity-10'
            id='bg-canvas'
          >
            <Novatrix />
          </div>
          <div className='relative top-0 z-10'>
            <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='space-y-2'>
                  <h1 className='text-4xl font-bold'>
                    Manage Your Short-Term Rentals Without Extra Fees with Apadana
                  </h1>
                  <p className='text-muted-foreground mx-auto max-w-[700px] md:text-xl'>
                    Create your own website for your short-term rental in minutes. Get direct
                    bookings, manage your calendar, and communicate with guests - all without extra
                    fees.
                  </p>
                </div>

                <div className='space-x-4'>
                  <EarlyAccessForm />
                </div>
              </div>
            </div>
            <div className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'>
              <div className='flex items-center justify-center pt-12'>
                <Logo className='text-shadow-sm' size={200} />
              </div>
            </div>
            <div className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'>
              <h2 className='font-subheading mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl'>
                Key Features
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Calendar className='mr-2 h-6 w-6' />
                      Calendar Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Easily manage your listing's availability and sync with other platforms like
                    Airbnb and VRBO.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Globe className='mr-2 h-6 w-6' />
                      Custom Domain
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Get your own domain (e.g., 123mainst.com) for a professional and memorable
                    online presence.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <MessageCircle className='mr-2 h-6 w-6' />
                      Secure Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Communicate securely with potential guests directly through your website.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <ShieldCheck className='mr-2 h-6 w-6' />
                      Identity Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Ensure guest trustworthiness with our built-in identity verification system.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <RefreshCw className='mr-2 h-6 w-6' />
                      Calendar Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Keep your availability up-to-date across all platforms with automatic calendar
                    syncing.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <CheckCircle className='mr-2 h-6 w-6' />
                      Direct Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Receive payments directly from guests without any additional fees cutting into
                    your profits.
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'>
              <h2 className='font-subheading mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl'>
                How It Works
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <div className='flex flex-col items-center text-center'>
                  <div className='bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold'>
                    1
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Sign Up</h3>
                  <p className='-muted mt-2'>
                    Create your account and provide details about your rental property.
                  </p>
                </div>
                <div className='flex flex-col items-center text-center'>
                  <div className='bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold'>
                    2
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Customize</h3>
                  <p className='-muted mt-2'>
                    Choose your domain and customize your website with our easy-to-use tools.
                  </p>
                </div>
                <div className='flex flex-col items-center text-center'>
                  <div className='bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold'>
                    3
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Go Live</h3>
                  <p className='-muted mt-2'>
                    Publish your site and start accepting direct bookings from guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className='mx-auto max-w-6xl md:px-6'>
          <section className='w-full py-12 md:py-24 lg:py-32'>
            <div className='container px-4 md:px-6'>
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='space-y-2'>
                  <h2 className='font-subheading text-3xl font-bold tracking-tighter sm:text-5xl'>
                    Ready to Take Control of Your Rental?
                  </h2>
                  <p className='text-muted-foreground mx-auto max-w-[700px] md:text-xl'>
                    Start managing your short-term rental your way. Create your website, get direct
                    bookings, and maximize your profits.
                  </p>
                </div>
                <div className='space-x-4'>
                  <EarlyAccessForm />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
