import { OctagonAlert } from 'lucide-react';
import { Metadata } from 'next';
import * as React from 'react';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Not Found',
};

/**
 * NotFound component
 */
// TODO: Make sure this always returns a 404 response code
export default function NotFound({
  message = 'The page you are looking for does not exist.',
  title = 'Page Not Found',
  backUrl = '/',
  backText = 'Back to home',
}: {
  message?: string;
  title?: string;
  backUrl?: string;
  backText?: string;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main className='mt-10 grid grid flex-grow  place-content-center place-items-center'>
        <section className=' grid h-full place-items-center'>
          <div className='layout flex flex-col items-center justify-center text-center'>
            <OctagonAlert
              size={100}
              className='drop-shadow-glow animate-flicker text-destructive'
            />
            <h1 className='mt-8 text-4xl md:text-6xl'>{title}</h1>
            <p className='-muted mt-4'>{message}</p>
            <Button href={backUrl} variant='outline' className='mt-8'>
              {backText}
            </Button>
          </div>
        </section>
      </main>
    </Suspense>
  );
}
