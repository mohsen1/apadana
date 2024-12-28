'use client';

import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Globe, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import * as React from 'react';
import { Novatrix } from 'uvcanvas';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

import { EarlyAccessForm } from '@/components/early-access-form';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MotionCard = motion(Card);

export default function HomePage() {
  const { ref: featuresRef, isInView: featuresInView } = useScrollAnimation();

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
            <motion.div
              className='mx-auto w-full max-w-6xl px-4 md:px-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className='flex flex-col items-center space-y-4 text-center'>
                <motion.div
                  className='space-y-2'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className='text-4xl font-bold'>
                    Manage Your Short-Term Rentals Without Extra Fees with Apadana
                  </h1>
                  <p className='text-muted-foreground mx-auto max-w-[700px] md:text-xl'>
                    Create your own website for your short-term rental in minutes. Get direct
                    bookings, manage your calendar, and communicate with guests - all without extra
                    fees.
                  </p>
                </motion.div>

                <motion.div
                  className='space-x-4'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <EarlyAccessForm />
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className='flex items-center justify-center pt-12'>
                <Logo className='text-shadow-sm' size={200} />
              </div>
            </motion.div>
            <div className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'>
              <motion.h2
                className='font-subheading mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl'
                ref={featuresRef}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                Key Features
              </motion.h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                {[
                  {
                    icon: Calendar,
                    title: 'Calendar Management',
                    content:
                      "Easily manage your listing's availability and sync with other platforms like Airbnb and VRBO.",
                  },
                  {
                    icon: Globe,
                    title: 'Custom Domain',
                    content:
                      'Get your own domain (e.g., 123mainst.com) for a professional and memorable online presence.',
                  },
                  {
                    icon: MessageCircle,
                    title: 'Secure Communication',
                    content:
                      'Communicate securely with potential guests directly through your website.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Identity Verification',
                    content:
                      'Ensure guest trustworthiness with our built-in identity verification system.',
                  },
                  {
                    icon: RefreshCw,
                    title: 'Calendar Sync',
                    content:
                      'Keep your availability up-to-date across all platforms with automatic calendar syncing.',
                  },
                  {
                    icon: CheckCircle,
                    title: 'Direct Payments',
                    content:
                      'Receive payments directly from guests without any additional fees cutting into your profits.',
                  },
                ].map((feature, index) => (
                  <MotionCard
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <CardHeader>
                      <CardTitle className='flex items-center'>
                        <feature.icon className='mr-2 h-6 w-6' />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>{feature.content}</CardContent>
                  </MotionCard>
                ))}
              </div>
            </div>
            <div className='container mx-auto mt-24 max-w-6xl px-4 md:px-6'>
              <motion.h2
                className='font-subheading mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                How It Works
              </motion.h2>
              <div className='grid gap-6 lg:grid-cols-3'>
                {[
                  {
                    step: 1,
                    title: 'Sign Up',
                    content: 'Create your account and provide details about your rental property.',
                  },
                  {
                    step: 2,
                    title: 'Customize',
                    content:
                      'Choose your domain and customize your website with our easy-to-use tools.',
                  },
                  {
                    step: 3,
                    title: 'Go Live',
                    content: 'Publish your site and start accepting direct bookings from guests.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    className='flex flex-col items-center text-center'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true, amount: 0.2 }}
                  >
                    <div className='bg-primary text-background flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold'>
                      {item.step}
                    </div>
                    <h3 className='mt-4 text-xl font-bold'>{item.title}</h3>
                    <p className='-muted mt-2'>{item.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className='mx-auto max-w-6xl md:px-6'>
          <section className='w-full py-12 md:py-24 lg:py-32'>
            <div className='container px-4 md:px-6'>
              <motion.div
                className='flex flex-col items-center space-y-4 text-center'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.2 }}
              >
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
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
