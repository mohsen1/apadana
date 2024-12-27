'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { ResetPasswordFormSchema } from '@/lib/schema';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { resetPassword } from '@/app/auth/actions';

type FormData = z.infer<typeof ResetPasswordFormSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const { execute, status, hasErrored, result } = useAction(resetPassword, {
    onSuccess: () => {
      router.push('/signin');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  if (!token) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-destructive text-center'>Invalid Reset Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground mb-4 text-center'>
            This password reset link is invalid or has expired.
          </p>
          <Button className='w-full' onClick={() => router.push('/forgot-password')}>
            Request New Reset Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-bold'>Reset Your Password</CardTitle>
        {email && (
          <div className='text-muted-foreground mt-2 space-y-2 text-center'>
            <p>
              Enter a new password for <span className='font-medium'>{email}</span>
            </p>
            <p className='text-sm'>
              This password can be used to login with any email addresses associated with your
              account.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return handleSubmit((data) => execute({ ...data, token }))(e);
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='password'>New Password</Label>
            <Input {...register('password')} type='password' id='password' />
            {errors.password && (
              <p className='text-destructive text-sm'>{errors.password.message}</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input {...register('confirmPassword')} type='password' id='confirmPassword' />
            {errors.confirmPassword && (
              <p className='text-destructive text-sm'>{errors.confirmPassword.message}</p>
            )}
          </div>
          {hasErrored && <p className='text-destructive text-sm'>{result?.serverError?.error}</p>}
          <Button className='w-full' type='submit' disabled={status === 'executing'}>
            {status === 'executing' ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-900 p-4 dark:bg-zinc-50'>
      <Suspense
        fallback={
          <Card className='w-full max-w-md shadow-lg'>
            <CardContent className='flex justify-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </CardContent>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
