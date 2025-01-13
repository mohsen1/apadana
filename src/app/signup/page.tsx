'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SignUpSchema } from '@/lib/schema';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { signUp } from '@/app/auth/actions';

type SignUpFormData = z.infer<typeof SignUpSchema>;

function SignUpForm() {
  const router = useRouter();
  const { fetchUser, user } = useAuth();
  const { execute, status, hasErrored, result } = useAction(signUp, {
    onSuccess: async ({ data }) => {
      if (data?.user) {
        await fetchUser();
        router.push('/user');
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpSchema),
  });

  useEffect(() => {
    if (user) {
      router.push('/user');
    }
  }, [user, router]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-900 p-4 dark:bg-zinc-50'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-bold'>Sign Up for an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(execute)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input {...register('firstName')} placeholder='John' />
                {errors.firstName && (
                  <p className='text-sm text-red-500'>{errors.firstName.message}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input {...register('lastName')} placeholder='Doe' />
                {errors.lastName && (
                  <p className='text-sm text-red-500'>{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input {...register('email')} type='email' placeholder='john.doe@example.com' />
              {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input {...register('password')} type='password' />
              {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input {...register('confirmPassword')} type='password' />
              {errors.confirmPassword && (
                <p className='text-sm text-red-500'>{errors.confirmPassword.message}</p>
              )}
            </div>
            {hasErrored && <p className='text-destructive text-sm'>{result?.serverError?.error}</p>}
            <Button className='w-full' type='submit' disabled={status === 'executing'}>
              {status === 'executing' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-muted-foreground text-sm'>
            Already have an account?{' '}
            <Link href='/signin' className='text-primary hover:underline'>
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className='bg-muted flex min-h-screen items-center justify-center p-4'>
          <Card className='w-full max-w-md shadow-lg'>
            <CardContent className='flex justify-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
