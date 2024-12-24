'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

import { requestPasswordReset } from '@/app/auth/actions';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof formSchema>;

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const { execute: requestPasswordResetAction } = useAction(requestPasswordReset, {
    onSuccess() {
      setSubmittedEmail(getValues('email'));
      setIsSubmitted(true);
    },
  });

  if (isSubmitted) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <div className='mb-4 flex justify-center'>
            <CheckCircle2 className='text-success h-12 w-12' />
          </div>
          <CardTitle className='text-center text-2xl font-bold'>Check your email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-center'>
            If an account exists for {submittedEmail}, you will receive a password reset link.
          </p>
        </CardContent>
        <CardFooter className='justify-center'>
          <Link href='/sign-in' className='text-primary hover:text-primary/90 hover:underline'>
            Return to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-bold'>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return handleSubmit(requestPasswordResetAction)(e);
          }}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input {...register('email')} type='email' placeholder='Enter your email' />
            {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
          </div>
          <Button className='w-full' type='submit' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='justify-center'>
        <p className='text-muted-foreground text-sm'>
          Remember your password?{' '}
          <Link href='/sign-in' className='text-primary hover:underline'>
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader>
        <Skeleton className='mx-auto h-8 w-3/4' />
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
        <Skeleton className='h-10 w-full' />
      </CardContent>
      <CardFooter className='justify-center'>
        <Skeleton className='h-4 w-48' />
      </CardFooter>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
