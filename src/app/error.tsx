'use client'; // Error components must be Client Components

import { useTheme } from 'next-themes';
import * as React from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

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

  const bgColor = theme === 'dark' ? 'bg-background' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-foreground' : 'text-black';
  const buttonColor =
    theme === 'dark'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80';

  return (
    <main>
      <section className={`${bgColor} ${textColor}`}>
        <div className='layout flex min-h-screen flex-col items-center justify-center text-center'>
          <RiAlarmWarningFill
            size={60}
            className={`drop-shadow-glow animate-flicker ${textColor}`}
          />
          <h1 className='mt-8 text-4xl md:text-6xl'>
            Oops, something went wrong!
          </h1>
          <button onClick={reset} className={`mt-4 ${buttonColor}`}>
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
