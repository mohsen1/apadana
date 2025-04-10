'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { login } from '@/app/auth/actions';

// Match the schema from actions.ts
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function SignInPage() {
  const { fetchUser, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const initialEmail = searchParams.get('email') || '';
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Get and decode redirect URL
  const getRedirectUrl = () => {
    if (!redirect) return '/';

    try {
      // Decode the redirect URL first
      const decodedRedirect = decodeURIComponent(redirect);

      // Remove any origin part if present
      const url = new URL(decodedRedirect, window.location.origin);
      const relativePath = url.pathname + url.search;

      return relativePath;
    } catch {
      // If URL parsing fails, try as a relative path
      try {
        const decodedPath = decodeURIComponent(redirect);
        // Basic validation to ensure it starts with /
        if (!decodedPath.startsWith('/')) {
          return '/';
        }
        return decodedPath;
      } catch {
        return '/';
      }
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(getRedirectUrl());
    }
  }, [user, router, redirect]);

  const { execute, status, hasErrored, result, isPending } = useAction(login, {
    onSuccess: async ({ data }) => {
      if (data?.user) {
        await fetchUser();
        router.replace(getRedirectUrl());
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

  if (status === 'hasSucceeded') {
    return null;
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-900 p-4 dark:bg-zinc-50'>
      <Card className={cn('w-full max-w-md shadow-lg', hasErrored && 'shadow-destructive')}>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-bold'>Login to your account</CardTitle>
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
                disabled={isPending}
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                type='password'
                placeholder='Enter your password'
                disabled={isPending}
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className='text-destructive text-sm'>{errors.password.message}</p>
              )}
            </div>
            {failedAttempts >= 2 && (
              <div className='text-center text-sm'>
                <Link
                  href={`/forgot-password?email=${getValues('email')}`}
                  className='text-primary hover:underline'
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            {hasErrored && <p className='text-destructive text-sm'>{result?.serverError?.error}</p>}
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || status === 'executing' || isPending}
            >
              {status === 'executing' ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-muted-foreground text-sm'>
            Don't have an account?{' '}
            <Link href='/signup' className='text-primary hover:underline'>
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
