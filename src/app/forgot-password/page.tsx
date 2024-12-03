'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { requestPasswordReset } from '@/app/auth/actions';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
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
      email: Array.isArray(initialEmail) ? initialEmail[0] : initialEmail,
    },
  });

  const { execute: requestPasswordResetAction } = useAction(
    requestPasswordReset,
    {
      onSuccess() {
        setSubmittedEmail(getValues('email'));
        setIsSubmitted(true);
      },
    },
  );

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
        <Card className='w-full max-w-md shadow-lg'>
          <CardHeader>
            <div className='flex justify-center mb-4'>
              <CheckCircle2 className='h-12 w-12 text-green-500' />
            </div>
            <CardTitle className='text-2xl font-bold text-center'>
              Check your email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-center text-gray-600 dark:text-gray-400'>
              If an account exists for {submittedEmail}, you will receive a
              password reset link.
            </p>
          </CardContent>
          <CardFooter className='justify-center'>
            <Link
              href='/sign-in'
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              Return to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(requestPasswordResetAction)(e);
            }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                {...register('email')}
                type='email'
                placeholder='Enter your email'
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
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
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Remember your password?{' '}
            <Link
              href='/sign-in'
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
