'use client';

import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { createLogger } from '@/utils/logger';

import { deleteAccount } from './actions';
import { requestPasswordReset } from '../auth/actions';

const logger = createLogger('account-security');

export function AccountSecurity() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const { execute: requestReset, status: resetStatus } = useAction(requestPasswordReset, {
    onSuccess: () => {
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for instructions to reset your password.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.error.serverError?.error || 'Failed to send reset email',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      router.push('/signin');
    } catch (error) {
      logger.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='flex-1 p-6'>
      <div className='max-w-3xl space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Security Settings</h3>
          <p className='text-muted-foreground text-sm'>Manage your account security and data.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>
              Reset your password by receiving an email at {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => user?.email && requestReset({ email: user.email })}
              disabled={resetStatus === 'executing'}
            >
              {resetStatus === 'executing' ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <KeyRound className='mr-2 h-4 w-4' />
                  Send Password Reset Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        <div className='space-y-4'>
          <div>
            <h3 className='text-destructive text-lg font-medium'>Danger Zone</h3>
            <p className='my-2 text-sm'>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <p className='my-2 text-sm'>
              This action cannot be undone. This will permanently delete your account and remove all
              of your data from our servers.
            </p>
            <p className='my-2 text-sm'>
              If you have current bookings or booking requests, you can not delete your account.
            </p>
            <p className='my-2 text-sm'>If you have any questions, please contact support.</p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive' disabled={isDeleting}>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove
                  all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className='bg-destructive hover:bg-destructive/90'
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
