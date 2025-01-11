'use client';

import { useAction } from 'next-safe-action/hooks';
import { useCallback, useEffect } from 'react';

import { toast } from '@/hooks/useToast';

import { resendEmailVerification } from '@/app/user/actions';
import { createLogger } from '@/utils/logger';

import { Button } from './ui/button';

const logger = createLogger('EmailVerificationBanner');

export function EmailVerificationBanner({ email }: { email: string }) {
  const { execute, result, isPending } = useAction(resendEmailVerification, {
    onError: (error) => {
      logger.error('Failed to send verification email', { error, email });
    },
  });

  const handleResend = useCallback(() => {
    execute({ emailAddress: email });
  }, [email, execute]);

  useEffect(() => {
    if (result?.serverError) {
      toast({
        title: 'Failed to send verification email',
        description: result.serverError.error ?? 'An unknown error occurred',
        variant: 'destructive',
      });
    } else if (result?.data?.success && !isPending) {
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox',
      });
    }
  }, [result, isPending]);

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
            disabled={isPending}
            onClick={handleResend}
          >
            {isPending ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>
      </div>
    </div>
  );
}
