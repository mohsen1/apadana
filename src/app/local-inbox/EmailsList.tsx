'use client';

import { LocalEmail } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import { EmailContent } from './EmailContent';
import { EmailListItem } from './EmailListItem';

interface EmailsListProps {
  emails: LocalEmail[];
}

export default function EmailsList({ emails }: EmailsListProps) {
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(emails[0] ?? null);

  return (
    <div className='flex h-screen flex-col'>
      <header className='border-border border-b p-4'>
        <h1 className='text-2xl font-semibold'>Local Email Inbox</h1>
      </header>

      <div className='grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-3'>
        <ScrollArea className='border-border md:col-span-1 md:border-r'>
          <ul>
            {emails.map((email) => (
              <EmailListItem
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
              className='flex-1 overflow-hidden'
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
