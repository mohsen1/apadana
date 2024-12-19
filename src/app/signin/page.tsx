'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

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
import { Separator } from '@/components/ui/separator';

import { login } from '@/app/auth/actions';
import { AppleLogo, GoogleLogo } from '@/app/signin/logos';

// Match the schema from actions.ts
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function SignInPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const initialEmail = searchParams.get('email') || '';
  const [failedAttempts, setFailedAttempts] = useState(0);

  const { execute, status, hasErrored, result } = useAction(login, {
    onSuccess: ({ data }) => {
      if (data?.user) {
        setUser(data.user);
        router.push(redirect || '/');
      }
    },
    onError: () => {
      setFailedAttempts((prev) => prev + 1);
    },
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-300 dark:bg-gray-600 p-4'>
      <Card
        className={cn(
          'w-full max-w-md shadow-lg',
          hasErrored && 'shadow-red-500',
        )}
      >
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Login to your account
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              return handleSubmit(execute)(e);
            }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='Enter your password'
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>
            {failedAttempts >= 2 && (
              <div className='text-sm text-center'>
                <Link
                  href={`/forgot-password?email=${getValues('email')}`}
                  className='text-blue-600 dark:text-blue-400 hover:underline'
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            {hasErrored && (
              <p className='text-sm text-red-500'>
                {result?.serverError?.error}
              </p>
            )}
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || status === 'executing'}
            >
              {status === 'executing' ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <Separator className='my-4' />

          <div className='space-y-2'>
            <Button variant='outline' className='w-full'>
              <GoogleLogo />
              Log in with Google
            </Button>
            <Button variant='outline' className='w-full'>
              <AppleLogo />
              Log in with Apple
            </Button>
          </div>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Don't have an account?{' '}
            <Link
              href='/signup'
              className='text-blue-600 dark:text-blue-400 hover:underline'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
