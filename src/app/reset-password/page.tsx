'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { resetPassword } from '@/app/auth/actions';

const formSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  if (!token) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card>
          <CardHeader>
            <CardTitle className='text-destructive'>
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>This password reset link is invalid or has expired.</p>
            <Button
              className='mt-4'
              onClick={() => router.push('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword({ ...data, token });
      toast({
        title: 'Password Reset Successful',
        description: 'You can now sign in with your new password.',
      });
      router.push('/sign-in');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='password'>New Password</Label>
              <Input {...register('password')} type='password' id='password' />
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                {...register('confirmPassword')}
                type='password'
                id='confirmPassword'
              />
              {errors.confirmPassword && (
                <p className='text-sm text-red-500'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button className='w-full' type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
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
    </div>
  );
}
