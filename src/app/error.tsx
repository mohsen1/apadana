'use client'; // Error components must be Client Components

import { useTheme } from 'next-themes';
import * as React from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);
  const { theme } = useTheme();

  const buttonColor =
    theme === 'dark'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';

  return (
    <main className='flex-grow grid place-items-center'>
      <section className=''>
        <div className='layout flex flex-col items-center justify-center text-center'>
          <RiAlarmWarningFill
            size={60}
            className='drop-shadow-glow animate-flicker'
          />
          <h1 className='mt-8 text-4xl md:text-6xl'>
            Oops, something went wrong!
          </h1>
          <ErrorRender error={error} />
          <Button
            variant='outline'
            onClick={reset}
            className={`mt-4 ${buttonColor}`}
          >
            Try again
          </Button>
        </div>
      </section>
    </main>
  );
}

function ErrorRender({ error }: { error: Error & { digest?: string } }) {
  return (
    <div>
      <pre className='text-red-500 text-left py-8 '>{error.stack}</pre>
      {error.digest && (
        <pre className='text-red-500 text-left py-8 '>
          Digest: {error.digest}
        </pre>
      )}
    </div>
  );
}
