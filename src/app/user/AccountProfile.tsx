'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Shield, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { UpdateUser, UpdateUserSchema } from '@/lib/schema';
import { useAuth } from '@/hooks/useAuth';
import { useFileUploader } from '@/hooks/useFileUploader';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { updateUser } from './actions';
import { addEmailAddress, deleteEmailAddress, setPrimaryEmail } from './actions';
import { resendEmailVerification } from './actions';

export function AccountProfile() {
  const { toast } = useToast();
  const { user, signOut, fetchUser } = useAuth();
  const form = useForm<UpdateUser>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      id: user?.id ?? undefined,
      firstName: user?.firstName ?? undefined,
      lastName: user?.lastName ?? undefined,
      imageUrl: user?.imageUrl ?? undefined,
    },
  });
  const { handleFileSelect } = useFileUploader({
    initialFiles: [
      {
        key: user?.imageUrl ?? '',
        file: new File([], ''),
        status: 'success',
        uploadedUrl: user?.imageUrl ?? '',
        localUrl: user?.imageUrl ?? '',
        progress: 100,
      },
    ],
    onUploadSuccess: ([file]) => {
      execute({ ...form.getValues(), imageUrl: file.uploadedUrl });
    },
    onUploadError: (error) => {
      toast({
        title: 'Error uploading file',
        description: error.message,
      });
    },
  });

  const { execute, status } = useAction(updateUser, {
    onSuccess: (result) => {
      setIsEditing(false);
      if (result.data?.user) {
        toast({
          title: 'Settings updated successfully',
        });
        fetchUser();
      }
    },
    onError: (error) => {
      toast({
        title: 'Error updating user',
        description: error.error.serverError?.error || 'Failed to update user',
      });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    execute(data);
  };

  const userInitials = `${user?.firstName?.[0] ?? ''} ${user?.lastName?.[0] ?? ''}`;

  const [isEditing, setIsEditing] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const { execute: addEmailAction, status: addEmailStatus } = useAction(addEmailAddress, {
    onSuccess: () => {
      toast({
        title: 'Email added successfully',
        description: 'Please check your inbox for verification instructions.',
      });
      setShowAddEmail(false);
      fetchUser();
    },
    onError: (error) => {
      toast({
        title: 'Error adding email',
        description: error.error.serverError?.error || 'Failed to add email',
        variant: 'destructive',
      });
    },
  });
  const { execute: setPrimaryEmailAction } = useAction(setPrimaryEmail, {
    onSuccess: () => {
      toast({
        title: 'Primary email updated successfully',
      });
      fetchUser();
    },
    onError: (error) => {
      toast({
        title: 'Error updating primary email',
        description: error.error.serverError?.error || 'Failed to update primary email',
        variant: 'destructive',
      });
    },
  });
  const { execute: deleteEmailAction } = useAction(deleteEmailAddress, {
    onSuccess: () => {
      toast({
        title: 'Email address deleted',
      });
      fetchUser();
    },
    onError: (error) => {
      toast({
        title: 'Error deleting email',
        description: error.error.serverError?.error || 'Failed to delete email',
        variant: 'destructive',
      });
    },
  });
  const { execute: resendVerificationAction } = useAction(resendEmailVerification, {
    onSuccess: () => {
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox for verification instructions.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error sending verification email',
        description: error.error.serverError?.error || 'Failed to send verification email',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className='flex-1 p-6'>
      <div className='max-w-3xl'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium'>Profile</h3>
            <p className='text-muted-foreground text-sm'>
              This is how others will see you on the site.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <label htmlFor='image-uploader-input' className='cursor-pointer'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={user?.imageUrl ?? '/placeholder.png'} alt='Profile' />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </label>
            <input
              id='image-uploader-input'
              type='file'
              className='hidden'
              onChange={handleFileSelect}
            />
            <div>
              <h4 className='text-base font-medium'>
                {user?.firstName} {user?.lastName}
              </h4>
              <p className='text-muted-foreground text-sm'>{user?.email}</p>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='my-8'>
            <div>
              <h3 className='text-lg font-medium'>Name</h3>
              <p className='text-muted-foreground text-sm'>
                Please enter your full name or a display name you are comfortable with.
              </p>
              <p className='text-muted-foreground text-sm'>
                Your last name will not be shown to others.
              </p>
            </div>
            {!isEditing ? (
              <div className='grid grid-cols-2 gap-4 py-4'>
                <div>
                  <p className='text-muted-foreground text-sm'>First name</p>
                  <p className='text-sm font-medium'>{user?.firstName}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-sm'>Last name</p>
                  <p className='text-sm font-medium'>{user?.lastName}</p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsEditing(true)}
                    disabled={status === 'executing'}
                    className='shrink-0'
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className='rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900'>
                <div className='mb-4 flex items-center justify-between'>
                  <h4 className='font-medium'>Edit Name</h4>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsEditing(false)}
                    className='h-8 w-8'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName'>First name</Label>
                      <Input
                        id='firstName'
                        {...form.register('firstName')}
                        placeholder='Enter first name'
                        className='border-border'
                      />
                      {form.formState.errors.firstName && (
                        <p className='text-destructive text-sm'>
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='lastName'>Last name</Label>
                      <Input
                        id='lastName'
                        {...form.register('lastName')}
                        placeholder='Enter last name'
                        className='border-border'
                      />
                      {form.formState.errors.lastName && (
                        <p className='text-destructive text-sm'>
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type='submit' disabled={status === 'executing'}>
                    {status === 'executing' ? 'Saving...' : 'Save changes'}
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className='my-8 space-y-4'>
            <div>
              <h3 className='text-lg font-medium'>Email addresses</h3>
              <p className='text-muted-foreground text-sm'>
                Manage your email addresses and notification preferences.
              </p>
            </div>

            <div className='space-y-4'>
              {user?.emailAddresses?.map((email) => (
                <div
                  key={email.id}
                  className='border-border flex min-h-20 flex-col items-start justify-between space-y-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:space-y-0'
                >
                  <div className='w-full space-y-2 sm:w-auto'>
                    <p className='break-all text-sm font-medium'>{email.emailAddress}</p>
                    <div className='flex flex-wrap items-center gap-2'>
                      {email.isPrimary && <Badge variant='secondary'>Primary</Badge>}
                      {email.verified ? (
                        <Badge variant='secondary' className='bg-green-500/10 text-green-500'>
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='text-muted-foreground'>
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className='flex w-full justify-end gap-2 sm:w-auto'>
                    {!email.isPrimary && !email.verified && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => setPrimaryEmailAction({ emailAddressId: email.id })}
                      >
                        Make Primary
                      </Button>
                    )}
                    {email.verified && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          resendVerificationAction({ emailAddress: email.emailAddress })
                        }
                      >
                        Resend Verification
                      </Button>
                    )}
                    {!email.isPrimary && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='ghost' size='sm' className='text-destructive'>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete email address?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {email.emailAddress}? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEmailAction({ emailAddressId: email.id })}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}

              {showAddEmail ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    addEmailAction({ emailAddress: email });
                  }}
                  className='mt-4 flex gap-2'
                >
                  <Input
                    name='email'
                    type='email'
                    placeholder='Enter email address'
                    className='border-border'
                    required
                  />
                  <Button type='submit' disabled={addEmailStatus === 'executing'}>
                    {addEmailStatus === 'executing' ? 'Adding...' : 'Add'}
                  </Button>
                  <Button type='button' variant='ghost' onClick={() => setShowAddEmail(false)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className='border-border mt-4'
                  onClick={() => setShowAddEmail(true)}
                >
                  <span className='mr-2'>+</span> Add email address
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className='border-border mt-6 border-t pt-6'>
          <Button
            variant='outline'
            onClick={async () => {
              await signOut();
              redirect('/');
            }}
            className='text-destructive hover:bg-destructive/10 hover:text-destructive'
          >
            <LogOut className='mr-2 h-4 w-4' />
            Sign out
          </Button>
        </div>

        {user?.isAdmin && (
          <div className='text-muted-foreground mt-4 flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            <span className='text-sm'>Administrator</span>
          </div>
        )}

        {user?.isAdmin && (
          <Button variant='outline' className='mt-4' href='/admin' asChild>
            Admin Tools
          </Button>
        )}
      </div>
    </div>
  );
}
