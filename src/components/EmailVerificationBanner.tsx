'use client';

import { useState } from 'react';

import { toast } from '@/hooks/useToast';

import { resendEmailVerification } from '@/app/user/actions';
import { assertError } from '@/utils';

import { Button } from './ui/button';

export function EmailVerificationBanner({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    try {
      setIsResending(true);
      await resendEmailVerification({ emailAddress: email });
      toast({
        title: 'Verification email sent',
        variant: 'default',
      });
    } catch (error) {
      assertError(error);
      toast({
        title: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className='w-full bg-yellow-50 p-4 dark:bg-yellow-900/20'>
      <div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center'>
        <h3 className='text-sm font-medium text-yellow-800 dark:text-yellow-200'>
          Email Verification Required
        </h3>
        <div className='flex items-center gap-x-2 text-sm text-yellow-700 dark:text-yellow-300'>
          Please verify your email address.
          <Button
            variant='link'
            className='h-auto p-0 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
            disabled={isResending}
            onClick={handleResend}
          >
            {isResending ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>
      </div>
    </div>
  );
}
