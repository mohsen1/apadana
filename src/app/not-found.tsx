import { OctagonAlert } from 'lucide-react';
import { Metadata } from 'next';
import * as React from 'react';

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
    <main className='flex-grow grid place-items-center mt-10  grid place-content-center'>
      <section className=' grid place-items-center h-full dark:-dark'>
        <div className='layout flex flex-col items-center justify-center text-center'>
          <OctagonAlert size={100} className='drop-shadow-glow animate-flicker text-destructive' />
          <h1 className='mt-8 text-4xl md:text-6xl'>{title}</h1>
          <p className='mt-4 -muted'>{message}</p>
          <Button href={backUrl} variant='outline' className='mt-8'>
            {backText}
          </Button>
        </div>
      </section>
    </main>
  );
}
