import { Calendar, CheckCircle, Globe, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { Novatrix } from 'uvcanvas';

import { EarlyAccessForm } from '@/components/early-access-form';
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
                  <h1 className='text-4xl font-bold'>Welcome to Apadana</h1>
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
          <section className='w-full'>
            <div className='container px-4 md:px-6'>
              <h2 className='font-subheading mb-12 mt-8 text-center text-3xl font-bold tracking-tighter sm:text-5xl'>
                What Our Hosts Say
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='-muted'>
                      "This platform has revolutionized how I manage my vacation rental. The direct
                      bookings and lack of fees have significantly increased my profits."
                    </p>
                    <p className='mt-4 font-bold'>- Sarah T., Beach House Owner</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='-muted'>
                      "The calendar sync feature is a game-changer. I no longer worry about double
                      bookings across different platforms."
                    </p>
                    <p className='mt-4 font-bold'>- Michael R., City Apartment Host</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='-muted'>
                      "Having my own website has given my rental a professional edge. Guests love
                      booking directly through our site."
                    </p>
                    <p className='mt-4 font-bold'>- Emma L., Mountain Cabin Owner</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section className='w-full py-12 md:py-24 lg:py-48'>
            <div className='container px-4 md:px-6'>
              <h2 className='font-subheading mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl'>
                Simple Pricing
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>$9.99/mo</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Custom domain
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Calendar management
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Direct payments
                      </li>
                    </ul>
                    <Button className='mt-6 w-full'>Choose Plan</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Pro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>$19.99/mo</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        All Basic features
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Calendar sync
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Identity verification
                      </li>
                    </ul>
                    <Button className='mt-6 w-full'>Choose Plan</Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-4xl font-bold'>Custom</p>
                    <ul className='mt-4 space-y-2'>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        All Pro features
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Multiple properties
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='mr-2 text-green-500' />
                        Priority support
                      </li>
                    </ul>
                    <Button className='mt-6 w-full'>Contact Sales</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
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
