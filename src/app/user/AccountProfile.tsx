'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { UpdateUser, UpdateUserSchema } from '@/lib/schema';
import { useAuth } from '@/hooks/useAuth';
import { useFileUploader } from '@/hooks/useFileUploader';
import { useToast } from '@/hooks/useToast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { updateUser } from './actions';

export function AccountProfile() {
  const { toast } = useToast();
  const { user, signOut, setUser } = useAuth();
  const form = useForm<UpdateUser>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
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
  });

  const { execute, status } = useAction(updateUser, {
    onSuccess: (result) => {
      setIsEditing(false);
      if (result.data?.user) {
        toast({
          title: 'Settings updated successfully',
        });
        setUser(result.data.user);
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

  return (
    <div className='w-full'>
      {/* Main Content */}
      <div className='flex-1 p-6'>
        <div className='max-w-3xl'>
          <h2 className='text-2xl font-semibold'>Profile details</h2>
          <Separator className='border-border my-6' />

          {/* Updated Profile Section */}
          <div className='mb-8 flex items-center justify-between'>
            <div className='flex items-start gap-4'>
              <label htmlFor='image-uploader-input'>
                <Avatar className='group relative h-16 w-16 cursor-pointer hover:opacity-90'>
                  <AvatarImage src={user?.imageUrl ?? '/placeholder.png'} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </label>
              <input
                id='image-uploader-input'
                type='file'
                className='hidden'
                onChange={handleFileSelect}
              />

              <div className='text-start'>
                <h3 className='text-lg font-medium'>
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className='text-muted-foreground'>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className='mb-8 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Name</h3>
              <Button
                variant='outline'
                onClick={() => setIsEditing(!isEditing)}
                disabled={status === 'executing'}
                className='border-border'
              >
                {isEditing ? 'Cancel' : 'Edit name'}
              </Button>
            </div>

            {isEditing ? (
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
            ) : (
              <p className='text-muted-foreground'>
                {user?.firstName} {user?.lastName}
              </p>
            )}
          </div>

          {/* Email Section */}
          <div className='mb-8'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Email addresses</h3>
              <Button variant='ghost' size='sm' className='border-border hover:bg-accent'>
                ...
              </Button>
            </div>
            <div className='mb-2 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span>john@example.com</span>
                <Badge variant='secondary'>Primary</Badge>
              </div>
            </div>
            <Button variant='outline' size='sm' className='border-border mt-4'>
              <span className='mr-2'>+</span> Add email address
            </Button>
          </div>

          {/* Connected Accounts Section */}
          <div>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-medium'>Connected accounts</h3>
              <Button variant='ghost' size='sm' className='border-border'>
                ...
              </Button>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <svg className='h-5 w-5' viewBox='0 0 24 24'>
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </svg>
                <span>Google</span>
                <span className='text-muted-foreground'>john@example.com</span>
              </div>
            </div>
            <Button variant='outline' size='sm' className='border-border mt-4'>
              <span className='mr-2'>+</span> Connect account
            </Button>
          </div>

          <Separator className='border-border my-8' />

          <div>
            <Button
              variant='destructive'
              onClick={async () => {
                await signOut();
                redirect('/');
              }}
              className='flex items-center gap-2'
            >
              <LogOut className='h-4 w-4' />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
