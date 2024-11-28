import {
  Calendar,
  CheckCircle,
  Globe,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import * as React from 'react';
import { Novatrix } from 'uvcanvas';

import { EarlyAccessForm } from '@/components/early-access-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className='flex flex-col'>
      <main className='flex-1'>
        <section className='w-full py-8 md:py-18 lg:py-24 xl:py-32 relative'>
          <div className='absolute inset-0 z-0 opacity-10 overflow-hidden min-h-screen'>
            <Novatrix />
          </div>
          <div className='relative z-10  top-0'>
            <div className='container px-4 md:px-6 mx-auto max-w-6xl'>
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='space-y-2'>
                  <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-heading'>
                    Your Rental, Your Website, Your Way
                  </h1>
                  <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
                    Create your own website for your short-term rental in
                    minutes. Get direct bookings, manage your calendar, and
                    communicate with guests - all without extra fees.
                  </p>
                </div>
                <div className='space-x-4'>
                  <EarlyAccessForm />
                </div>
              </div>
            </div>
            <div className='container px-4 md:px-6 mx-auto max-w-6xl mt-24'>
              <h2 className='text-3xl font-bold font-subheading tracking-tighter sm:text-5xl text-center mb-12'>
                Key Features
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Calendar className='w-6 h-6 mr-2' />
                      Calendar Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Easily manage your listing's availability and sync with
                    other platforms like Airbnb and VRBO.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Globe className='w-6 h-6 mr-2' />
                      Custom Domain
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Get your own domain (e.g., 123mainst.com) for a professional
                    and memorable online presence.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <MessageCircle className='w-6 h-6 mr-2' />
                      Secure Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Communicate securely with potential guests directly through
                    your website.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <ShieldCheck className='w-6 h-6 mr-2' />
                      Identity Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Ensure guest trustworthiness with our built-in identity
                    verification system.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <RefreshCw className='w-6 h-6 mr-2' />
                      Calendar Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Keep your availability up-to-date across all platforms with
                    automatic calendar syncing.
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <CheckCircle className='w-6 h-6 mr-2' />
                      Direct Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Receive payments directly from guests without any additional
                    fees cutting into your profits.
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className='container px-4 md:px-6 mt-24  mx-auto max-w-6xl  '>
              <h2 className='text-3xl font-bold font-subheading tracking-tighter sm:text-5xl text-center mb-12'>
                How It Works
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <div className='flex flex-col items-center text-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-bold text-2xl'>
                    1
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Sign Up</h3>
                  <p className='mt-2 text-foreground-muted'>
                    Create your account and provide details about your rental
                    property.
                  </p>
                </div>
                <div className='flex flex-col items-center text-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-bold text-2xl'>
                    2
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Customize</h3>
                  <p className='mt-2 text-foreground-muted'>
                    Choose your domain and customize your website with our
                    easy-to-use tools.
                  </p>
                </div>
                <div className='flex flex-col items-center text-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-bold text-2xl'>
                    3
                  </div>
                  <h3 className='mt-4 text-xl font-bold'>Go Live</h3>
                  <p className='mt-2 text-foreground-muted'>
                    Publish your site and start accepting direct bookings from
                    guests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className=' md:px-6 mx-auto max-w-6xl'>
          <section className='w-full'>
            <div className='container px-4 md:px-6'>
              <h2 className='text-3xl mt-8 font-bold font-subheading tracking-tighter sm:text-5xl text-center mb-12'>
                What Our Hosts Say
              </h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='text-foreground-muted'>
                      "This platform has revolutionized how I manage my vacation
                      rental. The direct bookings and lack of fees have
                      significantly increased my profits."
                    </p>
                    <p className='mt-4 font-bold'>
                      - Sarah T., Beach House Owner
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='text-foreground-muted'>
                      "The calendar sync feature is a game-changer. I no longer
                      worry about double bookings across different platforms."
                    </p>
                    <p className='mt-4 font-bold'>
                      - Michael R., City Apartment Host
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='mt-4'>
                    <p className='text-foreground-muted'>
                      "Having my own website has given my rental a professional
                      edge. Guests love booking directly through our site."
                    </p>
                    <p className='mt-4 font-bold'>
                      - Emma L., Mountain Cabin Owner
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          <section className='w-full py-12 md:py-24 lg:py-48'>
            <div className='container px-4 md:px-6'>
              <h2 className='text-3xl font-bold font-subheading tracking-tighter sm:text-5xl text-center mb-12'>
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
                        <CheckCircle className='text-green-500 mr-2' />
                        Custom domain
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
                        Calendar management
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
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
                        <CheckCircle className='text-green-500 mr-2' />
                        All Basic features
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
                        Calendar sync
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
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
                        <CheckCircle className='text-green-500 mr-2' />
                        All Pro features
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
                        Multiple properties
                      </li>
                      <li className='flex items-center'>
                        <CheckCircle className='text-green-500 mr-2' />
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
                  <h2 className='text-3xl font-bold font-subheading tracking-tighter sm:text-5xl'>
                    Ready to Take Control of Your Rental?
                  </h2>
                  <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400'>
                    Start managing your short-term rental your way. Create your
                    website, get direct bookings, and maximize your profits.
                  </p>
                </div>
                <div className='space-x-4'>
                  <EarlyAccessForm />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
