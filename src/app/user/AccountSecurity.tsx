'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

import logger from '@/utils/logger';

import { deleteAccount } from './actions';

export function AccountSecurity() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className='max-w-3xl'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium'>Security Settings</h3>
            <p className='text-muted-foreground text-sm'>Manage your account security and data.</p>
          </div>

          <div className='my-8 space-y-4'>
            <div>
              <h3 className='text-destructive text-lg font-medium'>Danger Zone</h3>
              <p className='my-2 text-sm'>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <p className='my-2 text-sm'>
                This action cannot be undone. This will permanently delete your account and remove
                all of your data from our servers.
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
                    This action cannot be undone. This will permanently delete your account and
                    remove all of your data from our servers.
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
    </div>
  );
}
