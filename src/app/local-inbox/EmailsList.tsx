'use client';

import { LocalEmail } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';

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
import { ScrollArea } from '@/components/ui/scroll-area';

import { deleteAllEmails } from './action';
import { EmailContent } from './EmailContent';
import { EmailListItem } from './EmailListItem';

interface EmailsListProps {
  emails: LocalEmail[];
}

export default function EmailsList({ emails }: EmailsListProps) {
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(emails[0] ?? null);
  const router = useRouter();
  const { toast } = useToast();

  const { execute: executeDelete, status } = useAction(deleteAllEmails, {
    onSuccess: () => {
      toast({
        title: 'All emails deleted successfully',
        variant: 'default',
        duration: 500,
      });
      router.refresh();
    },
    onError: (result) => {
      toast({
        title: 'Failed to delete emails',
        description: result?.error.serverError?.error ?? 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className='flex h-full min-h-screen flex-1 flex-col'>
      <header className='border-border flex items-center justify-between border-b p-4'>
        <h1 className='text-2xl font-semibold'>Local Email Inbox</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' disabled={status === 'executing'}>
              <Trash2 className='mr-2 h-4 w-4' />
              {status === 'executing' ? 'Deleting...' : 'Delete All'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all emails?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all emails from the local
                inbox.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => executeDelete()}>Delete All</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      <div className='grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-3'>
        <ScrollArea className='border-border md:col-span-1 md:border-r'>
          <ul>
            {emails.map((email) => (
              <EmailListItem
                data-testid='email-list-item'
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => setSelectedEmail(email)}
              />
            ))}
          </ul>
        </ScrollArea>

        <div className='flex flex-col overflow-hidden md:col-span-2'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={selectedEmail?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className='flex-1 overflow-hidden overflow-y-auto'
            >
              {selectedEmail ? (
                <EmailContent email={selectedEmail} />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <p className='text-muted-foreground'>Select an email to view its content</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
